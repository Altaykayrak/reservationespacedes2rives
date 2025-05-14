
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { LoginForm } from "@/components/forms/LoginForm";
import { AuthLayout } from "@/components/layouts/AuthLayout";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Vérifier si l'utilisateur est admin
          const { data: isAdmin, error: adminError } = await supabase
            .rpc('is_admin', { user_id: session.user.id });

          if (adminError) {
            console.error("Error checking admin status:", adminError);
            setIsLoading(false);
            return;
          }

          // Ne plus rediriger même si l'utilisateur est admin
          setIsLoading(false);
        } else {
          // Pas de session, on laisse l'utilisateur sur la page de login
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsLoading(false);
      }
    };

    checkAdminAuth();
  }, [navigate]);

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
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (authError) {
        console.error("Authentication error:", authError);
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

      // Vérifier si l'utilisateur est admin
      const { data: isAdmin, error: adminError } = await supabase
        .rpc('is_admin', { user_id: authData.user.id });

      if (adminError) {
        console.error("Error checking admin role:", adminError);
        setError("Une erreur est survenue lors de la vérification des droits d'accès");
        setShowErrorDialog(true);
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      if (!isAdmin) {
        setError("Vous n'avez pas les droits d'accès administrateur");
        setShowErrorDialog(true);
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      toast({
        title: "Succès",
        description: "Connexion administrateur réussie"
      });
      
      // Ne plus rediriger automatiquement
      setIsLoading(false);

    } catch (err) {
      console.error("Connection error:", err);
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
