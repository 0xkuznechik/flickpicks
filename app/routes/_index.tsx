import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { getUser } from "../utils/auth.server";

type Ballot = {
  id: string;
  title: string;
  subtitle: string;
  thumbnailSrc: string;
};

type Movie = {
  id: string;
  title: string;
  year?: string;
  posterSrc: string;
};

const ballots: Ballot[] = [
  { id: "main", title: "Main ballot", subtitle: "All categories", thumbnailSrc: "/images/ballot.png" },
  { id: "acting", title: "Acting", subtitle: "Lead + supporting", thumbnailSrc: "/images/ballot.png" },
  { id: "craft", title: "Craft", subtitle: "Sound, VFX, editing…", thumbnailSrc: "/images/ballot.png" },
  { id: "shorts", title: "Shorts", subtitle: "All short categories", thumbnailSrc: "/images/ballot.png" },
  { id: "wildcard", title: "Wildcards", subtitle: "Tie-breakers", thumbnailSrc: "/images/ballot.png" }
];

const recommendedMovies: Movie[] = [
  { id: "one-battle", title: "One Battle After Another", year: "2025", posterSrc: "/images/poster-one-battle.png" },
  { id: "hamnet", title: "Hamnet", year: "2025", posterSrc: "/images/poster-hamnet.png" },
  { id: "sinners", title: "Sinners", year: "2025", posterSrc: "/images/poster-sinners.png" },
  { id: "jay-kelly", title: "Jay Kelly", year: "2025", posterSrc: "/images/poster-jay-kelly.png" },
  { id: "wicked", title: "Wicked: For Good", year: "2025", posterSrc: "/images/poster-wicked.png" }
];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  return json({ user });
}

