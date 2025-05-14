
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { toast } from "sonner";

export const AdminPage = () => {
  const { data: isAdmin, isLoading, isError, isChecking } = useAdminAuth();
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    // Mettre à jour l'état sans redirection
    if (!isChecking && !isLoading) {
      if (!isAdmin) {
        console.log("[AdminPage] L'utilisateur n'est pas administrateur");
        toast.error("Accès non autorisé. Vous devez être administrateur pour accéder à cette page.");
      } else {
        setShowAdmin(true);
      }
    }
  }, [isAdmin, isLoading, isChecking]);

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
        </div>
      </div>
    );
  }

  // Si l'utilisateur est admin, afficher la page d'administration
  if (showAdmin) {
    return (
      <>
        <AdminNavbar />
        <Outlet />
      </>
    );
  }

  // Sinon, afficher un message d'accès refusé
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-red-600 mb-4">Accès non autorisé. Vous devez être administrateur pour accéder à cette page.</p>
      </div>
    </div>
  );
};
