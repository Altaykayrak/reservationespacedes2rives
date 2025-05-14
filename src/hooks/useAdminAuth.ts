
import { useQuery } from "@tanstack/react-query";

export const useAdminAuth = () => {
  console.log("useAdminAuth: Bypass d'authentification - accès admin autorisé sans vérification");
  
  return useQuery({
    queryKey: ["admin-status-bypass"],
    queryFn: async () => {
      // Retourner directement isAdmin: true sans aucune vérification
      return { isAdmin: true, isLoading: false, isError: false };
    },
    staleTime: Infinity, // Ne jamais considérer la donnée comme périmée
    gcTime: Infinity,    // Ne jamais nettoyer la donnée du cache
    initialData: { isAdmin: true, isLoading: false, isError: false },
  });
};
