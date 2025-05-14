
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
    
    if (event === "SIGNED_IN") {
      console.log("[useAuth] Event d'authentification positif détecté avec session");
      setSession(newSession);
      setUser(newSession?.user || null);
    }
    
    if (event === "SIGNED_OUT") {
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
    
    // Connexion à l'event listener pour les changements d'états d'authentification
    const setupAuthSubscription = async () => {
      if (authSubscription.current) {
        console.log("[useAuth] L'abonnement existe déjà, évitement d'un double abonnement");
        return;
      }
      
      console.log("[useAuth] Configuration de l'écouteur d'événements d'authentification");
      
      // Configuration de l'écouteur d'événements d'authentification
      authSubscription.current = supabase.auth.onAuthStateChange(handleAuthStateChange);
      
      // Récupération de la session actuelle
      try {
        console.log("[useAuth] Récupération de la session actuelle");
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          console.log("[useAuth] Session trouvée:", currentSession.user.email);
          setSession(currentSession);
          setUser(currentSession.user);
        } else {
          console.log("[useAuth] Aucune session active trouvée");
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.error("[useAuth] Erreur lors de la récupération de la session:", error);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
        setInitialized(true);
        console.log("[useAuth] Initialisation terminée");
      }
    };
    
    setupAuthSubscription();
    
    // Nettoyage de la souscription
    return () => {
      console.log("[useAuth] Nettoyage de l'abonnement aux événements d'authentification");
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
