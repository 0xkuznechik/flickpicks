import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { BALLOT_CATEGORIES } from "../lib/ballot-data";
import { prisma } from "../utils/db.server";
import { requireUser } from "../utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const picks = await prisma.pick.findMany({
    where: { userId: user.id },
    select: { categoryKey: true, nominee: true }
  });

  const pickMap: Record<string, string> = {};
  for (const p of picks) pickMap[p.categoryKey] = p.nominee;

  return json({ user, pickMap, categories: BALLOT_CATEGORIES });
}

type ActionData =
  | { ok: true }
  | { ok: false; message: string }
  | undefined;

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  if (user.lockedAt) {
    return json<ActionData>({ ok: false, message: "Ballot is locked." }, { status: 400 });
  }

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "save");

  if (intent === "lock") {
    await prisma.user.update({
      where: { id: user.id },
      data: { lockedAt: new Date() }
    });
    return redirect("/ballot");
  }

  const updates: Array<{ categoryKey: string; nominee: string }> = [];
  for (const c of BALLOT_CATEGORIES) {
    const nominee = String(form.get(c.key) ?? "").trim();
    if (nominee) updates.push({ categoryKey: c.key, nominee });
  }

  await prisma.$transaction(
    updates.map((u) =>
      prisma.pick.upsert({
        where: { userId_categoryKey: { userId: user.id, categoryKey: u.categoryKey } },
        create: { userId: user.id, categoryKey: u.categoryKey, nominee: u.nominee },
        update: { nominee: u.nominee }
      })
    )
  );

  return json<ActionData>({ ok: true });
}

export default function Ballot() {
  const { user, pickMap, categories } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const locked = Boolean(user.lockedAt);

  return (
    <div className="container-pad py-10 md:py-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Ballot</h1>
          <p className="mt-2 text-zinc-300">Make your picks. When you’re ready, lock your ballot.</p>
          <div className="mt-2 small-muted">
            Status: {locked ? `Locked (${new Date(user.lockedAt!).toLocaleString()})` : "Editable"}
          </div>
        </div>

        <div className="flex gap-3">
          <a className="btn" href="/">Home</a>
          {!locked ? (
            <Form method="post">
              <input type="hidden" name="intent" value="lock" />
              <button type="submit" className="btn btn-primary">
                Lock ballot
              </button>
            </Form>
          ) : null}
        </div>
      </div>

      {actionData && !actionData.ok ? (
        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-200">
          {actionData.message}
        </div>
      ) : actionData && actionData.ok ? (
        <div className="mt-6 rounded-xl border border-gold-500/20 bg-gold-500/10 p-4 text-gold-200">
          Saved.
        </div>
      ) : null}

      <Form method="post" className="mt-8 grid gap-4">
        <input type="hidden" name="intent" value="save" />

        {categories.map((c) => (
          <div key={c.key} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold">{c.title}</div>
                <div className="small-muted mt-1">Pick one nominee</div>
              </div>
              <div className="small-muted">
                Current: <span className="text-zinc-200">{pickMap[c.key] ?? "—"}</span>
              </div>
            </div>

            <div className="mt-4">
              <select
                name={c.key}
                className="input"
                defaultValue={pickMap[c.key] ?? ""}
                disabled={locked}
              >
                <option value="">Select…</option>
                {c.nominees.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn btn-primary" disabled={locked}>
            Save picks
          </button>
          <a className="btn" href="/api/academy-awards-summary" target="_blank" rel="noreferrer">
            Example API JSON
          </a>
        </div>

        {locked ? (
          <p className="small-muted">
            This ballot is locked. To allow edits again, clear <code className="text-zinc-200">lockedAt</code> in the
            DB for this user.
          </p>
        ) : (
          <p className="small-muted">
            Picks are stored in Postgres and keyed by <code className="text-zinc-200">(userId, categoryKey)</code>.
          </p>
        )}
      </Form>
    </div>
  );
}
