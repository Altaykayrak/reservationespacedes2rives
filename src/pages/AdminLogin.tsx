import { AuthLayout } from "@/components/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is already authenticated
    const checkAdminAuth = async () => {
      const adminSession = localStorage.getItem('adminSession');
      if (adminSession === 'true') {
        // Verify against admin_users table
        const { data: adminUser, error } = await supabase
          .from('admin_users')
          .select()
          .eq('username', username)
          .single();

        if (adminUser) {
          setIsAuthenticated(true);
          navigate("/admin");
        } else {
          // Clear invalid admin session
          localStorage.removeItem('adminSession');
        }
      }
    };

    checkAdminAuth();
  }, [navigate, username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
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
        // Store admin session
        localStorage.setItem('adminSession', 'true');
        setIsAuthenticated(true);
        
        // Log successful admin login
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
    } catch (err: any) {
      console.error("Erreur lors de la connexion admin:", err);
      setError(err.message || "Une erreur est survenue lors de la connexion");
      setShowErrorDialog(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Administration"
      description="Espace réservé aux administrateurs"
    >
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Nom d'utilisateur</Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Connexion..." : "Se connecter"}
        </Button>
      </form>

      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Erreur de connexion</DialogTitle>
            <DialogDescription>
              {error || "Une erreur est survenue lors de la connexion. Veuillez réessayer."}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </AuthLayout>
  );
};

export default AdminLogin;