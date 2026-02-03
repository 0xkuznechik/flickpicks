import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "../utils/db.server";
import { createUserSession } from "../utils/auth.server";

type LoaderData = {
  ok: boolean;
  message: string;
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { token } = params;

  if (!token) {
    throw new Response("Not Found", { status: 404 });
  }

  const pendingUser = await prisma.pendingUser.findUnique({
    where: { confirmationToken: token },
  });

  if (!pendingUser || new Date() > pendingUser.expiresAt) {
    return json(
      { ok: false, message: "Invalid or expired confirmation link." },
      { status: 400 }
    );
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: pendingUser.email },
  });

  if (existingUser) {
    // This could happen if the user confirms twice.
    // We can just log them in.
    return createUserSession(request, existingUser.id, "/ballot");
  }

  // Create the new user
  const user = await prisma.user.create({
    data: {
      email: pendingUser.email,
      passwordHash: pendingUser.passwordHash,
      username: pendingUser.username,
      recoveryEmail: pendingUser.recoveryEmail,
    },
    select: { id: true },
  });

  // Delete the pending user
  await prisma.pendingUser.delete({
    where: { id: pendingUser.id },
  });

  return createUserSession(request, user.id, "/ballot");
}

export default function ConfirmEmailPage() {
  const data = useLoaderData<typeof loader>();

  // This part of the UI will only be shown if the loader returns data
  // instead of a redirect. This happens on failure.
  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans flex items-center justify-center">
      <div className="container-pad">
        <div className="mx-auto w-full max-w-lg">
          <div className="card p-6 md:p-8 text-center">
            <h1 className="text-2xl font-semibold text-red-400">
              Account Confirmation Failed
            </h1>
            <p className="mt-4 text-zinc-300">
              {data.message || "Something went wrong. Please try again."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
