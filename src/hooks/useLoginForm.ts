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
      // First check if we can connect to Supabase
      try {
        await fetch(supabase.supabaseUrl);
      } catch (err) {
        throw new Error("Failed to fetch");
      }

      // Check if email is authorized
      const { data: authorizedEmail, error: authEmailError } = await supabase
        .from("authorized_emails")
        .select("id")
        .eq("email", email.trim())
        .maybeSingle();

      if (authEmailError) {
        if (authEmailError.message === "Failed to fetch") {
          setError("Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet et réessayer.");
          return;
        }
        throw authEmailError;
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
        if (signInError.message === "Failed to fetch") {
          setError("Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet et réessayer.");
          return;
        }
        setError("Identifiant ou mot de passe incorrect merci d'essayer de nouveau ou cliquer sur \"mot de passe oublié\"");
        return;
      }

      if (data?.user) {
        toast.success("Connexion réussie");
        navigate("/profile");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err instanceof Error && err.message === "Failed to fetch") {
        setError("Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet et réessayer.");
      } else {
        setError("Identifiant ou mot de passe incorrect merci d'essayer de nouveau ou cliquer sur \"mot de passe oublié\"");
      }
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