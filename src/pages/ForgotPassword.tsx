import { AuthLayout } from "@/components/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [secretAnswer, setSecretAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secretQuestion, setSecretQuestion] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Veuillez entrer votre adresse email");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First check if the email exists in authorized_emails
      const { data: authorizedEmail, error: authEmailError } = await supabase
        .from("authorized_emails")
        .select("email")
        .eq("email", email.trim())
        .maybeSingle();

      if (authEmailError) {
        throw authEmailError;
      }

      if (!authorizedEmail) {
        setError("Cette adresse email n'est pas autorisée");
        return;
      }

      // Then get the profile associated with this email
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("secret_question")
        .eq("email", email.trim())
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      if (!profile) {
        setError("Aucun compte trouvé avec cette adresse email");
        return;
      }

      setSecretQuestion(profile.secret_question);
    } catch (err) {
      console.error("Error fetching secret question:", err);
      setError("Une erreur inattendue est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretAnswer || !newPassword) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Verify the secret answer
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("secret_answer")
        .eq("email", email.trim())
        .maybeSingle();

      if (profileError || !profile) {
        throw profileError || new Error("Profile not found");
      }

      if (profile.secret_answer.toLowerCase() !== secretAnswer.toLowerCase()) {
        setError("Réponse incorrecte à la question secrète");
        return;
      }

      // Reset the password
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/update-password`,
        }
      );

      if (resetError) {
        throw resetError;
      }

      toast.success("Instructions envoyées par email pour réinitialiser votre mot de passe");
      navigate("/login");
    } catch (err) {
      console.error("Password reset error:", err);
      setError("Une erreur est survenue lors de la réinitialisation du mot de passe");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Mot de passe oublié"
      description={
        secretQuestion
          ? "Répondez à votre question secrète pour réinitialiser votre mot de passe"
          : "Entrez votre email pour accéder à votre question secrète"
      }
    >
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!secretQuestion ? (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
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
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Vérification..." : "Continuer"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label>Question secrète</Label>
            <p className="text-sm text-muted-foreground">{secretQuestion}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="secretAnswer">Votre réponse</Label>
            <Input
              id="secretAnswer"
              type="text"
              value={secretAnswer}
              onChange={(e) => setSecretAnswer(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
          </Button>
        </form>
      )}

      <div className="text-center text-sm mt-4">
        <Link to="/login" className="text-primary hover:underline">
          Retour à la connexion
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;