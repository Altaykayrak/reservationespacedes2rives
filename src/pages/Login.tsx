import { AuthLayout } from "@/components/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthError, AuthApiError } from "@supabase/supabase-js";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const getErrorMessage = async (error: AuthError) => {
    if (error instanceof AuthApiError) {
      if (error.message.includes("Invalid login credentials")) {
        // Vérifier si l'email est autorisé
        const { data: authorizedEmail } = await supabase
          .from("authorized_emails")
          .select("email")
          .eq("email", email.trim())
          .maybeSingle();

        if (!authorizedEmail) {
          return 'Vous n\'avez pas de compte actif, merci de cliquer sur le bouton "Créer un compte" ci dessous';
        }
        return 'Votre mot de passe est incorrect. Si vous ne vous en souvenez plus, cliquez sur "mot de passe oublié"';
      }
      return 'Vous n\'avez pas de compte actif, merci de cliquer sur le bouton "Créer un compte" ci dessous';
    }
    return 'Vous n\'avez pas de compte actif, merci de cliquer sur le bouton "Créer un compte" ci dessous';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First check if the email is authorized
      const { data: authorizedEmail, error: authorizedError } = await supabase
        .from("authorized_emails")
        .select("id")
        .eq("email", email.trim())
        .maybeSingle();

      if (authorizedError) {
        setError("Vous n'êtes pas encore inscrit à l'espace des 2 rives, merci de contacter l'accueil pour prendre rendez-vous pour une inscription");
        return;
      }

      if (!authorizedEmail) {
        setError("Vous n'êtes pas encore inscrit à l'espace des 2 rives, merci de contacter l'accueil pour prendre rendez-vous pour une inscription");
        return;
      }

      // Then attempt to sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (signInError) {
        const errorMessage = await getErrorMessage(signInError);
        setError(errorMessage);
        return;
      }

      if (data?.user) {
        toast.success("Connexion réussie");
        navigate("/profile");
      }
    } catch (err: any) {
      setError('Vous n\'avez pas de compte actif, merci de cliquer sur le bouton "Créer un compte" ci dessous');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Connexion"
      description="Bienvenue sur L'espace des deux rives"
    >
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="exemple@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <div className="text-center text-sm">
          <Link to="/register" className="text-primary hover:underline">
            Créer un compte
          </Link>
          {" • "}
          <Link to="/forgot-password" className="text-primary hover:underline">
            Mot de passe oublié
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;