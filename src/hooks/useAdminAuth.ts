
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const useAdminAuth = () => {
  const { user, session, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  // Utiliser useQuery pour vérifier le statut admin
  const result = useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: async () => {
      try {
        if (!session?.user) {
          console.log("[useAdminAuth] Pas de session active, retourne false");
          return false;
        }
        
        console.log("[useAdminAuth] Vérification du statut admin pour l'utilisateur:", session.user.id);
        const { data: isAdmin, error: adminError } = await supabase
          .rpc('is_admin', { user_id: session.user.id });

        if (adminError) {
          console.error("[useAdminAuth] Erreur lors de la vérification du statut admin:", adminError);
          toast.error("Erreur lors de la vérification des droits administrateur");
          return false;
        }

        console.log("[useAdminAuth] Résultat de la vérification admin:", isAdmin);
        return !!isAdmin;
      } catch (error) {
        console.error("[useAdminAuth] Exception dans useAdminAuth:", error);
        toast.error("Une erreur est survenue lors de la vérification des droits administrateur");
        return false;
      } finally {
        setIsChecking(false);
      }
    },
    enabled: !!user && !loading,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // Considérer le statut admin valide pendant 5 minutes
    gcTime: 10 * 60 * 1000, // Garder en cache pendant 10 minutes (anciennement cacheTime)
  });

  // Exposer à la fois le résultat de la requête et l'état de chargement
  return {
    ...result,
    isChecking: loading || isChecking
  };
};
