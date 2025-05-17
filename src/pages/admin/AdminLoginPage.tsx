
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/forms/LoginForm";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogAction } from "@/components/ui/alert-dialog";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        console.log("[AdminLoginPage] Vérification de l'authentification administrateur...");

        // Attendre que le statut d'authentification soit déterminé
        if (loading) {
          console.log("[AdminLoginPage] Chargement de la session en cours...");
          return;
        }

        if (session?.user) {
          console.log("[AdminLoginPage] Session trouvée, vérification si admin:", session.user.id);
          // Vérifier si l'utilisateur est admin
          const { data: isAdmin, error: adminError } = await supabase
            .rpc('is_admin', { user_id: session.user.id });

          if (adminError) {
            console.error("[AdminLoginPage] Erreur lors de la vérification du statut admin:", adminError);
            setIsLoading(false);
            return;
          }

          if (isAdmin) {
            console.log("[AdminLoginPage] Utilisateur authentifié comme admin");
            toast.success("Vous êtes déjà connecté en tant qu'administrateur");
            // Ajouter la redirection vers la page d'administration
            navigate("/admin");
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("[AdminLoginPage] Erreur lors de la vérification de l'authentification:", error);
        setIsLoading(false);
      }
    };

    checkAdminAuth();
  }, [session, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs");
      setShowErrorDialog(true);
      return;
    }

    try {
      setIsLoading(true);
      
      console.log("[AdminLoginPage] Tentative de connexion avec email:", email);
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (authError) {
        console.error("[AdminLoginPage] Erreur d'authentification:", authError);
        setError("Email ou mot de passe incorrect");
        setShowErrorDialog(true);
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setError("Utilisateur non trouvé");
        setShowErrorDialog(true);
        setIsLoading(false);
        return;
      }

      console.log("[AdminLoginPage] Connexion réussie, vérification des droits admin pour:", authData.user.id);
      
      // Vérifier si l'utilisateur est admin
      const { data: isAdmin, error: adminError } = await supabase
        .rpc('is_admin', { user_id: authData.user.id });

      if (adminError) {
        console.error("[AdminLoginPage] Erreur lors de la vérification du rôle admin:", adminError);
        setError("Une erreur est survenue lors de la vérification des droits d'accès");
        setShowErrorDialog(true);
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      if (!isAdmin) {
        console.log("[AdminLoginPage] L'utilisateur n'est pas admin, déconnexion");
        setError("Vous n'avez pas les droits d'accès administrateur");
        setShowErrorDialog(true);
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      console.log("[AdminLoginPage] Connexion admin réussie!");
      toast.success("Connexion administrateur réussie");
      
      // Ajouter la redirection vers /admin après une authentification réussie
      setTimeout(() => {
        navigate("/admin");
      }, 500);
      
      setIsLoading(false);
      
    } catch (err) {
      console.error("[AdminLoginPage] Erreur de connexion:", err);
      setError("Une erreur est survenue lors de la connexion");
      setShowErrorDialog(true);
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

      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Erreur de connexion</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthLayout>
  );
};

export default AdminLoginPage;
