
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { useGlobalSettings } from "@/hooks/useGlobalSettings";
import { useUserSettings } from "@/hooks/useUserSettings";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();
  const { globalSettings, loading: globalSettingsLoading } = useGlobalSettings();
  const { userSettings, loading: userSettingsLoading } = useUserSettings();
  
  useEffect(() => {
    if (!loading && !globalSettingsLoading && !userSettingsLoading) {
      setIsChecking(false);
    }
  }, [loading, globalSettingsLoading, userSettingsLoading]);

  // Vérifier si l'accès à la page est bloqué par les paramètres spécifiques à l'utilisateur
  const isPageBlocked = () => {
    const hideWednesday = globalSettings.hide_wednesday_reservations || userSettings.hide_wednesday_reservations;
    const hideRdv = globalSettings.hide_rdv_page || userSettings.hide_rdv_page;
    
    if (location.pathname === "/wednesday-reservations" && hideWednesday) {
      return true;
    }
    
    if (location.pathname === "/rdv" && hideRdv) {
      return true;
    }
    
    return false;
  };

  // Afficher un indicateur de chargement pendant la vérification
  if (isChecking || loading || globalSettingsLoading || userSettingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  // Vérifier si l'accès à la page est bloqué
  if (isPageBlocked()) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="my-8 p-6 bg-red-50 rounded-lg shadow border border-red-200">
          <h2 className="text-2xl font-bold mb-4 text-red-700">Accès non disponible</h2>
          <p className="mb-4">Cette fonctionnalité n'est pas disponible actuellement.</p>
          <a href="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  // Rediriger vers la page de connexion seulement pour les routes admin
  if (!isAuthenticated) {
    // Pour les routes admin, rediriger vers /admin-login
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin-login" state={{ from: location }} replace />;
    }
    // Pour toutes les autres routes protégées, afficher un message ou un bouton de redirection
    // sans faire de redirection automatique
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="my-8 p-6 bg-gray-50 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Accès restreint</h2>
          <p className="mb-4">Vous devez être connecté pour accéder à cette page.</p>
          <a href="/login" className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est authentifié, permettre l'accès
  return <>{children}</>;
}
