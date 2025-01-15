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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Vérifier d'abord si l'email est autorisé
      const { data: authorizedEmail } = await supabase
        .from("authorized_emails")
        .select("id")
        .eq("email", email.trim())
        .maybeSingle();

      if (!authorizedEmail) {
        setError("Vous n'êtes pas encore inscrit à l'espace des 2 rives, merci de contacter l'accueil pour prendre rendez-vous pour une inscription");
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (signInError) {
        if (signInError instanceof AuthApiError) {
          if (signInError.message.includes("Invalid login credentials")) {
            setError("Mot de passe invalide, si vous ne souvenez plus de votre mot de passe, cliquez sur le bouton \"mot de passe oublié\" ci dessous");
            return;
          }
        }
        setError("Une erreur est survenue lors de la connexion. Veuillez réessayer.");
        return;
      }

      if (data?.user) {
        toast.success("Connexion réussie");
        navigate("/profile");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Une erreur est survenue lors de la connexion. Veuillez réessayer.");
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