
import { useQuery } from "@tanstack/react-query";

export const useAdminAuth = () => {
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      // Désactivation de la vérification, retourne toujours true
      console.log("Vérification admin désactivée, retourne toujours true");
      return true;
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // Consider admin status valid for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (formerly cacheTime)
  });
};
