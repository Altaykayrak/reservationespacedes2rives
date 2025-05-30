
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      setIsChecking(false);
    }
  }, [loading]);

  // Afficher un indicateur de chargement pendant la vérification
  if (isChecking || loading) {
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
