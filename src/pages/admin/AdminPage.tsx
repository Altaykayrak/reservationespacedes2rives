
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
  const [initialSessionCheck, setInitialSessionCheck] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  
  // Étape 1: Vérification initiale de la session pour éviter les redirections prématurées
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const sessionExists = !!data.session;
        setHasSession(sessionExists);
        
        console.log("AdminPage: Vérification initiale de session:", sessionExists ? "Session trouvée" : "Aucune session");
        
        // Si aucune session, rediriger immédiatement
        if (!sessionExists) {
          console.log("AdminPage: Aucune session trouvée, redirection vers login");
          navigate("/admin-login", { replace: true });
        }
        
      } catch (error) {
        console.error("Erreur lors de la vérification de session:", error);
      } finally {
        setInitialSessionCheck(true);
      }
    };

    checkSession();
  }, [navigate]);
  
  // Étape 2: Vérification du statut admin seulement après confirmation de session
  useEffect(() => {
    // Ne vérifier le statut admin que si:
    // 1. La vérification initiale de session est terminée
    // 2. Une session existe
    // 3. La requête admin n'est plus en chargement
    // 4. Aucune redirection n'a déjà été tentée
    if (initialSessionCheck && hasSession && !adminLoading && !queryLoading && !redirectAttempted) {
      console.log("AdminPage: Vérification admin complète, isAdmin =", isAdmin, "isError =", isError);
      
      // Marquer que nous avons tenté une redirection pour éviter les boucles
      setRedirectAttempted(true);
      
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
    }
  }, [isAdmin, isError, queryLoading, adminLoading, initialSessionCheck, hasSession, navigate, toast, redirectAttempted]);

  // Affichage pendant les différentes phases de chargement
  if (!initialSessionCheck || !hasSession || queryLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'interface d'administration...</p>
          <p className="text-sm text-gray-400 mt-2">
            {!initialSessionCheck ? "Vérification de la session..." : 
             !hasSession ? "Récupération des informations de session..." :
             "Vérification des droits administrateur..."}
          </p>
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
