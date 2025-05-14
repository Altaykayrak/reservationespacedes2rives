
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { toast } from "sonner";

export const AdminPage = () => {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading, isError, isChecking } = useAdminAuth();

  useEffect(() => {
    // Si la vérification est terminée et que l'utilisateur n'est pas admin, rediriger
    if (!isChecking && !isLoading && !isAdmin) {
      console.log("[AdminPage] L'utilisateur n'est pas administrateur, redirection...");
      toast.error("Accès non autorisé. Vous devez être administrateur pour accéder à cette page.");
      navigate("/admin-login");
    }
  }, [isAdmin, isLoading, isChecking, navigate]);

  // Afficher un indicateur de chargement pendant la vérification
  if (isChecking || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification des droits d'accès...</p>
        </div>
      </div>
    );
  }

  // Afficher un message d'erreur si une erreur s'est produite
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Une erreur est survenue lors de la vérification des droits d'accès.</p>
          <button 
            onClick={() => navigate("/admin-login")} 
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Retourner à la page de connexion
          </button>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est admin, afficher la page d'administration
  return (
    <>
      <AdminNavbar />
      <Outlet />
    </>
  );
};
