
import { ReactNode, useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, initialized, session, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Référence pour éviter les redirections multiples
  const redirectAttemptedRef = useRef(false);
  
  // Liste des routes publiques qui ne nécessitent pas d'authentification
  const publicRoutes = ['/login', '/register', '/admin-login', '/forgot-password'];
  const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route));
  
  useEffect(() => {
    console.log("[ProtectedRoute] État d'authentification:", 
      loading ? "CHARGEMENT" : (isAuthenticated ? "AUTHENTIFIÉ" : "NON AUTHENTIFIÉ"), 
      session ? "Session présente" : "Session absente",
      "Initialisé:", initialized);
    
    console.log("[ProtectedRoute] Route actuelle:", location.pathname);
    console.log("[ProtectedRoute] Est route publique:", isPublicRoute);
    
    if (session) {
      console.log("[ProtectedRoute] Session valide jusqu'à:", 
        new Date(session.expires_at * 1000).toLocaleString());
    }

    // Éviter de rediriger pendant le chargement ou si on est déjà en train de rediriger
    if (loading || !initialized || isRedirecting) {
      return;
    }

    // Si on est sur une route publique, ne pas rediriger
    if (isPublicRoute) {
      console.log("[ProtectedRoute] Route publique, pas de redirection nécessaire");
      return;
    }

    // Si l'utilisateur n'est pas authentifié et n'est pas sur une route publique, rediriger
    if (!isAuthenticated && !redirectAttemptedRef.current) {
      console.log("[ProtectedRoute] Redirection vers la page de connexion depuis", location.pathname);
      redirectAttemptedRef.current = true;
      setIsRedirecting(true);
      
      // Utiliser un délai pour éviter les redirections en cascade
      setTimeout(() => {
        toast.error("Veuillez vous connecter pour accéder à cette page");
        navigate("/login", { state: { from: location } });
        setIsRedirecting(false);
      }, 300);
    } else if (isAuthenticated) {
      // Réinitialiser le drapeau si l'utilisateur est authentifié
      redirectAttemptedRef.current = false;
    }
  }, [user, session, loading, location, initialized, navigate, isAuthenticated, isPublicRoute, isRedirecting]);
  
  // Pendant le chargement initial ou la redirection, afficher un indicateur
  if (loading || !initialized || isRedirecting) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la session...</p>
        </div>
      </div>
    );
  }
  
  // Si l'utilisateur est authentifié ou sur une route publique, afficher le contenu
  if (isAuthenticated || isPublicRoute) {
    return <>{children}</>;
  }
  
  // Fallback silencieux - ne devrait pas être atteint grâce au spinner de chargement
  return null;
}
