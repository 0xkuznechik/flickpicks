import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useState, useEffect, useRef } from "react";
import { getUser } from "../utils/auth.server";
import { getTopNominatedMovies, type MovieStats } from "../lib/ballot-stats";
import { BALLOT_CATEGORIES } from "../lib/ballot-data";

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
  const topMovies = getTopNominatedMovies(10);
  return json({ user, topMovies });
}

export default function Index() {
  const { user, topMovies } = useLoaderData<typeof loader>();
  const [selectedMovie, setSelectedMovie] = useState<MovieStats | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedMovie) {
        setSelectedMovie(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedMovie]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

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
            <Link to="/" className="text-gold-400 hover:text-gold-300">
              Home
            </Link>
            <Link to="/ballot" className="hover:text-zinc-200">
              Make Selections
            </Link>
            <Link to="/portfolio" className="hover:text-zinc-200">
              Portfolio
            </Link>
            <Link to="/faq" className="hover:text-zinc-200">
              FAQ
            </Link>
          </div>
        </nav>
      </div>

      <main className="container-pad space-y-20 py-12">
        {/* Top 10 Most Nominated Movies */}
        <section className="rounded-2xl border border-white/10 bg-zinc-900/30 p-8 relative">
          {/* Left Arrow */}
          <button
            onClick={scrollLeft}
            className="absolute top-4 left-4 bg-black/80 hover:bg-black text-white p-1.5 rounded-full border border-gold-400/40 hover:border-gold-400 transition-all z-10"
            aria-label="Scroll left"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Right Arrow */}
          <button
            onClick={scrollRight}
            className="absolute top-4 right-4 bg-black/80 hover:bg-black text-white p-1.5 rounded-full border border-gold-400/40 hover:border-gold-400 transition-all z-10"
            aria-label="Scroll right"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <h2 className="text-center font-[var(--font-inter)] text-3xl font-bold text-white mb-8">
            Top 10 Most Nominated Movies
          </h2>

          <div className="relative">
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            >
              {topMovies.map((movie) => (
                <button
                  key={movie.movieName}
                  onClick={() => setSelectedMovie(movie)}
                  className="flex-shrink-0 w-48 flex flex-col gap-3 snap-start hover:opacity-80 transition-opacity"
                >
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
                  <div className="flex flex-col gap-1 text-left">
                    <div className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                      {movie.movieName}
                    </div>
                    <div className="text-[10px] text-gold-400">
                      {movie.nominationCount} nominations
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Key Event Dates */}
        <section className="rounded-2xl border border-white/10 bg-zinc-900/30 p-8">
          <h2 className="mb-8 text-center font-[var(--font-inter)] text-3xl font-bold text-white">
            Key Event Dates
          </h2>
          <div className="mx-auto max-w-4xl space-y-3">
            {keyDates.map((item, idx) => (
              <div key={idx} className="flex gap-4 text-sm">
                <span
                  className={`w-28 flex-shrink-0 font-bold ${
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
      </main>

      <footer className="py-12 text-center text-sm font-bold text-zinc-500">
        Designed by Tim. Vibe-coded by Albert.
      </footer>

      {/* Movie Nominations Modal */}
      {selectedMovie && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedMovie(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-gold-500/30 bg-zinc-900 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="font-[var(--font-inter)] text-2xl text-gold-400">
                {selectedMovie.movieName}
              </h2>
              <button
                onClick={() => setSelectedMovie(null)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <p className="text-zinc-300 text-sm mb-6">
              {selectedMovie.nominationCount}{" "}
              {selectedMovie.nominationCount === 1
                ? "nomination"
                : "nominations"}
            </p>

            <div className="space-y-2">
              {BALLOT_CATEGORIES.map((category) => {
                // Check if this category has any nominees from this movie
                const hasNomination = category.nominees.some((nominee) => {
                  // Check if the nominee's movie field matches
                  const movieField = nominee.movie;
                  if (movieField === selectedMovie.movieName) return true;

                  // Check if the nominee's name itself is the movie (e.g., Best Picture)
                  if (nominee.name === selectedMovie.movieName) return true;

                  return false;
                });

                if (!hasNomination) return null;

                // Get all nominees for this movie in this category
                const nominees = category.nominees.filter((nominee) => {
                  return (
                    nominee.movie === selectedMovie.movieName ||
                    nominee.name === selectedMovie.movieName
                  );
                });

                return (
                  <div
                    key={category.key}
                    className="border-b border-white/10 pb-2 last:border-b-0"
                  >
                    <div className="text-sm font-semibold text-white">
                      {category.title}
                    </div>
                    <div className="text-xs text-zinc-400 mt-1">
                      {nominees.map((nominee, idx) => (
                        <div key={idx}>{nominee.name}</div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setSelectedMovie(null)}
              className="mt-6 w-full px-6 py-2 rounded-lg bg-gold-400 text-black font-bold hover:bg-gold-500 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
