import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: adminUser } = await supabase
            .from('admin_users')
            .select()
            .eq('username', session.user.email)
            .single();

          if (adminUser && localStorage.getItem('adminSession') === 'true') {
            navigate("/admin");
          }
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
        localStorage.removeItem('adminSession');
      }
    };

    checkAdminAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs");
      setShowErrorDialog(true);
      return;
    }

    try {
      // Vérifier d'abord si l'utilisateur est un admin
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select()
        .eq('username', username.trim())
        .single();

      if (adminError || !adminUser) {
        setError("Nom d'utilisateur ou mot de passe incorrect");
        setShowErrorDialog(true);
        return;
      }

      // Authentifier avec Supabase en utilisant l'email formaté
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: username.trim(),
        password: password.trim(),
      });

      if (authError) {
        console.error("Erreur d'authentification:", authError);
        setError("Nom d'utilisateur ou mot de passe incorrect");
        setShowErrorDialog(true);
        return;
      }

      if (!data.session) {
        setError("Erreur lors de la création de la session");
        setShowErrorDialog(true);
        return;
      }

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
                type="text"
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
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