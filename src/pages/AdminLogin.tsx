
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

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Vérifier si l'utilisateur est admin
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .eq('role', 'admin')
            .maybeSingle();

          if (roleData?.role === 'admin') {
            // Seulement si l'utilisateur est authentifié ET a le rôle admin
            navigate("/admin");
          } else {
            // Si l'utilisateur est connecté mais n'est pas admin, le déconnecter
            await supabase.auth.signOut();
            localStorage.removeItem('adminSession');
          }
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
        // En cas d'erreur, on s'assure de nettoyer la session
        localStorage.removeItem('adminSession');
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
      // Connexion avec Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (authError) {
        console.error("Erreur d'authentification:", authError);
        setError("Email ou mot de passe incorrect");
        setShowErrorDialog(true);
        return;
      }

      if (!authData.user) {
        setError("Utilisateur non trouvé");
        setShowErrorDialog(true);
        return;
      }

      // Vérifier si l'utilisateur a le rôle admin
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authData.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError) {
        console.error("Erreur de vérification du rôle:", roleError);
        setError("Une erreur est survenue lors de la vérification des droits d'accès");
        setShowErrorDialog(true);
        // Déconnexion car l'utilisateur n'est pas admin
        await supabase.auth.signOut();
        return;
      }

      if (!roleData || roleData.role !== 'admin') {
        setError("Vous n'avez pas les droits d'accès administrateur");
        setShowErrorDialog(true);
        // Déconnexion car l'utilisateur n'est pas admin
        await supabase.auth.signOut();
        return;
      }

      // Si on arrive ici, l'utilisateur est bien admin
      localStorage.setItem('adminSession', 'true');
      
      toast({
        title: "Succès",
        description: "Connexion administrateur réussie"
      });
      
      navigate("/admin");

    } catch (err) {
      console.error("Erreur de connexion:", err);
      setError("Une erreur est survenue lors de la connexion");
      setShowErrorDialog(true);
    }
  };

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
            <Button type="submit" className="w-full">
              Se connecter
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
}
