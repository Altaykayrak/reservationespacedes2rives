
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

export const useAdminAuth = () => {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Vérifier d'abord si nous avons une session avant de lancer la requête
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
        }
        setSessionChecked(true);
      } catch (error) {
        console.error("Erreur lors de la vérification de session:", error);
        setSessionChecked(true);
      }
    };

    checkSession();
  }, []);

  return useQuery({
    queryKey: ["admin-status", userId],
    queryFn: async () => {
      // Si nous n'avons pas encore vérifié la session ou pas d'ID utilisateur, retourner état de chargement
      if (!sessionChecked || !userId) {
        return { isAdmin: false, isLoading: true };
      }
      
      console.log("useAdminAuth: Vérification du statut admin pour l'utilisateur:", userId);
      try {
        const { data: isAdmin, error } = await supabase.rpc('is_admin', { user_id: userId });
        
        if (error) {
          console.error("Erreur lors de la vérification du statut admin:", error);
          return { isAdmin: false, isError: true };
        }
        
        console.log("useAdminAuth: Résultat de la vérification admin:", isAdmin);
        return { isAdmin: !!isAdmin, isLoading: false };
      } catch (error) {
        console.error("Exception lors de la vérification admin:", error);
        return { isAdmin: false, isError: true };
      }
    },
    enabled: sessionChecked && !!userId, // N'exécuter la requête que si la session a été vérifiée et qu'on a un ID
    retry: 2, // Augmenter le nombre d'essais
    retryDelay: 1000, // Attendre 1 seconde entre les tentatives
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
