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
    select: { id: true, email: true, lockedAt: true }
  });
}

export async function requireUser(request: Request) {
  const user = await getUser(request);
  if (!user) throw redirect("/login");
  return user;
}

export async function loginOrRegister(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalized } });

  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email: normalized, passwordHash },
      select: { id: true, email: true }
    });
    return { user, created: true };
  }

  const ok = await bcrypt.compare(password, existing.passwordHash);
  if (!ok) return { user: null, created: false };

  return {
    user: { id: existing.id, email: existing.email },
    created: false
  };
}

export async function createUserSession(request: Request, userId: string, redirectTo: string) {
  const session = await getSession(request.headers.get("Cookie"));
  session.set(SESSION_KEY, userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await commitSession(session)
    }
  });
}

export async function logout(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session)
    }
  });
}
