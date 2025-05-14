
import { useAdminAuth as useMainAdminAuth } from "@/hooks/useAdminAuth";

export const useAdminAuth = () => {
  // Réutiliser le hook principal
  return useMainAdminAuth();
};
