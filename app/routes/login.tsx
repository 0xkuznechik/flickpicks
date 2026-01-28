import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import { z } from "zod";
import { createUserSession, getUserId, loginOrRegister } from "../utils/auth.server";

const Schema = z.object({
  email: z.string().email("Enter a valid email").max(320),
  password: z.string().min(8, "Password must be at least 8 characters").max(256)
});

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (userId) throw redirect("/ballot");
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const parsed = Schema.safeParse({ email, password });
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return json({ ok: false, fieldErrors }, { status: 400 });
  }

  const result = await loginOrRegister(parsed.data.email, parsed.data.password);
  if (!result.user) {
    return json(
      {
        ok: false,
        formError: "Invalid email/password for an existing account"
      },
      { status: 400 }
    );
  }

  return createUserSession(request, result.user.id, "/ballot");
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const [params] = useSearchParams();
  const redirectTo = params.get("redirectTo") ?? "/ballot";

  return (
    <div className="container-pad py-10 md:py-16">
      <div className="mx-auto w-full max-w-lg">
        <div className="card p-6 md:p-8">
          <h1 className="text-2xl font-semibold">Log in</h1>
          <p className="mt-2 text-zinc-300">
            This skeleton auto-creates an account the first time you log in with a new email.
          </p>

          <Form method="post" className="mt-6 space-y-4">
            <input type="hidden" name="redirectTo" value={redirectTo} />

            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="input mt-1"
                placeholder="you@example.com"
                required
              />
              {actionData?.fieldErrors?.email ? (
                <p className="mt-1 text-sm text-red-300">{actionData.fieldErrors.email.join(", ")}</p>
              ) : null}
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="input mt-1"
                placeholder="••••••••"
                required
              />
              {actionData?.fieldErrors?.password ? (
                <p className="mt-1 text-sm text-red-300">{actionData.fieldErrors.password.join(", ")}</p>
              ) : null}
            </div>

            {actionData?.formError ? (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
                {actionData.formError}
              </p>
            ) : null}

            <button type="submit" className="btn btn-primary w-full">
              Continue
            </button>

            <p className="small-muted">
              Not production auth. Replace with OAuth/passwordless, add rate limiting, and store secrets properly.
            </p>
          </Form>
        </div>
      </div>
    </div>
  );
}
