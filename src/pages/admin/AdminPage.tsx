
import { Outlet, useNavigate } from "react-router-dom";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export function AdminPage() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading, isError } = useAdminAuth();
  const { toast } = useToast();
  const [adminChecked, setAdminChecked] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (adminChecked) return;

    if (isError) {
      toast({
        title: "Erreur",
        description: "Impossible de vérifier vos droits administrateur.",
        variant: "destructive",
      });
      navigate("/admin-login", { replace: true });
      return;
    }

    if (isAdmin === false) {
      console.log("AdminPage: User is not admin, redirecting to admin login");
      navigate("/admin-login", { replace: true });
      return;
    }

    setAdminChecked(true);
  }, [isAdmin, isLoading, isError, adminChecked, navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'interface d'administration...</p>
        </div>
      </div>
    );
  }

  if (!adminChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification des droits d'accès...</p>
        </div>
      </div>
    );
  }

  // Si nous arrivons ici, l'utilisateur est admin
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <main className="container mx-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
