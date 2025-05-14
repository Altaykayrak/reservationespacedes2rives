
import { Outlet } from "react-router-dom";
import { AdminNavbar } from "@/components/admin/AdminNavbar";

export function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <main className="container mx-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
