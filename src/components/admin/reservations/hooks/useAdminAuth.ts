
import { useAdminAuth as useMainAdminAuth } from "@/hooks/useAdminAuth";

export const useAdminAuth = () => {
  // Réutiliser le hook principal pour la gestion de l'authentification admin
  const adminAuth = useMainAdminAuth();
  
  // Ajouter des logs supplémentaires pour le débogage
  console.log("[useAdminAuth:reservations] État d'authentification admin:", 
    adminAuth.isLoading ? "CHARGEMENT" : 
    (adminAuth.data ? "ADMIN" : "NON ADMIN"),
    "Vérification:", adminAuth.isChecking ? "En cours" : "Terminée"
  );
  
  return adminAuth;
};
