
import { useNavigate, Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "@/components/admin/reservations/hooks/useAdminAuth";

export function AdminPage() {
  const { data: isAdmin, isLoading } = useAdminAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Administration</h1>
        <Outlet />
      </main>
    </div>
  );
}
