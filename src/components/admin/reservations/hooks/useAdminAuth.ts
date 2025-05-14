
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAdminAuth = () => {
  return useQuery({
    queryKey: ["admin-status"],
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          console.log("No active session found in useAdminAuth");
          return false;
        }
        
        console.log("Checking admin status for user:", session.user.id);
        const { data: isAdmin, error: adminError } = await supabase
          .rpc('is_admin', { user_id: session.user.id });

        if (adminError) {
          console.error("Error checking admin status in useAdminAuth:", adminError);
          return false;
        }

        console.log("Admin check result in useAdminAuth:", isAdmin);
        return !!isAdmin;
      } catch (error) {
        console.error("Exception in useAdminAuth:", error);
        return false;
      }
    },
    retry: 0, // Ne pas réessayer pour éviter les boucles
    refetchOnWindowFocus: false,
    staleTime: 30 * 60 * 1000, // Considérer le statut admin valide pendant 30 minutes
    gcTime: 60 * 60 * 1000, // Garder en cache pendant 1 heure
  });
};
