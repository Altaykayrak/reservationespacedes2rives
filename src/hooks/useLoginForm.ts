
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useLoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Récupérer la page d'origine si elle existe (pour la redirection post-connexion)
  const from = location.state?.from?.pathname || "/profile";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[useLoginForm] Tentative de connexion avec l'email:", email);
    
    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Connexion avec Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (signInError) {
        console.error("[useLoginForm] Erreur de connexion:", signInError);
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Identifiant ou mot de passe incorrect merci d'essayer de nouveau ou cliquer sur \"mot de passe oublié\"");
        } else {
          setError("Une erreur est survenue lors de la connexion. Veuillez réessayer.");
        }
        setIsLoading(false);
        return;
      }

      if (data.session) {
        console.log("[useLoginForm] Connexion réussie, session établie:", data.session);
        toast.success("Connexion réussie");
        
        // Utiliser un délai plus long pour permettre à la session d'être pleinement établie
        setTimeout(async () => {
          // Vérifier que la session est toujours valide après le délai
          const { data: sessionCheck } = await supabase.auth.getSession();
          if (sessionCheck.session) {
            console.log("[useLoginForm] Session confirmée, redirection vers:", from);
            navigate(from, { replace: true });
          } else {
            console.error("[useLoginForm] Session perdue après délai, nouvel essai...");
            // Tenter de récupérer la session une dernière fois
            const { data: lastAttempt } = await supabase.auth.getSession();
            if (lastAttempt.session) {
              navigate(from, { replace: true });
            } else {
              setError("Problème de persistance de session. Veuillez réessayer.");
              setIsLoading(false);
            }
          }
        }, 1000); // Augmenter le délai à 1 seconde pour plus de fiabilité
      } else {
        setError("Session non établie. Veuillez réessayer.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("[useLoginForm] Erreur complète:", err);
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
