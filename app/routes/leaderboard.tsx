import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { prisma } from "../utils/db.server";
import { getUser } from "../utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const viewer = await getUser(request);
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      lockedAt: true,
      _count: { select: { picks: true } },
    },
    orderBy: { email: "asc" },
  });
  return json({ viewer, users });
}

export default function Leaderboard() {
  const { viewer, users } = useLoaderData<typeof loader>();
  return (
    <div className="min-h-screen bg-radial-ink">
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">
              Status
            </div>
            <h1 className="font-[var(--font-inter)] text-5xl text-zinc-100">
              Leaderboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Picks submitted and lock status. Add scoring once winners are
              known.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/"
              className="rounded-md border border-white/10 bg-white/[0.02] px-4 py-2 text-sm text-zinc-200 hover:bg-white/[0.04]"
            >
              Back home
            </Link>
            <Link
              to={viewer ? "/ballot" : "/login"}
              className="rounded-md border border-gold-400/40 bg-gold-400 px-4 py-2 text-sm font-medium text-ink-950 shadow-glow hover:bg-gold-500"
            >
              {viewer ? "Go to ballot" : "Log in"}
            </Link>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.02] text-zinc-300">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Picks</th>
                  <th className="px-4 py-3 font-medium">Locked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.map((u) => (
                  <tr key={u.id} className="text-zinc-200">
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u._count.picks}</td>
                    <td className="px-4 py-3 text-zinc-400">
                      {u.lockedAt ? new Date(u.lockedAt).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
