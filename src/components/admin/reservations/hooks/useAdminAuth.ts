
import { useAdminAuth as useMainAdminAuth } from "@/hooks/useAdminAuth";

export const useAdminAuth = () => {
  // Réutiliser le hook principal avec une meilleure gestion de l'authentification
  return useMainAdminAuth();
};
