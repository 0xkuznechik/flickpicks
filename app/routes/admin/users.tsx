import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useFetcher } from "@remix-run/react";
import { prisma } from "../../utils/db.server";
import bcrypt from "bcryptjs";
import { requireAdminUser } from "../../utils/admin.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdminUser(request);
  const users = await prisma.user.findMany({
    select: { id: true, email: true, username: true, isAdmin: true },
    orderBy: { email: "asc" },
  });
  return json({ users });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdminUser(request);
  const formData = await request.formData();
  const userId = String(formData.get("userId"));

  const temporaryPassword = Math.random().toString(36).slice(-8);
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      passwordMustBeChanged: true,
    },
  });

  return json({ temporaryPassword });
}

export default function AdminUsers() {
  const { users } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Users</h2>
      {fetcher.data?.temporaryPassword && (
        <div
          className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg"
          role="alert"
        >
          New temporary password:{" "}
          <strong>{fetcher.data.temporaryPassword}</strong>
        </div>
      )}
      <ul className="divide-y divide-zinc-700">
        {users.map((user) => (
          <li key={user.id} className="py-2 flex justify-between items-center">
            <div>
              <p className="font-semibold">
                {user.username} ({user.email})
              </p>
              {user.isAdmin && <p className="text-sm text-gold-400">Admin</p>}
            </div>
            <fetcher.Form method="post">
              <input type="hidden" name="userId" value={user.id} />
              <button type="submit" className="btn btn-secondary">
                Reset Password
              </button>
            </fetcher.Form>
          </li>
        ))}
      </ul>
    </div>
  );
}
