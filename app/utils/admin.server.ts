import { redirect } from "@remix-run/node";
import { requireUser } from "./auth.server";

export async function requireAdminUser(request: Request) {
  const user = await requireUser(request);
  if (!user.isAdmin) {
    throw redirect("/");
  }
  return user;
}
