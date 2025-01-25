import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type FormState = {
  email: string;
  secretAnswer: string;
  newPassword: string;
  isLoading: boolean;
  error: string | null;
  secretQuestion: string | null;
}

const initialState: FormState = {
  email: "",
  secretAnswer: "",
  newPassword: "",
  isLoading: false,
  error: null,
  secretQuestion: null,
};

export const usePasswordReset = () => {
  const [formState, setFormState] = useState<FormState>(initialState);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.email) {
      setFormState(state => ({ ...state, error: "Veuillez entrer votre adresse email" }));
      return;
    }

    setFormState(state => ({ ...state, isLoading: true, error: null }));

    try {
      const { data: authorizedEmail, error: authEmailError } = await supabase
        .from("authorized_emails")
        .select("email")
        .eq("email", formState.email.trim())
        .maybeSingle();

      if (authEmailError) throw authEmailError;

      if (!authorizedEmail) {
        setFormState(state => ({ 
          ...state, 
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
        setFormState(state => ({ 
          ...state, 
          error: "Aucun compte trouvé avec cette adresse email", 
          isLoading: false 
        }));
        return;
      }

      setFormState(state => ({
        ...state,
        secretQuestion: profile.secret_question,
        isLoading: false,
      }));
    } catch (err) {
      console.error("Error fetching secret question:", err);
      setFormState(state => ({
        ...state,
        error: "Une erreur inattendue est survenue",
        isLoading: false,
      }));
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.secretAnswer) {
      setFormState(state => ({ ...state, error: "Veuillez remplir tous les champs" }));
      return;
    }

    setFormState(state => ({ ...state, isLoading: true, error: null }));

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
        setFormState(state => ({ 
          ...state, 
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
      setFormState(state => ({
        ...state,
        error: "Une erreur est survenue lors de la réinitialisation du mot de passe",
        isLoading: false,
      }));
    }
  };

  const updateField = (field: keyof FormState, value: string) => {
    setFormState(state => ({ ...state, [field]: value }));
  };

  return {
    formState,
    handleEmailSubmit,
    handleResetPassword,
    updateField,
  };
};