function SectionHeading(props: { kicker: string; title: string; description: string }) {
  return (
    <div className="space-y-2">
      <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">{props.kicker}</div>
      <h2 className="font-[var(--font-cinzel)] text-2xl tracking-tight text-zinc-100 sm:text-3xl">
        {props.title}
      </h2>
      <p className="max-w-2xl text-sm text-zinc-400">{props.description}</p>
    </div>
  );
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>();
  const ctaHref = user ? "/ballot" : "/login";
  const ctaLabel = user ? "Go to ballot" : "Fill out ballot";

  return (
    <div className="min-h-screen bg-radial-ink">
      <main className="mx-auto max-w-5xl space-y-16 px-4 py-10">
        {/* Hero */}
        <section className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-300">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400/90" />
              Oscars night — pool & watchlist
            </div>

            <h1 className="font-[var(--font-cinzel)] text-4xl leading-[1.05] sm:text-5xl">The Oscars Pool.</h1>

            <p className="max-w-xl text-sm text-zinc-400">
              A Remix + Prisma + Postgres starter with authentication and persisted picks. This landing page mirrors the
              earlier frontend-only layout so you can iterate on design while the backend is already in place.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to={ctaHref}
                className="rounded-md border border-gold-400/40 bg-gold-400 px-4 py-2 text-sm font-medium text-ink-950 shadow-glow hover:bg-gold-500"
              >
                {ctaLabel}
              </Link>
              <a
                href="#movies"
                className="rounded-md border border-white/10 bg-white/[0.02] px-4 py-2 text-sm text-zinc-200 hover:bg-white/[0.04]"
              >
                Recommended movies
              </a>
              <a
                href="/api/academy-awards-summary"
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-white/10 bg-white/[0.02] px-4 py-2 text-sm text-zinc-200 hover:bg-white/[0.04]"
              >
                Example API JSON
              </a>
            </div>

            {user ? (
              <div className="mt-2 max-w-xl rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-zinc-500">Signed in as</div>
                <div className="mt-1 font-medium text-zinc-100">{user.email}</div>
                <div className="mt-2 text-xs text-zinc-500">
                  Ballot status: {user.lockedAt ? `Locked (${new Date(user.lockedAt).toLocaleString()})` : "Editable"}
                </div>
              </div>
            ) : null}
          </div>

          <div className="relative mx-auto w-[min(360px,100%)]">
            <div className="card overflow-hidden">
              <div className="relative aspect-[362/512] w-full">
                <img src="/images/logo.png" alt="Oscars Pool" className="h-full w-full object-cover" />
              </div>
              <div className="p-6">
                <div className="font-[var(--font-cinzel)] text-xl">Oscars Pool</div>
                <div className="mt-1 text-sm text-zinc-400">Invite-only. Low friction. No spoilers.</div>
                <div className="mt-4 text-xs text-zinc-400">
                  Customize this card to show the deadline, buy-in, payout rules, and the group link.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Rules */}
        <section id="rules" className="scroll-mt-24 space-y-6">
          <SectionHeading
            kicker="How it works"
            title="Rules + scoring"
            description="Keep this section short on the landing page; link out to a detailed rules doc if needed."
          />

          <div className="grid gap-6 md:grid-cols-[0.95fr_1.05fr] md:items-start">
            <div className="card overflow-hidden">
              <div className="relative aspect-[992/558] w-full">
                <img src="/images/oscars-statuettes.png" alt="Oscars statuettes" className="h-full w-full object-cover" />
              </div>
              <div className="p-4 text-sm text-zinc-400">
                Example rule: each correct pick is worth 1 point. Tie-breaker: total number of wins by the Best Picture
                film.
              </div>
            </div>

            <div className="space-y-3 text-sm text-zinc-300">
              <p>• Submit your picks before the ceremony starts.</p>
              <p>• Each category is worth 1 point. Optional: weight Best Picture / acting categories.</p>
              <p>
                • Tie-breakers: (1) exact number of correct picks, (2) closest to total wins by the winner of Best
                Picture.
              </p>
              <p className="text-zinc-400">Replace these bullets with your pool&apos;s real rules. Keep them easy to scan.</p>
            </div>
          </div>
        </section>

        {/* Ballots */}
        <section id="ballots" className="scroll-mt-24 space-y-6">
          <SectionHeading
            kicker="Submit"
            title="Pick your ballot"
            description="Homepage tiles mirror the earlier static frontend. In this Remix app, picks are saved on /ballot."
          />

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {ballots.map((b, idx) => (
                <Link
                  key={b.id}
                  to={ctaHref}
                  className={
                    "group rounded-xl border bg-white/[0.02] p-3 text-left transition " +
                    (idx === 0 ? "border-gold-400/40 shadow-glow" : "border-white/10 hover:border-white/20")
                  }
                >
                  <div className="flex items-start gap-3">
                    <div className="h-16 w-12 overflow-hidden rounded-md border border-white/10 bg-white/5">
                      <img src={b.thumbnailSrc} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-zinc-200">{b.title}</div>
                      <div className="text-xs text-zinc-500">{b.subtitle}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div>
              <Link
                to={ctaHref}
                className="inline-flex w-full items-center justify-center rounded-md border border-gold-400/40 bg-gold-400 px-4 py-2 text-sm font-medium text-ink-950 shadow-glow hover:bg-gold-500 sm:w-auto"
              >
                {ctaLabel}
              </Link>
              {!user ? <div className="mt-2 text-xs text-zinc-500">Log in to save picks to Postgres.</div> : null}
            </div>
          </div>
        </section>

        {/* Host */}
        <section className="space-y-6">
          <SectionHeading
            kicker="Host"
            title="Notes from the host"
            description="Use this section for ceremony details, where to watch, or a short intro."
          />

          <div className="card overflow-hidden">
            <div className="relative aspect-[1600/900] w-full">
              <img src="/images/host.png" alt="Host" className="h-full w-full object-cover" />
            </div>
            <div className="p-4 text-sm text-zinc-300">
              <p className="max-w-3xl text-zinc-400">
                Example copy: we’ll gather at 7pm for pre-show snacks. Main broadcast starts at 8pm. Send your ballot by
                7:30pm. Bring a movie recommendation.
              </p>
            </div>
          </div>
        </section>

        {/* Movies */}
        <section id="movies" className="scroll-mt-24 space-y-6">
          <SectionHeading
            kicker="Watchlist"
            title="Recommended movies"
            description="Posters pulled from the Figma export; replace with your current list."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {recommendedMovies.map((m) => (
              <div key={m.id} className="card overflow-hidden">
                <div className="relative aspect-[2/3] w-full">
                  <img src={m.posterSrc} alt={m.title} className="h-full w-full object-cover" />
                </div>
                <div className="p-3">
                  <div className="text-sm font-medium text-zinc-200">{m.title}</div>
                  {m.year ? <div className="text-xs text-zinc-500">{m.year}</div> : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-white/10 py-10 text-xs text-zinc-500">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>Oscars Pool — Remix starter</div>
            <div className="text-zinc-600">Remix + Prisma + Postgres + Tailwind</div>
          </div>
        </footer>
      </main>
    </div>
  );
}
