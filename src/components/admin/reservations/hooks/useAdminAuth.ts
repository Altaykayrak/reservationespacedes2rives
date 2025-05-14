
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAdminAuth = () => {
  return useQuery({
    queryKey: ["admin-status"],
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          console.log("useAdminAuth: No active session");
          return false;
        }
        
        console.log("useAdminAuth: Checking admin status for user:", session.user.id);
        const { data: isAdmin, error: adminError } = await supabase
          .rpc('is_admin', { user_id: session.user.id });

        if (adminError) {
          console.error("Error checking admin status:", adminError);
          return false;
        }

        console.log("useAdminAuth: Admin status result:", isAdmin);
        return !!isAdmin;
      } catch (error) {
        console.error("Exception in useAdminAuth:", error);
        return false;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Permettre la réactualisation lors du montage
    staleTime: 5 * 60 * 1000, // Considérer le statut admin valide pendant 5 minutes
    gcTime: 10 * 60 * 1000, // Garder en cache pendant 10 minutes
  });
};
