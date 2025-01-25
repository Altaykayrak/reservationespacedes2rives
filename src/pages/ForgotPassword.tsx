import { AuthLayout } from "@/components/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

type FormState = {
  email: string;
  secretAnswer: string;
  newPassword: string;
  isLoading: boolean;
  error: string | null;
  secretQuestion: string | null;
}

const initialFormState: FormState = {
  email: "",
  secretAnswer: "",
  newPassword: "",
  isLoading: false,
  error: null,
  secretQuestion: null,
};

const ForgotPassword = () => {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.email) {
      setFormState(prev => ({ ...prev, error: "Veuillez entrer votre adresse email" }));
      return;
    }

    setFormState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data: authorizedEmail, error: authEmailError } = await supabase
        .from("authorized_emails")
        .select("email")
        .eq("email", formState.email.trim())
        .maybeSingle();

      if (authEmailError) throw authEmailError;

      if (!authorizedEmail) {
        setFormState(prev => ({ 
          ...prev, 
          error: "Cette adresse email n'est pas autorisée", 
          isLoading: false 
        }));
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("secret_question")
        .eq("email", formState.email.trim())
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        setFormState(prev => ({ 
          ...prev, 
          error: "Aucun compte trouvé avec cette adresse email", 
          isLoading: false 
        }));
        return;
      }

      setFormState(prev => ({
        ...prev,
        secretQuestion: profile.secret_question,
        isLoading: false,
      }));
    } catch (err) {
      console.error("Error fetching secret question:", err);
      setFormState(prev => ({
        ...prev,
        error: "Une erreur inattendue est survenue",
        isLoading: false,
      }));
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.secretAnswer || !formState.newPassword) {
      setFormState(prev => ({ ...prev, error: "Veuillez remplir tous les champs" }));
      return;
    }

    setFormState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("secret_answer")
        .eq("email", formState.email.trim())
        .maybeSingle();

      if (profileError || !profile) {
        throw profileError || new Error("Profile not found");
      }

      if (profile.secret_answer.toLowerCase() !== formState.secretAnswer.toLowerCase()) {
        setFormState(prev => ({ 
          ...prev, 
          error: "Réponse incorrecte à la question secrète", 
          isLoading: false 
        }));
        return;
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        formState.email,
        {
          redirectTo: `${window.location.origin}/update-password`,
        }
      );

      if (resetError) throw resetError;

      toast.success("Instructions envoyées par email pour réinitialiser votre mot de passe");
      navigate("/login");
    } catch (err) {
      console.error("Password reset error:", err);
      setFormState(prev => ({
        ...prev,
        error: "Une erreur est survenue lors de la réinitialisation du mot de passe",
        isLoading: false,
      }));
    }
  };

  return (
    <AuthLayout
      title="Mot de passe oublié"
      description={
        formState.secretQuestion
          ? "Répondez à votre question secrète pour réinitialiser votre mot de passe"
          : "Entrez votre email pour accéder à votre question secrète"
      }
    >
      {formState.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{formState.error}</AlertDescription>
        </Alert>
      )}

      {!formState.secretQuestion ? (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="exemple@email.com"
              value={formState.email}
              onChange={(e) => setFormState(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={formState.isLoading}>
            {formState.isLoading ? "Vérification..." : "Continuer"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label>Question secrète</Label>
            <p className="text-sm text-muted-foreground">{formState.secretQuestion}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="secretAnswer">Votre réponse</Label>
            <Input
              id="secretAnswer"
              type="text"
              value={formState.secretAnswer}
              onChange={(e) => setFormState(prev => ({ ...prev, secretAnswer: e.target.value }))}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={formState.isLoading}>
            {formState.isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
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