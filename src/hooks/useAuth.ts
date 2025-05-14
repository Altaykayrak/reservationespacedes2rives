
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const authSubscription = useRef<{ data: { subscription: any } } | null>(null);

  // Fonction pour gérer le changement d'état d'authentification
  const handleAuthStateChange = useCallback((event: string, newSession: Session | null) => {
    console.log("[useAuth] État d'authentification modifié:", event, newSession?.user?.email || "pas de session");
    
    if (event === "INITIAL_SESSION") {
      console.log("[useAuth] Session initiale détectée");
    }
    
    if (event === "SIGNED_IN" || event === "INITIAL_SESSION" && newSession) {
      console.log("[useAuth] Session détectée:", newSession.user.email);
      setSession(newSession);
      setUser(newSession.user);
    }
    
    if (event === "SIGNED_OUT" || event === "USER_DELETED") {
      console.log("[useAuth] Event de déconnexion détecté");
      setUser(null);
      setSession(null);
    }
    
    if (event === "TOKEN_REFRESHED") {
      console.log("[useAuth] Token rafraîchi avec succès");
      setSession(newSession);
      setUser(newSession?.user || null);
    }
    
    setLoading(false);
  }, []);

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    console.log("[useAuth] Initialisation du hook...");
    let isMounted = true; // Flag pour éviter les mises à jour sur un composant démonté
    
    const setupAuthSubscription = async () => {
      if (authSubscription.current) {
        console.log("[useAuth] L'abonnement existe déjà, évitement d'un double abonnement");
        return;
      }
      
      console.log("[useAuth] Configuration de l'écouteur d'événements d'authentification");
      
      // Configuration de l'écouteur d'événements d'authentification
      authSubscription.current = supabase.auth.onAuthStateChange((event, currentSession) => {
        if (isMounted) {
          handleAuthStateChange(event, currentSession);
          
          // Important: mettre à jour initialized ici pour garantir qu'il est définit après
          // que la session ait été traitée
          if (!initialized) {
            console.log("[useAuth] Initialisation terminée depuis l'écouteur d'événements");
            setInitialized(true);
          }
        }
      });
      
      // Récupération de la session actuelle
      try {
        console.log("[useAuth] Récupération de la session actuelle");
        const { data } = await supabase.auth.getSession();
        const currentSession = data.session;
        
        if (currentSession && isMounted) {
          console.log("[useAuth] Session trouvée:", currentSession.user.email);
          setSession(currentSession);
          setUser(currentSession.user);
        } else if (isMounted) {
          console.log("[useAuth] Aucune session active trouvée");
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.error("[useAuth] Erreur lors de la récupération de la session:", error);
        if (isMounted) {
          setUser(null);
          setSession(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
          console.log("[useAuth] Initialisation terminée");
        }
      }
    };
    
    setupAuthSubscription();
    
    // Nettoyage de la souscription
    return () => {
      console.log("[useAuth] Nettoyage de l'abonnement aux événements d'authentification");
      isMounted = false;
      if (authSubscription.current) {
        const { data: { subscription } } = authSubscription.current;
        if (subscription && typeof subscription.unsubscribe === 'function') {
          subscription.unsubscribe();
        }
        authSubscription.current = null;
      }
    };
  }, [handleAuthStateChange]);

  // Fonction pour se déconnecter
  const signOut = async () => {
    console.log("[useAuth] Déconnexion en cours...");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("[useAuth] Erreur lors de la déconnexion:", error);
        throw error;
      }
      
      // Nettoyage explicite après déconnexion
      setUser(null);
      setSession(null);
      console.log("[useAuth] Déconnexion réussie");
      
      setLoading(false);
    } catch (error) {
      console.error("[useAuth] Erreur inattendue lors de la déconnexion:", error);
      setLoading(false);
    }
  };

  return { user, session, loading, signOut, initialized };
};
