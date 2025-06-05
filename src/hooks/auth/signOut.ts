
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { AuthStatus } from "./types";
import { toast } from "sonner";

export const createSignOut = (
  safeSetState: <T>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => void,
  setters: {
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setSession: React.Dispatch<React.SetStateAction<Session | null>>;
    setStatus: React.Dispatch<React.SetStateAction<AuthStatus>>;
  },
  session: Session | null
) => {
  return async () => {
    console.log("[signOut] Déconnexion en cours...");
    safeSetState(setters.setStatus, 'loading');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("[signOut] Erreur lors de la déconnexion:", error);
        toast.error("Erreur lors de la déconnexion");
        throw error;
      }
      
      // Nettoyage explicite après déconnexion
      safeSetState(setters.setUser, null);
      safeSetState(setters.setSession, null);
      safeSetState(setters.setStatus, 'unauthenticated');
      console.log("[signOut] Déconnexion réussie");
      toast.success("Déconnexion réussie");
      
      // Redirection vers la page d'accueil après déconnexion
      window.location.href = '/';
      
    } catch (error) {
      console.error("[signOut] Erreur inattendue lors de la déconnexion:", error);
      safeSetState(setters.setStatus, session ? 'authenticated' : 'unauthenticated');
    }
  };
};
