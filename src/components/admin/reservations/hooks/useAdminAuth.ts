
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAdminAuth = () => {
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return false;
      
      const { data: isAdmin, error: adminError } = await supabase
        .rpc('is_admin', { user_id: session.user.id });

      if (adminError) {
        console.error("Error checking admin status:", adminError);
        return false;
      }

      return isAdmin;
    },
  });
};
