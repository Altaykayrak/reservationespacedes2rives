
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

export const useAdminAuth = () => {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<boolean>(false);

  // Vérifier d'abord si nous avons une session avant de lancer la requête
  useEffect(() => {
    let isMounted = true;
    
    const checkSession = async () => {
      try {
        // Attendre un court instant pour s'assurer que la session est établie
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erreur lors de la vérification de session:", error);
          if (isMounted) {
            setSessionError(true);
            setSessionChecked(true);
          }
          return;
        }

        if (session?.user) {
          console.log("useAdminAuth: Session active trouvée pour", session.user.id);
          if (isMounted) {
            setUserId(session.user.id);
          }
        } else {
          console.log("useAdminAuth: Aucune session active");
        }
        
        if (isMounted) {
          setSessionChecked(true);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de session:", error);
        if (isMounted) {
          setSessionError(true);
          setSessionChecked(true);
        }
      }
    };

    checkSession();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return useQuery({
    queryKey: ["admin-status", userId],
    queryFn: async () => {
      // Si nous n'avons pas encore vérifié la session ou pas d'ID utilisateur, retourner état de chargement
      if (!sessionChecked) {
        return { isAdmin: false, isLoading: true };
      }
      
      if (sessionError) {
        return { isAdmin: false, isError: true };
      }
      
      if (!userId) {
        return { isAdmin: false, isLoading: false };
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
    enabled: sessionChecked,
    retry: 1, // Réduire le nombre d'essais pour éviter les boucles
    retryDelay: 1000, // Attendre 1 seconde entre les tentatives
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    initialData: { isAdmin: false, isLoading: true },
  });
};
