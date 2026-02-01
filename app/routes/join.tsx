import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../utils/db.server";
import { createUserSession, getUserId } from "../utils/auth.server";

const Schema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be 20 characters or less")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
    email: z.string().email("Enter a valid email").max(320),
    recoveryEmail: z
      .string()
      .email("Enter a valid recovery email")
      .max(320)
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(256),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ActionData =
  | {
      ok: false;
      fieldErrors: {
        username?: string[];
        email?: string[];
        recoveryEmail?: string[];
        password?: string[];
        confirmPassword?: string[];
      };
    }
  | { ok: false; formError: string };

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (userId) throw redirect("/ballot");
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const username = String(form.get("username") ?? "");
  const email = String(form.get("email") ?? "");
  const recoveryEmail = String(form.get("recoveryEmail") ?? "");
  const password = String(form.get("password") ?? "");
  const confirmPassword = String(form.get("confirmPassword") ?? "");

  const parsed = Schema.safeParse({
    username,
    email,
    recoveryEmail,
    password,
    confirmPassword,
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return json({ ok: false, fieldErrors }, { status: 400 });
  }

  // Check if username already exists
  const existingUsername = await prisma.user.findUnique({
    where: { username: parsed.data.username },
  });

  if (existingUsername) {
    return json(
      { ok: false, formError: "Username already taken" },
      { status: 400 }
    );
  }

  // Check if email already exists
  const normalizedEmail = email.trim().toLowerCase();
  const existingEmail = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingEmail) {
    return json(
      { ok: false, formError: "Email already registered" },
      { status: 400 }
    );
  }

  // Create user
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      username: parsed.data.username,
      email: normalizedEmail,
      recoveryEmail: parsed.data.recoveryEmail || null,
      passwordHash,
    },
    select: { id: true },
  });

  return createUserSession(request, user.id, "/ballot");
}

export default function Join() {
  const actionData = useActionData<typeof action>();
  const [params] = useSearchParams();
  const redirectTo = params.get("redirectTo") ?? "/ballot";

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-gold-500/30">
      <div className="container-pad py-10 md:py-16">
        <div className="mx-auto w-full max-w-lg">
          <div className="card p-6 md:p-8">
            <h1 className="text-2xl font-semibold">Create Account</h1>
            <p className="mt-2 text-zinc-300">
              Sign up to start making your Oscar picks.
            </p>

            <Form method="post" className="mt-6 space-y-4">
              <input type="hidden" name="redirectTo" value={redirectTo} />

              <div>
                <label className="label" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  className="input mt-1"
                  placeholder="johndoe"
                  required
                />
                {actionData &&
                "fieldErrors" in actionData &&
                actionData.fieldErrors?.username ? (
                  <p className="mt-1 text-sm text-red-300">
                    {actionData.fieldErrors.username.join(", ")}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="input mt-1"
                  placeholder="you@example.com"
                  required
                />
                {actionData &&
                "fieldErrors" in actionData &&
                actionData.fieldErrors?.email ? (
                  <p className="mt-1 text-sm text-red-300">
                    {actionData.fieldErrors.email.join(", ")}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  className="input mt-1"
                  placeholder="mysecretpassword"
                  required
                />
                {actionData &&
                "fieldErrors" in actionData &&
                actionData.fieldErrors?.password ? (
                  <p className="mt-1 text-sm text-red-300">
                    {actionData.fieldErrors.password.join(", ")}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="label" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className="input mt-1"
                  placeholder="mysecretpassword"
                  required
                />
                {actionData &&
                "fieldErrors" in actionData &&
                actionData.fieldErrors?.confirmPassword ? (
                  <p className="mt-1 text-sm text-red-300">
                    {actionData.fieldErrors.confirmPassword.join(", ")}
                  </p>
                ) : null}
              </div>

              {actionData &&
              "formError" in actionData &&
              actionData.formError ? (
                <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
                  {actionData.formError}
                </p>
              ) : null}

              <button type="submit" className="btn btn-primary w-full">
                Create Account
              </button>

              <p className="small-muted text-center">
                Already have an account?{" "}
                <Link to="/login" className="text-gold-400 hover:text-gold-500">
                  Log in
                </Link>
              </p>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
