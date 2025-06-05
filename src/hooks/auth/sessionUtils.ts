
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

export const checkSessionValidity = (session: Session | null): boolean => {
  if (!session) return false;
  
  const expiresAt = session.expires_at * 1000; // Convertir en millisecondes
  const now = Date.now();
  const timeRemaining = expiresAt - now;
  
  return timeRemaining > 300000; // Plus de 5 minutes restantes
};

export const refreshSessionIfNeeded = async (session: Session | null): Promise<Session | null> => {
  if (!session || checkSessionValidity(session)) {
    return session;
  }
  
  console.log("[sessionUtils] Session sur le point d'expirer, tentative de rafraîchissement");
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error("[sessionUtils] Erreur lors du rafraîchissement de la session:", error);
      return session;
    }
    
    if (data.session) {
      console.log("[sessionUtils] Session rafraîchie avec succès");
      return data.session;
    }
    
    return session;
  } catch (err) {
    console.error("[sessionUtils] Erreur inattendue lors du rafraîchissement:", err);
    return session;
  }
};

export const getCurrentSession = async (): Promise<Session | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch (err) {
    console.error("[sessionUtils] Exception lors de la vérification de la session:", err);
    return null;
  }
};
