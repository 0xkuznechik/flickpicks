import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getUser } from "../utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  return json({ user });
}

export default function FAQ() {
  const { user } = useLoaderData<typeof loader>();

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
            <Link to="/portfolio" className="hover:text-zinc-200">
              Portfolio
            </Link>
            <Link to="/faq" className="text-gold-400 hover:text-gold-300">
              FAQ
            </Link>
          </div>
        </nav>
      </div>

      <main className="container-pad py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-[var(--font-inter)] text-4xl font-bold text-white mb-12">
            FAQ
          </h1>

          <div className="space-y-8 text-zinc-300">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                How does this work?
              </h2>
              <p>
                Select a nominee in each category. Enter a bet amount. Lock your
                pick. Locked picks cannot be changed.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                What are the odds?
              </h2>
              <p>
                American betting odds. Negative numbers (e.g., -150) are
                favorites: bet $150 to win $100. Positive numbers (e.g., +200)
                are underdogs: bet $100 to win $200.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                How do I make a pick?
              </h2>
              <p>
                Go to Make Selections. Click a nominee. Enter bet amount. Click
                "Lock This Pick". Pick is now committed.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Can I change a locked pick?
              </h2>
              <p>
                No. Once locked, picks are final. You can make unlocked picks
                anytime before locking.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                What is the Portfolio page?
              </h2>
              <p>
                Shows all your locked picks. Displays total bet amount,
                potential profit, and total return if all picks win.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Do I have to pick in every category?
              </h2>
              <p>
                No. Pick as many or few categories as you want. Only locked
                picks with bet amounts count.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                What happens if I don't set a bet amount?
              </h2>
              <p>
                You cannot lock a pick without a bet amount. The lock button is
                disabled until you enter an amount greater than zero.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Can I lock all my picks at once?
              </h2>
              <p>
                Yes. The "Lock All Picks" button at the bottom of the ballot
                locks all unlocked picks that have bet amounts. A confirmation
                modal shows what will be locked.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                What is "Clear Unlocked Picks"?
              </h2>
              <p>
                Deletes all unlocked selections and bet amounts. Locked picks
                are not affected. Action cannot be undone.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                How is profit calculated?
              </h2>
              <p>
                For favorites (negative odds): profit = bet × (100 / |odds|).
                For underdogs (positive odds): profit = bet × (odds / 100).
                Total return = bet + profit.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                When are the Oscars?
              </h2>
              <p>March 15, 2026. Lock deadline is March 13, 2026.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Is this real money?
              </h2>
              <p>
                This is a demonstration application. No real money is exchanged.
                Authentication is not production-ready.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-12 text-center text-sm font-bold text-zinc-500">
        Designed by Tim. Vibe-coded by Albert.
      </footer>
    </div>
  );
}
