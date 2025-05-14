
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const useRdvAuth = () => {
  const { user, loading, initialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && initialized && !user) {
      console.log("[useRdvAuth] Utilisateur non authentifié, redirection vers la page de connexion");
      toast.error("Veuillez vous connecter pour accéder à cette page");
      navigate("/login", { state: { from: location.pathname } });
    }
  }, [user, loading, navigate, initialized, location]);

  return {
    user,
    loading: loading || !initialized
  };
};
