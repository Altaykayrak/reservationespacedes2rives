
import { Outlet } from "react-router-dom";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function AdminPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Vérification directe du statut admin lors du chargement de la page
    // Cela évite les problèmes liés aux hooks React Query
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          console.log("AdminPage: No session found");
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }
        
        console.log("AdminPage: Checking admin status for", session.user.id);
        const { data: adminResult, error } = await supabase
          .rpc('is_admin', { user_id: session.user.id });
          
        if (error) {
          console.error("AdminPage: Error checking admin status", error);
          setIsAdmin(false);
        } else {
          console.log("AdminPage: Admin check result", adminResult);
          setIsAdmin(!!adminResult);
        }
      } catch (err) {
        console.error("AdminPage: Error in admin check", err);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'interface d'administration...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Accès non autorisé</h1>
          <p className="text-gray-700 mb-4">
            Vous n'avez pas les droits administrateur nécessaires pour accéder à cette page.
          </p>
          <p className="text-gray-600">
            Veuillez vous connecter avec un compte administrateur ou contacter un administrateur système.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <main className="container mx-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
