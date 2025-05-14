
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAdminAuth = () => {
  return useQuery({
    queryKey: ["admin-status"],
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          return false;
        }
        
        const { data: isAdmin, error: adminError } = await supabase
          .rpc('is_admin', { user_id: session.user.id });

        if (adminError) {
          console.error("Error checking admin status:", adminError);
          return false;
        }

        return !!isAdmin;
      } catch (error) {
        console.error("Exception in useAdminAuth:", error);
        return false;
      }
    },
    retry: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Ne pas rafraîchir à chaque montage
    staleTime: 30 * 60 * 1000, // Considérer le statut admin valide pendant 30 minutes
    gcTime: 60 * 60 * 1000, // Garder en cache pendant 1 heure
  });
};
