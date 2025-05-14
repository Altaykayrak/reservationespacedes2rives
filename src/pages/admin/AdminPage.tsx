
import { Outlet, useNavigate } from "react-router-dom";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";

export function AdminPage() {
  const navigate = useNavigate();
  const { data, isLoading: queryLoading, isError } = useAdminAuth();
  const { isAdmin, isLoading: adminLoading } = data || { isAdmin: false, isLoading: true };
  const { toast } = useToast();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Vérification initiale de la session pour éviter les redirections prématurées
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const hasSession = !!data.session;
        setSessionChecked(true);
        
        // Si on n'a pas de session du tout, on redirige immédiatement
        if (!hasSession) {
          console.log("AdminPage: Aucune session trouvée, redirection vers login");
          navigate("/admin-login", { replace: true });
          return;
        }
        
        // On a une session, on attend la vérification admin
        console.log("AdminPage: Session trouvée, attente de la vérification admin");
        setInitialLoading(false);
      } catch (error) {
        console.error("Erreur lors de la vérification de session:", error);
        setSessionChecked(true);
        setInitialLoading(false);
      }
    };

    checkSession();
  }, [navigate]);
  
  // Vérification du statut admin après confirmation de session
  useEffect(() => {
    // N'exécuter la logique que si la session a été vérifiée et qu'on n'est plus dans le chargement initial
    if (!sessionChecked || initialLoading || queryLoading || adminLoading) return;
    
    console.log("AdminPage: Vérification admin complète, isAdmin =", isAdmin, "isError =", isError);
    
    // Ne rediriger que si on est sûr qu'il n'est pas admin
    if (isError) {
      toast({
        title: "Erreur",
        description: "Impossible de vérifier vos droits administrateur.",
        variant: "destructive",
      });
      navigate("/admin-login", { replace: true });
      return;
    }
    
    if (isAdmin === false) {
      console.log("AdminPage: Utilisateur non-admin, redirection vers admin-login");
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les droits administrateur.",
        variant: "destructive",
      });
      navigate("/admin-login", { replace: true });
      return;
    }

    console.log("AdminPage: Accès admin confirmé");
  }, [isAdmin, isError, queryLoading, adminLoading, sessionChecked, initialLoading, navigate, toast]);

  // Affichage pendant le chargement initial ou la vérification
  if (initialLoading || queryLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'interface d'administration...</p>
        </div>
      </div>
    );
  }

  // Une fois que nous avons vérifié que l'utilisateur est admin, afficher la page
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <main className="container mx-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
