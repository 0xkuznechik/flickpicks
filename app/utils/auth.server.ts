import bcrypt from "bcryptjs";
import { redirect } from "@remix-run/node";
import { prisma } from "./db.server";
import { commitSession, destroySession, getSession } from "./session.server";

const SESSION_KEY = "userId";

export async function getUserId(request: Request): Promise<string | null> {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get(SESSION_KEY);
  return typeof userId === "string" ? userId : null;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, lockedAt: true },
  });
}

export async function requireUser(request: Request) {
  const user = await getUser(request);
  if (!user) throw redirect("/login");
  return user;
}

export async function login(
  email: string,
  password: string
): Promise<{
  user: { id: string; email: string; passwordMustBeChanged: boolean } | null;
  error?: string;
}> {
  const normalized = email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email: normalized },
  });

  if (!existingUser) {
    // Check if the user is pending confirmation
    const pendingUser = await prisma.pendingUser.findUnique({
      where: { email: normalized },
    });
    if (pendingUser) {
      return { user: null, error: "unconfirmed" };
    }
    return { user: null };
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    existingUser.passwordHash
  );
  if (!isPasswordValid) {
    return { user: null };
  }

  return {
    user: {
      id: existingUser.id,
      email: existingUser.email,
      passwordMustBeChanged: existingUser.passwordMustBeChanged,
    },
  };
}

export async function createUserSession(
  request: Request,
  userId: string,
  redirectTo: string
) {
  const session = await getSession(request.headers.get("Cookie"));
  session.set(SESSION_KEY, userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}
