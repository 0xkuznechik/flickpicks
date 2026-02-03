import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../utils/db.server";
import { getUserId, requireUser } from "../utils/auth.server";

const Schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ActionData =
  | { ok: false; fieldErrors: { password?: string[], confirmPassword?: string[] } }
  | { ok: false; formError: string };

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser?.passwordMustBeChanged) {
    return redirect("/ballot");
  }
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await getUserId(request);
  if (!userId) throw redirect("/login");

  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());

  const parsed = Schema.safeParse(body);

  if (!parsed.success) {
    return json(
      {
        ok: false,
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      passwordMustBeChanged: false,
    },
  });

  return redirect("/ballot");
}

export default function ForcePasswordChange() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="container-pad py-10 md:py-16">
      <div className="mx-auto w-full max-w-lg">
        <div className="card p-6 md:p-8">
          <h1 className="text-2xl font-semibold">Change Your Password</h1>
          <p className="mt-2 text-zinc-300">
            Please choose a new password to continue.
          </p>

          <Form method="post" className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="password">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                className="input mt-1"
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
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="input mt-1"
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

            {actionData && "formError" in actionData && actionData.formError ? (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
                {actionData.formError}
              </p>
            ) : null}

            <button type="submit" className="btn btn-primary w-full">
              Set New Password
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
