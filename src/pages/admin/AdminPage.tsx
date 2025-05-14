
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
    // Ne faire la vérification qu'une seule fois
    if (isLoading || adminChecked) return;

    console.log("AdminPage: Vérifiant le statut administrateur, isAdmin =", isAdmin);

    if (isError) {
      console.error("AdminPage: Erreur lors de la vérification du statut administrateur");
      toast({
        title: "Erreur",
        description: "Impossible de vérifier vos droits administrateur.",
        variant: "destructive",
      });
      navigate("/admin-login", { replace: true });
      return;
    }

    if (isAdmin === false) {
      console.log("AdminPage: Utilisateur non-admin, redirection vers admin-login");
      navigate("/admin-login", { replace: true });
      return;
    }

    // Marquer la vérification comme effectuée pour éviter de nouvelles redirections
    setAdminChecked(true);
    console.log("AdminPage: Vérification admin terminée, utilisateur autorisé");
  }, [isAdmin, isLoading, isError, navigate, toast, adminChecked]);

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

  // Une fois que nous avons vérifié que l'utilisateur est admin, afficher la page
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <main className="container mx-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
