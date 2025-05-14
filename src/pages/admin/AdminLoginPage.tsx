
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoginForm } from "@/components/forms/LoginForm";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Vérifier l'état d'authentification initial
  useEffect(() => {
    if (initialCheckDone) return;
    
    const checkAdminAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          console.log("No active session, staying on admin login page");
          setIsLoading(false);
          setInitialCheckDone(true);
          return;
        }
        
        // Vérifier si l'utilisateur est admin
        const { data: isAdmin, error: adminError } = await supabase
          .rpc('is_admin', { user_id: session.user.id });

        if (adminError) {
          console.error("Error checking admin status:", adminError);
          setIsLoading(false);
          setInitialCheckDone(true);
          return;
        }

        // Ne rediriger que si l'utilisateur est admin
        if (isAdmin) {
          console.log("Admin user authenticated, redirecting to admin panel");
          // Mettre à jour le cache React Query avec le statut admin
          queryClient.setQueryData(['admin-status'], true);
          navigate("/admin", { replace: true });
          return;
        } else {
          console.log("User authenticated but not admin, staying on login page");
          setError("Vous n'avez pas les droits d'accès administrateur");
        }
        
        setIsLoading(false);
        setInitialCheckDone(true);
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsLoading(false);
        setInitialCheckDone(true);
      }
    };

    checkAdminAuth();
  }, [navigate, queryClient, initialCheckDone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    try {
      setIsLoading(true);
      
      // D'abord, déconnexion pour éviter les problèmes d'état
      await supabase.auth.signOut();
      queryClient.invalidateQueries({ queryKey: ['admin-status'] });
      
      // Ensuite, connexion avec les nouvelles informations
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (authError) {
        console.error("Authentication error:", authError);
        setError("Email ou mot de passe incorrect");
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setError("Utilisateur non trouvé");
        setIsLoading(false);
        return;
      }

      // Vérifier si l'utilisateur est admin
      const { data: isAdmin, error: adminError } = await supabase
        .rpc('is_admin', { user_id: authData.user.id });

      if (adminError) {
        console.error("Error checking admin role:", adminError);
        setError("Une erreur est survenue lors de la vérification des droits d'accès");
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      if (!isAdmin) {
        setError("Vous n'avez pas les droits d'accès administrateur");
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      // Mettre à jour le cache de react-query avec le statut admin
      queryClient.setQueryData(['admin-status'], true);

      toast({
        title: "Succès",
        description: "Connexion administrateur réussie"
      });
      
      navigate("/admin", { replace: true });

    } catch (err) {
      console.error("Connection error:", err);
      setError("Une erreur est survenue lors de la connexion");
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Administration" description="Connectez-vous à l'interface d'administration">
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      ) : (
        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          isLoading={isLoading}
          error={error}
          onSubmit={handleSubmit}
        />
      )}
    </AuthLayout>
  );
};

export default AdminLoginPage;
