import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { BALLOT_CATEGORIES, formatNominee } from "../lib/ballot-data";
import {
  formatOdds,
  calculateProfit,
  calculateTotalReturn,
} from "../lib/betting-utils";
import { prisma } from "../utils/db.server";
import { getUser } from "../utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);

  let enrichedPicks: any[] = [];
  let totals = { betAmount: 0, potentialProfit: 0, totalReturn: 0 };

  // Only fetch picks if user is logged in
  if (user) {
    // Fetch all locked picks for the user
    const lockedPicks = await prisma.pick.findMany({
      where: {
        userId: user.id,
        lockedAt: { not: null },
      },
      select: {
        id: true,
        categoryKey: true,
        nominee: true,
        betAmount: true,
        lockedAt: true,
      },
      orderBy: { lockedAt: "asc" },
    });

    // Enrich picks with category info and odds
    enrichedPicks = lockedPicks.map((pick) => {
      const category = BALLOT_CATEGORIES.find((c) => c.key === pick.categoryKey);
      const nominee = category?.nominees.find(
        (n) => formatNominee(n) === pick.nominee
      );

      const odds = nominee?.odds || null;
      const betAmount = parseFloat(pick.betAmount.toString());

      return {
        id: pick.id,
        categoryKey: pick.categoryKey,
        categoryTitle: category?.title || pick.categoryKey,
        nominee: pick.nominee,
        odds,
        betAmount,
        potentialProfit:
          odds && betAmount > 0 ? calculateProfit(betAmount, odds) : 0,
        totalReturn:
          odds && betAmount > 0 ? calculateTotalReturn(betAmount, odds) : 0,
        lockedAt: pick.lockedAt,
      };
    });

    // Calculate totals
    totals = enrichedPicks.reduce(
      (acc, pick) => ({
        betAmount: acc.betAmount + pick.betAmount,
        potentialProfit: acc.potentialProfit + pick.potentialProfit,
        totalReturn: acc.totalReturn + pick.totalReturn,
      }),
      { betAmount: 0, potentialProfit: 0, totalReturn: 0 }
    );
  }

  return json({ user, lockedPicks: enrichedPicks, totals });
}

