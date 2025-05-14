
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Vérifier si l'utilisateur est sur une route admin
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  // Log des changements d'état d'authentification
  useEffect(() => {
    console.log("ProtectedRoute - Auth state changed:", 
      loading ? "LOADING" : (user ? "AUTHENTICATED" : "UNAUTHENTICATED"), 
      user ? "Session présente" : "Session absente");
    
    console.log("État de la session:", user ? "Authentifié" : "Non authentifié");
    console.log("Route actuelle:", location.pathname, "Admin route:", isAdminRoute);
  }, [user, loading, location, isAdminRoute]);
  
  // Accès direct aux routes admin sans authentification
  if (isAdminRoute) {
    console.log("ProtectedRoute: Accès autorisé à la route admin sans vérification d'authentification");
    return <>{children}</>;
  }
  
  // Pendant le chargement, afficher un indicateur
  if (loading) {
    console.log("ProtectedRoute: Chargement en cours...");
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }
  
  // Si non authentifié et pas sur une route admin, rediriger vers la page de connexion
  if (!user && !isAdminRoute) {
    console.log("Utilisateur non authentifié, redirection vers /login");
    return <Navigate to="/login" replace />;
  }
  
  // Authentifié ou sur une route admin, autoriser l'accès
  console.log("ProtectedRoute: Accès autorisé");
  return <>{children}</>;
}
