import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthError, AuthApiError } from "@supabase/supabase-js";
import { toast } from "sonner";

export const useLoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const getErrorMessage = async (error: AuthError) => {
    if (error instanceof AuthApiError) {
      if (error.message.includes("Invalid login credentials")) {
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

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    error,
    handleSubmit,
  };
};