import type { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { requireAdminUser } from "../utils/admin.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdminUser(request);
  return null;
}

export default function AdminLayout() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Admin</h1>
      <Outlet />
    </div>
  );
}
