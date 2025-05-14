
import { useState } from "react";
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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

      // Invalider et forcer un préchargement des données admin
      queryClient.invalidateQueries({ queryKey: ['admin-status'] });
      await queryClient.prefetchQuery({
        queryKey: ['admin-status'],
        queryFn: async () => {
          return { isAdmin: true, isLoading: false };
        }
      });

      toast({
        title: "Succès",
        description: "Connexion administrateur réussie"
      });
      
      // Attendre un moment avant la redirection pour laisser le temps à la session de s'établir
      setTimeout(() => {
        setIsLoading(false);
        // Redirection avec remplacement pour éviter de revenir en arrière
        navigate("/admin", { replace: true });
      }, 500);

    } catch (err) {
      console.error("Connection error:", err);
      setError("Une erreur est survenue lors de la connexion");
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Administration" description="Connectez-vous à l'interface d'administration">
      <LoginForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        isLoading={isLoading}
        error={error}
        onSubmit={handleSubmit}
      />
    </AuthLayout>
  );
};

export default AdminLoginPage;