export default function Portfolio() {
  const { user, lockedPicks, totals } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-gold-500/30">
      {/* Sticky Header Container */}
      <div className="sticky top-0 z-50 bg-black">
        {/* Navigation */}
        <nav className="border-b border-white/10 bg-black py-4">
          <div className="container-pad flex items-center justify-between">
            <div className="flex-1"></div>
            <div className="flex items-center gap-3">
              <span className="font-[var(--font-inter)] text-5xl tracking-widest text-gold-400">
                FLICK
              </span>
              <img
                src="/images/oscarspoollogo.png"
                alt="Logo"
                className="h-10 w-auto"
              />
              <span className="font-[var(--font-inter)] text-5xl tracking-widest text-gold-400">
                PICKS
              </span>
            </div>
            <div className="flex-1 flex justify-end gap-4 items-center">
              {!user && (
                <>
                  <Link
                    to="/login"
                    className="text-xs font-semibold uppercase tracking-wider text-zinc-300 hover:text-white border border-zinc-700 px-3 py-1 rounded"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/join"
                    className="text-xs font-semibold uppercase tracking-wider text-black bg-gold-400 hover:bg-gold-500 px-3 py-1 rounded"
                  >
                    Sign Up
                  </Link>
                </>
              )}
              {user && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-xs text-zinc-400">{user.email}</span>
                  </div>
                  <Link
                    to="/logout"
                    className="text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
                  >
                    Logout
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-8 border-t border-white/10 py-3 text-2xl font-medium tracking-wide text-zinc-400">
            <Link to="/" className="hover:text-zinc-200">
              Home
            </Link>
            <Link to="/ballot" className="hover:text-zinc-200">
              Make Selections
            </Link>
            <Link to="/portfolio" className="text-gold-400 hover:text-gold-300">
              Portfolio
            </Link>
            <Link to="/faq" className="hover:text-zinc-200">
              FAQ
            </Link>
          </div>
        </nav>

        {/* Header Stats */}
        <div className="text-center space-y-6 py-6 border-b border-white/10 bg-black">
          <h1 className="font-[var(--font-inter)] text-5xl tracking-widest text-gold-400">
            MY PORTFOLIO
          </h1>
          <div className="flex justify-center gap-0 md:justify-center border border-gold-400/40 rounded-lg overflow-hidden max-w-4xl mx-auto divide-x divide-gold-400/40">
            <div className="flex-1 bg-black p-3 text-center">
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-300">
                Total Bet Amount
              </div>
              <div className="text-lg md:text-xl font-bold text-white">
                ${totals.betAmount.toFixed(2)}
              </div>
            </div>
            <div className="flex-1 bg-black p-3 text-center">
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-300">
                Potential Profit
              </div>
              <div className="text-lg md:text-xl font-bold text-gold-400">
                ${totals.potentialProfit.toFixed(2)}
              </div>
            </div>
            <div className="flex-1 bg-black p-3 text-center">
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-300">
                Total Return
              </div>
              <div className="text-lg md:text-xl font-bold text-green-400">
                ${totals.totalReturn.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container-pad py-8">
        {lockedPicks.length === 0 ? (
          <div className="max-w-3xl mx-auto text-center py-12">
            <p className="text-zinc-400 text-lg mb-6">
              {user ? "You haven't locked any picks yet." : "Sign up to lock your picks and build your portfolio!"}
            </p>
            <Link
              to={user ? "/ballot" : "/join"}
              className="inline-block rounded-full bg-gold-400 px-8 py-3 font-bold text-black shadow-[0_0_20px_rgba(231,200,106,0.3)] hover:bg-gold-500 hover:shadow-[0_0_30px_rgba(231,200,106,0.5)] transition-all"
            >
              {user ? "Make Your Picks" : "Sign Up to Get Started"}
            </Link>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gold-500/30">
                    <th className="text-left p-4 text-sm font-bold uppercase tracking-widest text-zinc-300">
                      Category
                    </th>
                    <th className="text-left p-4 text-sm font-bold uppercase tracking-widest text-zinc-300">
                      Nominee
                    </th>
                    <th className="text-center p-4 text-sm font-bold uppercase tracking-widest text-zinc-300">
                      Odds
                    </th>
                    <th className="text-right p-4 text-sm font-bold uppercase tracking-widest text-zinc-300">
                      Bet Amount
                    </th>
                    <th className="text-right p-4 text-sm font-bold uppercase tracking-widest text-zinc-300">
                      Potential Profit
                    </th>
                    <th className="text-right p-4 text-sm font-bold uppercase tracking-widest text-zinc-300">
                      Total Return
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lockedPicks.map((pick) => (
                    <tr
                      key={pick.id}
                      className="border-b border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4 text-sm text-zinc-300">
                        {pick.categoryTitle}
                      </td>
                      <td className="p-4 text-sm text-white font-medium">
                        {pick.nominee}
                      </td>
                      <td className="p-4 text-center text-sm text-gold-400 font-mono">
                        {pick.odds ? formatOdds(pick.odds) : "—"}
                      </td>
                      <td className="p-4 text-right text-sm text-white font-mono">
                        ${pick.betAmount.toFixed(2)}
                      </td>
                      <td className="p-4 text-right text-sm text-gold-400 font-mono font-semibold">
                        ${pick.potentialProfit.toFixed(2)}
                      </td>
                      <td className="p-4 text-right text-sm text-green-400 font-mono font-semibold">
                        ${pick.totalReturn.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr className="border-t-2 border-gold-500/50 bg-zinc-900/40">
                    <td
                      colSpan={3}
                      className="p-4 text-sm font-bold uppercase tracking-widest text-gold-400"
                    >
                      Totals
                    </td>
                    <td className="p-4 text-right text-sm font-bold text-white font-mono">
                      ${totals.betAmount.toFixed(2)}
                    </td>
                    <td className="p-4 text-right text-sm font-bold text-gold-400 font-mono">
                      ${totals.potentialProfit.toFixed(2)}
                    </td>
                    <td className="p-4 text-right text-sm font-bold text-green-400 font-mono">
                      ${totals.totalReturn.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {lockedPicks.map((pick) => (
                <div
                  key={pick.id}
                  className="rounded-lg border border-gold-500/30 bg-black p-4 space-y-3"
                >
                  <div className="border-b border-white/10 pb-2">
                    <div className="text-xs uppercase tracking-widest text-zinc-400">
                      {pick.categoryTitle}
                    </div>
                    <div className="text-base font-medium text-white mt-1">
                      {pick.nominee}
                    </div>
                    {pick.odds && (
                      <div className="text-xs text-gold-400 font-mono mt-1">
                        {formatOdds(pick.odds)}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Bet Amount:</span>
                      <span className="text-white font-mono">
                        ${pick.betAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Potential Profit:</span>
                      <span className="text-gold-400 font-mono font-semibold">
                        ${pick.potentialProfit.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Total Return:</span>
                      <span className="text-green-400 font-mono font-semibold">
                        ${pick.totalReturn.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Mobile Totals Card */}
              <div className="rounded-lg border-2 border-gold-500/50 bg-zinc-900/40 p-4 space-y-2">
                <div className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-3">
                  Totals
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-300">Total Bet Amount:</span>
                  <span className="text-white font-mono font-bold">
                    ${totals.betAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-300">Potential Profit:</span>
                  <span className="text-gold-400 font-mono font-bold">
                    ${totals.potentialProfit.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-300">Total Return:</span>
                  <span className="text-green-400 font-mono font-bold">
                    ${totals.totalReturn.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
