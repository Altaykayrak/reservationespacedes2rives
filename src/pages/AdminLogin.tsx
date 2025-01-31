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
import { useToast } from "@/components/ui/use-toast";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select()
          .eq('username', username)
          .single();

        if (adminUser) {
          setIsAuthenticated(true);
          navigate("/admin");
        }
      }
    };

    checkAdminAuth();
  }, [navigate, username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // First, sign in with Supabase auth
      const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
        email: `${username.trim()}@admin.com`, // Using a consistent email format for admin users
        password: password.trim(),
      });

      if (authError) throw authError;

      if (!session) {
        throw new Error("No session created");
      }

      // Then verify against admin_users table
      const { data: adminUser, error: queryError } = await supabase
        .from('admin_users')
        .select()
        .eq('username', username.trim())
        .eq('password', password.trim())
        .single();

      if (queryError) {
        console.error("Erreur de requête admin:", queryError);
        throw queryError;
      }

      if (adminUser) {
        localStorage.setItem('adminSession', 'true');
        setIsAuthenticated(true);
        console.log("Admin authenticated:", adminUser);
        
        toast({
          title: "Succès",
          description: "Connexion administrateur réussie"
        });
        
        navigate("/admin");
      } else {
        setError("Nom d'utilisateur ou mot de passe incorrect");
        setShowErrorDialog(true);
      }
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