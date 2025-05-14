
import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, initialized } = useAuth();
  const location = useLocation();
  
  // Vérifier si l'utilisateur est sur une route admin
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  // Log des changements d'état d'authentification
  useEffect(() => {
    console.log("[ProtectedRoute] État d'authentification:", 
      loading ? "CHARGEMENT" : (user ? "AUTHENTIFIÉ" : "NON AUTHENTIFIÉ"), 
      user ? "Session présente" : "Session absente",
      "Initialisé:", initialized);
    
    console.log("[ProtectedRoute] Route actuelle:", location.pathname, "Admin route:", isAdminRoute);
  }, [user, loading, location, isAdminRoute, initialized]);
  
  // Pendant le chargement initial, afficher un indicateur
  if (loading || !initialized) {
    console.log("[ProtectedRoute] Chargement en cours ou initialisation en attente...");
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la session...</p>
        </div>
      </div>
    );
  }
  
  // Autoriser l'accès à toutes les pages, qu'il y ait une session ou non
  console.log("[ProtectedRoute] Accès autorisé");
  return <>{children}</>;
}
