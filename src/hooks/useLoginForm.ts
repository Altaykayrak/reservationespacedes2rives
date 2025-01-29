import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useLoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Tentative de connexion avec l'email:", email);
    
    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      console.log("Résultat de la connexion:", { data, signInError });

      if (signInError) {
        console.error("Erreur de connexion:", signInError);
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Identifiant ou mot de passe incorrect merci d'essayer de nouveau ou cliquer sur \"mot de passe oublié\"");
        } else {
          setError("Une erreur est survenue lors de la connexion. Veuillez réessayer.");
        }
        return;
      }

      if (data?.user) {
        console.log("Connexion réussie, redirection...");
        toast.success("Connexion réussie");
        navigate("/profile");
      }
    } catch (err) {
      console.error("Erreur complète:", err);
      setError("Une erreur est survenue. Veuillez réessayer plus tard.");
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