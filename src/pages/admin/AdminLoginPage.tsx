
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
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

          // Ne rediriger que si l'utilisateur est admin
          if (isAdmin) {
            navigate("/admin");
          }
        }
        setIsLoading(false);
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
      
      navigate("/admin");

    } catch (err) {
      console.error("Connection error:", err);
      setError("Une erreur est survenue lors de la connexion");
      setShowErrorDialog(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement...</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Administration</CardTitle>
          <CardDescription>
            Connectez-vous à l'interface d'administration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <PasswordInput
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Erreur de connexion</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminLoginPage;
