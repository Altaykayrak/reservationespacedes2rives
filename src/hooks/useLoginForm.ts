
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
      // Réinitialiser le localStorage pour éviter les conflits de session
      localStorage.removeItem("supabase.auth.token");
      
      // Connexion avec Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (signInError) {
        console.error("Erreur de connexion:", signInError);
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Identifiant ou mot de passe incorrect merci d'essayer de nouveau ou cliquer sur \"mot de passe oublié\"");
        } else {
          setError("Une erreur est survenue lors de la connexion. Veuillez réessayer.");
        }
        setIsLoading(false);
        return;
      }

      if (data.session) {
        console.log("Connexion réussie, session établie:", data.session);
        
        // Stocker explicitement la session dans le localStorage
        localStorage.setItem("supabase.auth.token", JSON.stringify({
          currentSession: data.session,
          expiresAt: data.session.expires_at
        }));
        
        toast.success("Connexion réussie");
        
        // Attendre un moment pour assurer que la session est bien enregistrée
        setTimeout(() => {
          // Forcer un rafraîchissement complet de la page pour s'assurer que 
          // tous les composants reconnaissent la nouvelle session
          window.location.href = '/profile';
        }, 1000);
      } else {
        setError("Session non établie. Veuillez réessayer.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Erreur complète:", err);
      setError("Une erreur est survenue. Veuillez réessayer plus tard.");
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
