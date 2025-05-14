
import { Outlet, useNavigate } from "react-router-dom";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { useState, useEffect, useCallback } from "react";
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
  const [sessionStable, setSessionStable] = useState(false);

  // Déterminer si nous avons essayé une redirection
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  
  // Étape 1: Vérification initiale et stabilisation de la session
  useEffect(() => {
    let isMounted = true;
    let stabilityTimer: number;

    const checkSession = async () => {
      try {
        // Assurer que la session a eu le temps de s'établir complètement
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data } = await supabase.auth.getSession();
        const sessionExists = !!data.session;
        
        if (isMounted) {
          setHasSession(sessionExists);
          console.log("AdminPage: Vérification initiale de session:", sessionExists ? "Session trouvée" : "Aucune session");
          
          // Si aucune session, rediriger immédiatement sans attendre
          if (!sessionExists) {
            console.log("AdminPage: Aucune session trouvée, redirection vers login");
            setRedirectAttempted(true);
            navigate("/admin-login", { replace: true });
          } else {
            // Donner du temps à la session pour "stabiliser"
            stabilityTimer = window.setTimeout(() => {
              if (isMounted) {
                setSessionStable(true);
              }
            }, 800);
          }
          setInitialSessionCheck(true);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de session:", error);
        if (isMounted) {
          setInitialSessionCheck(true);
          setRedirectAttempted(true);
          navigate("/admin-login", { replace: true });
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
      clearTimeout(stabilityTimer);
    };
  }, [navigate]);
  
  // Fonction sécurisée pour rediriger vers admin-login
  const safeRedirect = useCallback(() => {
    if (!redirectAttempted) {
      setRedirectAttempted(true);
      console.log("AdminPage: Redirection vers login (non-admin)");
      navigate("/admin-login", { replace: true });
    }
  }, [navigate, redirectAttempted]);

  // Étape 2: Vérification du statut admin seulement si la session est stable
  useEffect(() => {
    // Ne vérifier que si toutes les conditions sont remplies
    if (
      initialSessionCheck && 
      hasSession && 
      sessionStable && 
      !adminLoading && 
      !queryLoading && 
      !redirectAttempted
    ) {
      console.log("AdminPage: Vérification admin complète, isAdmin =", isAdmin, "isError =", isError);
      
      if (isError) {
        toast({
          title: "Erreur",
          description: "Impossible de vérifier vos droits administrateur.",
          variant: "destructive",
        });
        safeRedirect();
        return;
      }
      
      if (isAdmin === false) {
        console.log("AdminPage: Utilisateur non-admin, redirection vers admin-login");
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les droits administrateur.",
          variant: "destructive",
        });
        safeRedirect();
        return;
      }

      console.log("AdminPage: Accès admin confirmé");
    }
  }, [
    isAdmin, 
    isError, 
    queryLoading, 
    adminLoading, 
    initialSessionCheck, 
    hasSession, 
    sessionStable,
    redirectAttempted, 
    safeRedirect, 
    toast
  ]);

  // Affichage pendant les différentes phases de chargement
  if (!initialSessionCheck || !hasSession || !sessionStable || queryLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'interface d'administration...</p>
          <p className="text-sm text-gray-400 mt-2">
            {!initialSessionCheck ? "Vérification de la session..." : 
             !hasSession ? "Récupération des informations de session..." :
             !sessionStable ? "Stabilisation de la session..." :
             "Vérification des droits administrateur..."}
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin && !queryLoading) {
    console.log("Redirection déclenchée depuis le rendu (non admin)");
    // Ne pas créer une boucle infinie, utiliser un effet pour rediriger
    if (!redirectAttempted) {
      setRedirectAttempted(true);
      safeRedirect();
    }
    return null;
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
