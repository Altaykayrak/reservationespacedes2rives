
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

  // Rediriger vers la page de connexion si non authentifié
  if (!isAuthenticated) {
    // Pour les routes admin, rediriger vers /admin-login, sinon vers /login
    const loginPath = location.pathname.startsWith('/admin') ? '/admin-login' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Si l'utilisateur est authentifié, permettre l'accès
  return <>{children}</>;
}
