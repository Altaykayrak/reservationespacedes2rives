
import { ReactNode, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, initialized, session } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Log des changements d'état d'authentification pour le débogage
  useEffect(() => {
    console.log("[ProtectedRoute] État d'authentification:", 
      loading ? "CHARGEMENT" : (user ? "AUTHENTIFIÉ" : "NON AUTHENTIFIÉ"), 
      session ? "Session présente" : "Session absente",
      "Initialisé:", initialized);
    
    console.log("[ProtectedRoute] Route actuelle:", location.pathname);
    
    if (session) {
      console.log("[ProtectedRoute] Session valide jusqu'à:", new Date(session.expires_at * 1000).toLocaleString());
    }

    // Si l'initialisation est terminée, l'utilisateur n'est pas en chargement et qu'il n'est pas connecté
    if (initialized && !loading && !user && !location.pathname.startsWith("/admin")) {
      console.log("[ProtectedRoute] Redirection vers la page de connexion");
      toast.error("Veuillez vous connecter pour accéder à cette page");
      navigate("/login", { replace: true });
    }
  }, [user, session, loading, location, initialized, navigate]);
  
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
  
  // Si l'utilisateur est connecté, afficher le contenu protégé
  if (user) {
    console.log("[ProtectedRoute] Accès autorisé à", location.pathname);
    return <>{children}</>;
  }
  
  // Si nous sommes sur une route admin, laisser la page admin gérer l'authentification
  if (location.pathname.startsWith("/admin")) {
    console.log("[ProtectedRoute] Route admin détectée, laissant AdminPage gérer l'authentification");
    return <>{children}</>;
  }
  
  // Cette partie ne devrait pas être atteinte grâce à la redirection dans useEffect
  // Mais nous le gardons comme mesure de sécurité supplémentaire
  console.log("[ProtectedRoute] Redirection de secours vers la page de connexion");
  return null;
}
