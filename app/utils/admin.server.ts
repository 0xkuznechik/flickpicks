import { redirect } from "@remix-run/node";
import { prisma } from "./db.server";
import { requireUser } from "./auth.server";

export async function requireAdminUser(request: Request) {
  const user = await requireUser(request);
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser?.isAdmin) {
    throw redirect("/");
  }
  return user;
}
