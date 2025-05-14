
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { checkSession } from "@/integrations/supabase/client";

export const useRdvAuth = () => {
  const { user, loading, initialized, isAuthenticated } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Vérification double de l'authentification pour éviter les problèmes de session
  useEffect(() => {
    const verifyAuth = async () => {
      // Attendre que l'initialisation soit terminée
      if (loading || !initialized) {
        return;
      }
      
      // Si l'utilisateur est authentifié selon useAuth, vérifier également la session
      if (!isAuthenticated) {
        // Double vérification avec checkSession pour s'assurer
        const session = await checkSession();
        
        if (!session) {
          console.log("[useRdvAuth] Utilisateur non authentifié, redirection vers la page de connexion");
          toast.error("Veuillez vous connecter pour accéder à cette page");
          navigate("/login", { state: { from: location.pathname } });
        }
      }
      
      setIsChecking(false);
    };

    verifyAuth();
  }, [user, loading, navigate, initialized, isAuthenticated, location.pathname]);

  return {
    user,
    loading: loading || !initialized || isChecking
  };
};
