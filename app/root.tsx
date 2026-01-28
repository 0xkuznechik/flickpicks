import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData
} from "@remix-run/react";
import stylesheet from "./styles/tailwind.css?url";
import { getUser } from "./utils/auth.server";

export const meta: MetaFunction = () =>
  ([
    { title: "Oscars Pool" },
    { name: "viewport", content: "width=device-width, initial-scale=1" }
  ]);

export const links: LinksFunction = () => [{ rel: "stylesheet", href: stylesheet }];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  return json({ user });
}

export default function App() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <header className="sticky top-0 z-20 border-b border-white/10 bg-ink-950/70 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-4 py-3">
            <a href="/" className="flex items-center gap-3">
              <img
                src="/images/icon-statue.png"
                alt="Oscars Pool"
                width={34}
                height={34}
                className="rounded-md"
              />
              <span className="text-sm tracking-wide text-zinc-200">Oscars Pool</span>
            </a>

            <nav className="flex items-center gap-2">
              <a
                href="/#rules"
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-200 hover:bg-white/5"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gold-400/90" />
                <span className="hidden sm:inline">Rules</span>
              </a>
              <a
                href="/#ballots"
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-200 hover:bg-white/5"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gold-400/90" />
                <span className="hidden sm:inline">Ballots</span>
              </a>
              <a
                href="/#movies"
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-200 hover:bg-white/5"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gold-400/90" />
                <span className="hidden sm:inline">Movies</span>
              </a>
              <a
                href="/leaderboard"
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-200 hover:bg-white/5"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gold-400/90" />
                <span className="hidden sm:inline">Leaderboard</span>
              </a>

              <div className="ml-2 hidden h-6 w-px bg-white/10 sm:block" />

              {user ? (
                <form action="/logout" method="post">
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 hover:bg-white/10"
                  >
                    Log out
                  </button>
                </form>
              ) : (
                <a
                  href="/login"
                  className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 hover:bg-white/10"
                >
                  Log in
                </a>
              )}
            </nav>
          </div>
        </header>

        <main>
          <Outlet />
        </main>

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
