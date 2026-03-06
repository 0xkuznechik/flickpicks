import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getUser } from "../utils/auth.server";
import { Header } from "../components/Header";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  return json({ user });
}

export default function FAQ() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-gold-500/30">
      <Header user={user} currentPage="faq" />

      <main className="container-pad py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="h1 mb-12 !text-3xl md:!text-4xl">FAQ</h1>

          <div className="space-y-12 text-zinc-300">
            <div>
              <h2 className="h2 mb-2 text-[#FFDA71] !text-lg md:!text-xl">
                How does this work?
              </h2>
              <p className="h3 !text-sm md:!text-base">
                You have a $1,000 budget to bet across 24 Oscar categories. Pick
                a nominee in any category, enter a bet amount, and save your
                picks. When you're ready, submit them all at once — submissions
                are final. Winners are scored the night of the ceremony.
              </p>
            </div>

            <div>
              <h2 className="h2 mb-2 text-[#FFDA71] !text-lg md:!text-xl">
                What are the odds?
              </h2>
              <p className="h3 !text-sm md:!text-base">
                Odds are in American format. A negative number like{" "}
                <span className="text-zinc-100">-150</span> means the nominee is
                a favorite: bet $150 to profit $100. A positive number like{" "}
                <span className="text-zinc-100">+300</span> means an underdog:
                bet $100 to profit $300. The bigger the positive number, the
                longer the odds — and the bigger the potential payout.
              </p>
            </div>

            <div>
              <h2 className="h2 mb-2 text-[#FFDA71] !text-lg md:!text-xl">
                How do I make a pick?
              </h2>
              <p className="h3 !text-sm md:!text-base">
                Go to Make Selections. Click any nominee to choose them, then
                enter a bet amount. Click "Save This Pick" to stage it for
                submission — saved picks can still be adjusted. When you're
                happy with everything, click "Submit All Saved Picks" to lock
                them in permanently.
              </p>
            </div>

            <div>
              <h2 className="h2 mb-2 text-[#FFDA71] !text-lg md:!text-xl">
                Can I change a submitted pick?
              </h2>
              <p className="h3 !text-sm md:!text-base">
                No. Submitted picks are final and cannot be edited or removed.
                You can revise saved picks as many times as you like before
                hitting submit.
              </p>
            </div>

            <div>
              <h2 className="h2 mb-2 text-[#FFDA71] !text-lg md:!text-xl">
                What are the heart picks?
              </h2>
              <p className="h3 !text-sm md:!text-base">
                The heart (♡) on each category is your personal rooting interest
                — who you hope wins, regardless of where you put your money.
                Hearts are just for fun, never affect scoring, and can be
                changed anytime.
              </p>
            </div>

            <div>
              <h2 className="h2 mb-2 text-[#FFDA71] !text-lg md:!text-xl">
                Do I have to pick every category?
              </h2>
              <p className="h3 !text-sm md:!text-base">
                No. Pick as many or as few as you like. Only submitted picks
                count toward your score.
              </p>
            </div>

            <div>
              <h2 className="h2 mb-2 text-[#FFDA71] !text-lg md:!text-xl">
                How is profit calculated?
              </h2>
              <p className="h3 !text-sm md:!text-base">
                For favorites (negative odds): profit = bet × (100 ÷ |odds|). A
                $150 bet at -150 profits $100, returning $250 total. For
                underdogs (positive odds): profit = bet × (odds ÷ 100). A $100
                bet at +300 profits $300, returning $400 total.
              </p>
            </div>

            <div>
              <h2 className="h2 mb-2 text-[#FFDA71] !text-lg md:!text-xl">
                When are the Oscars?
              </h2>
              <p className="h3 !text-sm md:!text-base">
                The ceremony is March 15, 2026. The submission deadline is March
                13, 2026.
              </p>
            </div>

            <div>
              <h2 className="h2 mb-2 text-[#FFDA71] !text-lg md:!text-xl">
                Is this real money?
              </h2>
              <p className="h3 !text-sm md:!text-base">
                No. This is a game between friends — no real money changes
                hands.
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
