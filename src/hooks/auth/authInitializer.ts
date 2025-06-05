
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { AuthStatus } from "./types";
import { getCurrentSession, refreshSessionIfNeeded } from "./sessionUtils";

export const useAuthInitializer = (
  handleAuthStateChange: (event: string, session: Session | null) => void,
  safeSetState: <T>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => void,
  setters: {
    setSession: React.Dispatch<React.SetStateAction<Session | null>>;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setStatus: React.Dispatch<React.SetStateAction<AuthStatus>>;
    setInitialized: React.Dispatch<React.SetStateAction<boolean>>;
  },
  isMountedRef: React.MutableRefObject<boolean>
) => {
  // Utiliser une référence pour éviter les doubles souscriptions
  const authListenerRef = useRef<{ subscription: any } | null>(null);

  useEffect(() => {
    console.log("[authInitializer] Initialisation du hook...");
    
    const initAuth = async () => {
      try {
        // 1. D'abord configurer l'écouteur d'événements AVANT toute autre opération
        if (!authListenerRef.current) {
          console.log("[authInitializer] Configuration de l'écouteur d'événements d'authentification");
          const { data } = supabase.auth.onAuthStateChange(handleAuthStateChange);
          authListenerRef.current = { subscription: data.subscription };
        }
        
        // 2. Ensuite récupérer la session actuelle
        console.log("[authInitializer] Récupération de la session actuelle");
        const currentSession = await getCurrentSession();
        
        if (currentSession && isMountedRef.current) {
          console.log("[authInitializer] Session trouvée:", currentSession.user.email);
          safeSetState(setters.setSession, currentSession);
          safeSetState(setters.setUser, currentSession.user);
          safeSetState(setters.setStatus, 'authenticated');
          
          // Ajouter un log pour la date d'expiration
          console.log("[authInitializer] Session valide jusqu'à:", 
            new Date(currentSession.expires_at * 1000).toLocaleString());
        } else if (isMountedRef.current) {
          console.log("[authInitializer] Aucune session active trouvée");
          safeSetState(setters.setUser, null);
          safeSetState(setters.setSession, null);
          safeSetState(setters.setStatus, 'unauthenticated');
        }
        
        // Marquer l'initialisation comme terminée après un délai
        setTimeout(() => {
          if (isMountedRef.current) {
            safeSetState(setters.setInitialized, true);
            console.log("[authInitializer] Initialisation terminée");
          }
        }, 200);
      } catch (error) {
        console.error("[authInitializer] Erreur lors de l'initialisation:", error);
        if (isMountedRef.current) {
          safeSetState(setters.setUser, null);
          safeSetState(setters.setSession, null);
          safeSetState(setters.setStatus, 'unauthenticated');
          safeSetState(setters.setInitialized, true);
        }
      }
    };
    
    initAuth();
    
    // Nettoyage lors du démontage
    return () => {
      console.log("[authInitializer] Nettoyage du hook d'authentification");
      
      // Désabonnement seulement si nécessaire
      if (authListenerRef.current?.subscription) {
        console.log("[authInitializer] Désabonnement de l'écouteur d'événements");
        authListenerRef.current.subscription.unsubscribe();
        authListenerRef.current = null;
      }
    };
  }, []); // Dépendances vides pour exécuter une seule fois

  return authListenerRef;
};
