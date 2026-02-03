import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  useLoaderData,
} from "@remix-run/react";
import stylesheet from "./styles/tailwind.css?url";
import { getUser } from "./utils/auth.server";

export const meta: MetaFunction = () => [
  { title: "Oscars Pool" },
  { name: "viewport", content: "width=device-width, initial-scale=1" },
];

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap",
  },
];

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
        <main>
          <Outlet />
        </main>

        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
