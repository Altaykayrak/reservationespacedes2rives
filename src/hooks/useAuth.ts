
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

// Type d'état de l'authentification pour une meilleure gestion
type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [initialized, setInitialized] = useState(false);
  
  // Utiliser une référence pour éviter les doubles souscriptions
  const authListenerRef = useRef<{ subscription: any } | null>(null);
  
  // Référence pour suivre les montages de composants
  const isMountedRef = useRef(true);
  
  // Fonction sécurisée pour mettre à jour l'état
  const safeSetState = useCallback(<T>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => {
    if (isMountedRef.current) {
      setter(value);
    }
  }, []);

  // Fonction pour gérer le changement d'état d'authentification
  const handleAuthStateChange = useCallback((event: string, newSession: Session | null) => {
    console.log("[useAuth] État d'authentification modifié:", event, newSession?.user?.email || "pas de session");
    
    if (event === "INITIAL_SESSION") {
      console.log("[useAuth] Session initiale détectée");
    }
    
    if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && newSession) {
      console.log("[useAuth] Session détectée:", newSession.user.email);
      safeSetState(setSession, newSession);
      safeSetState(setUser, newSession.user);
      safeSetState(setStatus, 'authenticated');
      
      // Ajouter un log de la date d'expiration
      console.log("[useAuth] Session valide jusqu'à:", 
        new Date(newSession.expires_at * 1000).toLocaleString());
    }
    
    if (event === "SIGNED_OUT" || event === "USER_DELETED") {
      console.log("[useAuth] Event de déconnexion détecté");
      safeSetState(setUser, null);
      safeSetState(setSession, null);
      safeSetState(setStatus, 'unauthenticated');
    }
    
    if (event === "TOKEN_REFRESHED") {
      console.log("[useAuth] Token rafraîchi avec succès");
      safeSetState(setSession, newSession);
      safeSetState(setUser, newSession?.user || null);
      safeSetState(setStatus, newSession ? 'authenticated' : 'unauthenticated');
    }
    
    // Ne déclencher setInitialized qu'après le traitement de la session initiale
    if (!initialized && (event === "INITIAL_SESSION" || event === "SIGNED_IN")) {
      setTimeout(() => {
        safeSetState(setInitialized, true);
        console.log("[useAuth] Initialisation terminée après événement", event);
      }, 100); // Léger délai pour s'assurer que tous les états sont mis à jour
    }
  }, [initialized, safeSetState]);

  // Initialiser l'écouteur d'événements d'authentification et vérifier la session
  useEffect(() => {
    console.log("[useAuth] Initialisation du hook...");
    
    // S'assurer que le composant est considéré comme monté
    isMountedRef.current = true;
    
    const initAuth = async () => {
      try {
        // 1. D'abord configurer l'écouteur d'événements AVANT toute autre opération
        if (!authListenerRef.current) {
          console.log("[useAuth] Configuration de l'écouteur d'événements d'authentification");
          const { data } = supabase.auth.onAuthStateChange(handleAuthStateChange);
          authListenerRef.current = { subscription: data.subscription };
        }
        
        // 2. Ensuite récupérer la session actuelle
        console.log("[useAuth] Récupération de la session actuelle");
        const { data } = await supabase.auth.getSession();
        const currentSession = data.session;
        
        if (currentSession && isMountedRef.current) {
          console.log("[useAuth] Session trouvée:", currentSession.user.email);
          safeSetState(setSession, currentSession);
          safeSetState(setUser, currentSession.user);
          safeSetState(setStatus, 'authenticated');
          
          // Ajouter un log pour la date d'expiration
          console.log("[useAuth] Session valide jusqu'à:", 
            new Date(currentSession.expires_at * 1000).toLocaleString());
        } else if (isMountedRef.current) {
          console.log("[useAuth] Aucune session active trouvée");
          safeSetState(setUser, null);
          safeSetState(setSession, null);
          safeSetState(setStatus, 'unauthenticated');
        }
        
        // Marquer l'initialisation comme terminée après un délai
        setTimeout(() => {
          if (isMountedRef.current) {
            safeSetState(setInitialized, true);
            console.log("[useAuth] Initialisation terminée");
          }
        }, 200);
      } catch (error) {
        console.error("[useAuth] Erreur lors de l'initialisation:", error);
        if (isMountedRef.current) {
          safeSetState(setUser, null);
          safeSetState(setSession, null);
          safeSetState(setStatus, 'unauthenticated');
          safeSetState(setInitialized, true);
        }
      }
    };
    
    initAuth();
    
    // Vérifier périodiquement la validité de la session
    const sessionCheckInterval = setInterval(async () => {
      if (session && isMountedRef.current) {
        // Vérifier si le token est sur le point d'expirer (moins de 5 minutes)
        const expiresAt = session.expires_at * 1000; // Convertir en millisecondes
        const now = Date.now();
        const timeRemaining = expiresAt - now;
        
        if (timeRemaining < 300000) { // Moins de 5 minutes
          console.log("[useAuth] Session sur le point d'expirer, tentative de rafraîchissement");
          try {
            const { data, error } = await supabase.auth.refreshSession();
            if (error) {
              console.error("[useAuth] Erreur lors du rafraîchissement de la session:", error);
            } else if (data.session) {
              console.log("[useAuth] Session rafraîchie avec succès");
              safeSetState(setSession, data.session);
              safeSetState(setUser, data.session.user);
            }
          } catch (err) {
            console.error("[useAuth] Erreur inattendue lors du rafraîchissement:", err);
          }
        }
      }
    }, 60000); // Vérifier toutes les minutes
    
    // Nettoyage lors du démontage
    return () => {
      console.log("[useAuth] Nettoyage du hook d'authentification");
      isMountedRef.current = false;
      clearInterval(sessionCheckInterval);
      
      // Désabonnement seulement si nécessaire
      if (authListenerRef.current?.subscription) {
        console.log("[useAuth] Désabonnement de l'écouteur d'événements");
        authListenerRef.current.subscription.unsubscribe();
        authListenerRef.current = null;
      }
    };
  }, []); // Dépendances vides pour exécuter une seule fois

  // Fonction pour se déconnecter
  const signOut = async () => {
    console.log("[useAuth] Déconnexion en cours...");
    safeSetState(setStatus, 'loading');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("[useAuth] Erreur lors de la déconnexion:", error);
        toast.error("Erreur lors de la déconnexion");
        throw error;
      }
      
      // Nettoyage explicite après déconnexion
      safeSetState(setUser, null);
      safeSetState(setSession, null);
      safeSetState(setStatus, 'unauthenticated');
      console.log("[useAuth] Déconnexion réussie");
      toast.success("Déconnexion réussie");
    } catch (error) {
      console.error("[useAuth] Erreur inattendue lors de la déconnexion:", error);
      safeSetState(setStatus, session ? 'authenticated' : 'unauthenticated');
    }
  };

  return { 
    user, 
    session, 
    loading: status === 'loading', 
    signOut, 
    initialized,
    isAuthenticated: status === 'authenticated'
  };
};
