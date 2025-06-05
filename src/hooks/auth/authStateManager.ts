
import { useCallback, useRef } from "react";
import { Session, User } from "@supabase/supabase-js";
import { AuthState, AuthStatus } from "./types";

export const useAuthStateManager = () => {
  // Référence pour suivre les montages de composants
  const isMountedRef = useRef(true);
  
  // Fonction sécurisée pour mettre à jour l'état
  const safeSetState = useCallback(<T>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => {
    if (isMountedRef.current) {
      setter(value);
    }
  }, []);

  const handleAuthStateChange = useCallback((
    event: string, 
    newSession: Session | null,
    setters: {
      setSession: React.Dispatch<React.SetStateAction<Session | null>>;
      setUser: React.Dispatch<React.SetStateAction<User | null>>;
      setStatus: React.Dispatch<React.SetStateAction<AuthStatus>>;
      setInitialized: React.Dispatch<React.SetStateAction<boolean>>;
    },
    initialized: boolean
  ) => {
    console.log("[authStateManager] État d'authentification modifié:", event, newSession?.user?.email || "pas de session");
    
    if (event === "INITIAL_SESSION") {
      console.log("[authStateManager] Session initiale détectée");
    }
    
    if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && newSession) {
      console.log("[authStateManager] Session détectée:", newSession.user.email);
      safeSetState(setters.setSession, newSession);
      safeSetState(setters.setUser, newSession.user);
      safeSetState(setters.setStatus, 'authenticated');
      
      // Ajouter un log de la date d'expiration
      console.log("[authStateManager] Session valide jusqu'à:", 
        new Date(newSession.expires_at * 1000).toLocaleString());
    }
    
    if (event === "SIGNED_OUT" || event === "USER_DELETED") {
      console.log("[authStateManager] Event de déconnexion détecté");
      safeSetState(setters.setUser, null);
      safeSetState(setters.setSession, null);
      safeSetState(setters.setStatus, 'unauthenticated');
    }
    
    if (event === "TOKEN_REFRESHED") {
      console.log("[authStateManager] Token rafraîchi avec succès");
      safeSetState(setters.setSession, newSession);
      safeSetState(setters.setUser, newSession?.user || null);
      safeSetState(setters.setStatus, newSession ? 'authenticated' : 'unauthenticated');
    }
    
    // Ne déclencher setInitialized qu'après le traitement de la session initiale
    if (!initialized && (event === "INITIAL_SESSION" || event === "SIGNED_IN")) {
      setTimeout(() => {
        safeSetState(setters.setInitialized, true);
        console.log("[authStateManager] Initialisation terminée après événement", event);
      }, 100); // Léger délai pour s'assurer que tous les états sont mis à jour
    }
  }, [safeSetState]);

  const cleanup = useCallback(() => {
    isMountedRef.current = false;
  }, []);

  const markAsMounted = useCallback(() => {
    isMountedRef.current = true;
  }, []);

  return {
    handleAuthStateChange,
    cleanup,
    markAsMounted,
    safeSetState,
    isMountedRef
  };
};
