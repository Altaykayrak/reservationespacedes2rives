
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAdminAuth = () => {
  return useQuery({
    queryKey: ["admin-status"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.log("useAdminAuth: No active session");
        return false;
      }
      
      const { data: isAdmin, error } = await supabase
        .rpc('is_admin', { user_id: session.user.id });
      
      if (error) {
        console.error("Error checking admin status:", error);
        throw error;
      }
      
      console.log("useAdminAuth: Admin status result:", isAdmin);
      return !!isAdmin;
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity, // Ne pas réinterroger pendant cette session
  });
};
