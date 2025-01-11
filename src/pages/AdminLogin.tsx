import { AuthLayout } from "@/components/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();
      
      console.log("Tentative de connexion admin avec:", { username: trimmedUsername });
      
      // Utilisation de .eq exact pour la comparaison
      const { data: adminUsers, error: queryError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', trimmedUsername)
        .eq('password', trimmedPassword);

      console.log("Résultat de la requête admin:", { 
        hasData: adminUsers && adminUsers.length > 0,
        error: queryError,
        foundUsers: adminUsers?.length
      });

      if (queryError) {
        console.error("Erreur de requête admin:", queryError);
        throw queryError;
      }

      if (adminUsers && adminUsers.length > 0) {
        console.log("Connexion admin réussie");
        toast({
          title: "Succès",
          description: "Connexion administrateur réussie"
        });
        navigate("/admin");
      } else {
        console.log("Aucun administrateur trouvé avec ces identifiants");
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