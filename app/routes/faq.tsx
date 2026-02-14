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
                Select a nominee in each category. Enter a bet amount. Lock your
                pick. Locked picks cannot be changed.
              </p>
            </div>

            <div>
              <h2 className="h2 mb-2 text-[#FFDA71] !text-lg md:!text-xl">
                What are the odds?
              </h2>
              <p className="h3 !text-sm md:!text-base">
                American betting odds. Negative numbers (e.g., -150) are
                favorites: bet $150 to win $100. Positive numbers (e.g., +200)
                are underdogs: bet $100 to win $200.
              </p>
            </div>

            <div>
              <h2 className="h2 mb-2 text-[#FFDA71] !text-lg md:!text-xl">
                How do I make a pick?
              </h2>
              <p className="h3 !text-sm md:!text-base">
                Go to Make Selections. Click a nominee. Enter bet amount. Click
                "Lock This Pick". Pick is now committed.
              </p>
            </div>

            <div>
              <h2 className="h2 mb-2 text-[#FFDA71] !text-lg md:!text-xl">
                Can I change a locked pick?
              </h2>
              <p className="h3 !text-sm md:!text-base">
                No. Once locked, picks are final. You can make unlocked picks
                anytime before locking.
              </p>
            </div>

            <div>
              <h2 className="h2 mb-2 text-[#FFDA71] !text-lg md:!text-xl">
                What is the Portfolio page?
              </h2>
              <p className="h3 !text-sm md:!text-base">
                Shows all your locked picks. Displays total bet amount,
                potential profit, and total return if all picks win.
              </p>
            </div>

            <div>
              <h2 className="h2 mb-2 text-[#FFDA71] !text-lg md:!text-xl">
                Do I have to pick in every category?
              </h2>
              <p className="h3 !text-sm md:!text-base">
                No. Pick as many or few categories as you want. Only locked
                picks with bet amounts count.
              </p>
            </div>

            <div>
              <h2 className="h2 mb-2 text-[#FFDA71] !text-lg md:!text-xl">
                What happens if I don't set a bet amount?
              </h2>
              <p className="h3 !text-sm md:!text-base">
                You cannot lock a pick without a bet amount. The lock button is
                disabled until you enter an amount greater than zero.
              </p>
            </div>

            <div>
              <h2 className="h2 mb-2 text-[#FFDA71] !text-lg md:!text-xl">
                Can I lock all my picks at once?
              </h2>
              <p className="h3 !text-sm md:!text-base">
                Yes. The "Lock All Picks" button at the bottom of the ballot
                locks all unlocked picks that have bet amounts. A confirmation
                modal shows what will be locked.
              </p>
            </div>

            <div>
              <h2 className="h2 mb-2 text-[#FFDA71] !text-lg md:!text-xl">
                What is "Clear Unlocked Picks"?
              </h2>
              <p className="h3 !text-sm md:!text-base">
                Deletes all unlocked selections and bet amounts. Locked picks
                are not affected. Action cannot be undone.
              </p>
            </div>

            <div>
              <h2 className="h2 mb-2 text-[#FFDA71] !text-lg md:!text-xl">
                How is profit calculated?
              </h2>
              <p className="h3 !text-sm md:!text-base">
                For favorites (negative odds): profit = bet × (100 / |odds|).
                For underdogs (positive odds): profit = bet × (odds / 100).
                Total return = bet + profit.
              </p>
            </div>

            <div>
              <h2 className="h2 mb-2 text-[#FFDA71] !text-lg md:!text-xl">
                When are the Oscars?
              </h2>
              <p className="h3 !text-sm md:!text-base">
                March 15, 2026. Lock deadline is March 13, 2026.
              </p>
            </div>

            <div>
              <h2 className="h2 mb-2 text-[#FFDA71] !text-lg md:!text-xl">
                Is this real money?
              </h2>
              <p className="h3 !text-sm md:!text-base">
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
