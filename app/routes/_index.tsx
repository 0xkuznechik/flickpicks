import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getUser } from "../utils/auth.server";
import { getTopNominatedMovies } from "../lib/ballot-stats";

const keyDates = [
  { date: "Jan 22", event: "98th Oscars Nominations Announcement" },
  {
    date: "Jan 27",
    event: "British Academy Film Awards (BAFTA) Nominations Announcement",
  },
  {
    date: "Jan 27",
    event: "American Cinema Editors (ACE) Nominations Announcement",
  },
  {
    date: "Jan 27",
    event: "Writers Guild of America (WGA) Nominations Announcement",
  },
  { date: "Feb 7", event: "Directors Guild of America (DGA) Awards Ceremony" },
  { date: "Feb 10", event: "Oscars Nominees Luncheon", highlight: true },
  { date: "Feb 12", event: "Costume Designers Guild (CDG) Awards Ceremony" },
  {
    date: "Feb 14",
    event: "Make-Up Artists & Hair Stylists Guild (MUAHS) Awards Ceremony",
  },
  { date: "Feb 15", event: "Film Independent Spirit Awards Ceremony" },
  { date: "Feb 21", event: "Annie Awards Ceremony" },
  { date: "Feb 21", event: "Set Decorators Society of America (SDSA) Awards" },
  {
    date: "Feb 22",
    event:
      "British Academy of Film and Television Arts (BAFTA) Awards Ceremony",
  },
  { date: "Feb 26", event: "Finals Voting Begins", highlight: true },
  { date: "Feb 27", event: "American Cinema Editors (ACE) Awards Ceremony" },
  { date: "Feb 28", event: "Producers Guild of America (PGA) Awards Ceremony" },
  {
    date: "March 1",
    event: "Actor Awards presented by SAG-AFTRA Awards Ceremony",
  },
  { date: "March 5", event: "Finals Voting Ends", highlight: true },
  { date: "March 8", event: "Writers Guild of America (WGA) Awards Ceremony" },
  {
    date: "March 8",
    event: "American Society of Cinematographers (ASC) Awards Ceremony",
  },
  {
    date: "March 13",
    event: "LAST DAY TO LOCK IN BETS",
    highlight: true,
    color: "text-gold-400",
  },
  { date: "March 15", event: "98th Oscars Awards Ceremony", highlight: true },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  const topMovies = getTopNominatedMovies(5);
  return json({ user, topMovies });
}

export default function Index() {
  const { user, topMovies } = useLoaderData<typeof loader>();
  const ctaHref = user ? "/ballot" : "/login";

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-gold-500/30">
      {/* Sticky Header Container */}
      <div className="sticky top-0 z-50 bg-black">
        {/* Navigation */}
        <nav className="border-b border-white/10 bg-black py-4">
        <div className="container-pad flex items-center justify-between">
          <div className="flex-1"></div> {/* Spacer to center logo */}
          <div className="flex items-center gap-3">
            <span className="font-[var(--font-inter)] text-5xl tracking-widest text-gold-400">
              FLICK
            </span>
            <img
              src="/images/oscarspoollogo.png"
              alt="Logo"
              className="h-10 w-auto"
            />{" "}
            {/* Assuming generic logo or statuette */}
            <span className="font-[var(--font-inter)] text-5xl tracking-widest text-gold-400">
              PICKS
            </span>
          </div>
          <div className="flex-1 flex justify-end gap-4">
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
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-zinc-400">{user.email}</span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex justify-center gap-8 border-t border-white/10 py-3 text-2xl font-medium tracking-wide text-zinc-400">
          <Link to="/" className="text-gold-400 hover:text-gold-300">
            Home
          </Link>
          <Link to="/ballot" className="hover:text-zinc-200">
            Make Selections
          </Link>
          <Link to="/portfolio" className="hover:text-zinc-200">
            Portfolio
          </Link>
        </div>
      </nav>
      </div>

      <main className="container-pad space-y-20 py-12">
        {/* Most Nominated Movies */}
        <section className="rounded-2xl border border-white/10 bg-zinc-900/30 p-8 text-center">
          <h2 className="mb-8 font-[var(--font-inter)] text-5xl font-bold text-white">
            Most Nominated Movies
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {topMovies.map((movie) => (
              <div key={movie.movieName} className="flex flex-col gap-3">
                <div className="aspect-[2/3] w-full rounded bg-zinc-800 overflow-hidden">
                  {movie.movieData?.poster ? (
                    <img
                      src={movie.movieData.poster}
                      alt={movie.movieName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      No Poster
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                    {movie.movieName}
                  </div>
                  <div className="text-[10px] text-gold-400">
                    {movie.nominationCount} nominations
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA 1 */}
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent"></div>
          <Link
            to={ctaHref}
            className="rounded bg-gold-400 px-10 py-3 text-lg font-bold text-black shadow-[0_0_20px_rgba(231,200,106,0.3)] hover:bg-gold-500 hover:shadow-[0_0_30px_rgba(231,200,106,0.5)] transition-all"
          >
            Bet Now!
          </Link>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent"></div>
        </div>

        {/* Key Event Dates */}
        <section className="rounded-2xl border border-white/10 bg-zinc-900/30 p-8">
          <h2 className="mb-8 text-center font-[var(--font-inter)] text-5xl font-bold text-white">
            Key Event Dates
          </h2>
          <div className="mx-auto max-w-3xl space-y-3">
            {keyDates.map((item, idx) => (
              <div key={idx} className="flex gap-3 text-sm">
                <span
                  className={`w-20 flex-shrink-0 font-bold ${
                    item.color || "text-gold-400"
                  }`}
                >
                  {item.date} —
                </span>
                <span
                  className={
                    item.highlight
                      ? "font-semibold text-white"
                      : "text-zinc-400"
                  }
                >
                  {item.event}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA 2 */}
        <div className="flex items-center gap-4 pb-12">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent"></div>
          <Link
            to={ctaHref}
            className="rounded bg-gold-400 px-10 py-3 text-lg font-bold text-black shadow-[0_0_20px_rgba(231,200,106,0.3)] hover:bg-gold-500 hover:shadow-[0_0_30px_rgba(231,200,106,0.5)] transition-all"
          >
            Bet Now!
          </Link>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent"></div>
        </div>
      </main>

      <footer className="py-12 text-center text-sm font-bold text-zinc-500">
        2026 Powered by AiTI
      </footer>
    </div>
  );
}
