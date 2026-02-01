import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import { BALLOT_CATEGORIES, formatNominee } from "../lib/ballot-data";
import { prisma } from "../utils/db.server";
import { requireUser } from "../utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const picks = await prisma.pick.findMany({
    where: { userId: user.id },
    select: { categoryKey: true, nominee: true },
  });

  const pickMap: Record<string, string> = {};
  for (const p of picks) pickMap[p.categoryKey] = p.nominee;

  return json({ user, pickMap, categories: BALLOT_CATEGORIES });
}

type ActionData = { ok: true } | { ok: false; message: string } | undefined;

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  if (user.lockedAt) {
    return json<ActionData>(
      { ok: false, message: "Ballot is locked." },
      { status: 400 }
    );
  }

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "save");

  if (intent === "lock") {
    await prisma.user.update({
      where: { id: user.id },
      data: { lockedAt: new Date() },
    });
    return redirect("/ballot");
  }

  // Handle single category update (auto-save) or full save
  // We'll just process all keys present in the form
  const updates: Array<{ categoryKey: string; nominee: string }> = [];

  // If specific category is submitted (e.g. on change)
  const categoryKey = form.get("categoryKey");
  const nominee = form.get("nominee");

  if (categoryKey && nominee) {
    updates.push({
      categoryKey: String(categoryKey),
      nominee: String(nominee),
    });
  } else {
    // Fallback for full form submit if needed
    for (const c of BALLOT_CATEGORIES) {
      const val = form.get(c.key);
      if (typeof val === "string") {
        updates.push({ categoryKey: c.key, nominee: val });
      }
    }
  }

  if (updates.length > 0) {
    await prisma.$transaction(
      updates.map((u) =>
        prisma.pick.upsert({
          where: {
            userId_categoryKey: { userId: user.id, categoryKey: u.categoryKey },
          },
          create: {
            userId: user.id,
            categoryKey: u.categoryKey,
            nominee: u.nominee,
          },
          update: { nominee: u.nominee },
        })
      )
    );
  }

  return json<ActionData>({ ok: true });
}

export default function Ballot() {
  const { user, pickMap, categories } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const locked = Boolean(user.lockedAt);
  const submit = useSubmit();

  // Optimistic UI for picks
  const [localPicks, setLocalPicks] = useState(pickMap);

  // Sync with server data
  useEffect(() => {
    setLocalPicks(pickMap);
  }, [pickMap]);

  const handleSelect = (categoryKey: string, nominee: string) => {
    if (locked) return;
    setLocalPicks((prev) => ({ ...prev, [categoryKey]: nominee }));

    // Auto-save on selection
    const formData = new FormData();
    formData.append("intent", "save");
    formData.append("categoryKey", categoryKey);
    formData.append("nominee", nominee);
    submit(formData, { method: "post", replace: true });
  };

  const betsCast = Object.keys(localPicks).length;

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-gold-500/30">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black py-4">
        <div className="container-pad flex items-center justify-between">
          <div className="flex-1"></div>
          <div className="flex items-center gap-3">
            <span className="font-[var(--font-cinzel)] text-xl tracking-widest text-gold-400">
              FLICK
            </span>
            <img
              src="/images/oscars-statuettes.png"
              alt="Logo"
              className="h-10 w-auto"
            />
            <span className="font-[var(--font-cinzel)] text-xl tracking-widest text-gold-400">
              PICKS
            </span>
          </div>
          <div className="flex-1 flex justify-end gap-4 items-center">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-zinc-400">{user.email}</span>
            </div>
            {/* Logout could go here */}
          </div>
        </div>
        <div className="mt-4 flex justify-center gap-8 border-t border-white/10 py-3 text-sm font-medium tracking-wide text-zinc-400">
          <Link to="/" className="hover:text-zinc-200">
            Home
          </Link>
          <Link to="/ballot" className="text-gold-400 hover:text-gold-300">
            My Selections
          </Link>
        </div>
      </nav>

      <main className="container-pad py-8 space-y-8">
        {/* Header Stats */}
        <div className="text-center space-y-6">
          <h1 className="font-[var(--font-cinzel)] text-3xl font-bold tracking-tight text-white md:text-4xl">
            98th Academy Awards
          </h1>

          <div className="flex justify-center gap-0 md:justify-center border border-gold-400/40 rounded-lg overflow-hidden max-w-4xl mx-auto divide-x divide-gold-400/40">
            <div className="flex-1 bg-black p-3 text-center">
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-300">
                Movies
              </div>
              <div className="text-lg md:text-xl font-bold text-white">0</div>
            </div>
            <div className="flex-1 bg-black p-3 text-center">
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-300">
                Bets Cast
              </div>
              <div className="text-lg md:text-xl font-bold text-white">
                {betsCast}
              </div>
            </div>
            <div className="flex-1 bg-black p-3 text-center">
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-300">
                Bets Winning
              </div>
              <div className="text-lg md:text-xl font-bold text-white">0</div>
            </div>
            <div className="flex-1 bg-black p-3 text-center">
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-300">
                Total Payout
              </div>
              <div className="text-lg md:text-xl font-bold text-white">0</div>
            </div>
          </div>

          {locked && (
            <div className="inline-block rounded border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
              Ballot is locked.
            </div>
          )}
        </div>

        {/* Categories Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {categories.map((c) => (
            <div
              key={c.key}
              className="rounded-lg border border-gold-500/30 bg-black p-1"
            >
              <div className="text-center py-2 border-b border-white/10 bg-zinc-900/40 rounded-t">
                <h3 className="font-[var(--font-cinzel)] text-lg text-zinc-100">
                  {c.title}
                </h3>
              </div>
              <div className="p-3 space-y-1">
                {c.nominees.map((nominee) => {
                  const nomineeStr = formatNominee(nominee);
                  const isSelected = localPicks[c.key] === nomineeStr;
                  return (
                    <button
                      key={nomineeStr}
                      onClick={() => handleSelect(c.key, nomineeStr)}
                      disabled={locked}
                      className={`w-full text-left flex justify-between items-center px-3 py-2 rounded text-xs md:text-sm transition-colors ${
                        isSelected
                          ? "bg-white/10 text-green-400 font-semibold"
                          : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                      }`}
                    >
                      <span>{nomineeStr}</span>
                      {isSelected && (
                        <span className="text-xs uppercase tracking-wider text-green-500 font-bold bg-green-900/20 px-1.5 py-0.5 rounded">
                          Picked
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Floating Lock Button (if not locked) */}
        {!locked && (
          <div className="sticky bottom-6 flex justify-center">
            <Form
              method="post"
              className="bg-black/80 backdrop-blur p-2 rounded-full border border-white/10 shadow-xl"
            >
              <input type="hidden" name="intent" value="lock" />
              <button
                type="submit"
                className="rounded-full bg-gold-400 px-8 py-3 font-bold text-black shadow-glow hover:bg-gold-500"
                onClick={(e) => {
                  if (
                    !confirm(
                      "Are you sure you want to lock your ballot? You won't be able to make changes."
                    )
                  ) {
                    e.preventDefault();
                  }
                }}
              >
                Lock Ballot
              </button>
            </Form>
          </div>
        )}
      </main>
    </div>
  );
}
