import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FormState, FormFieldName } from "@/types/passwordReset";
import { checkAuthorizedEmail, fetchSecretQuestion, verifySecretAnswer } from "@/utils/passwordResetUtils";

const initialFormState: FormState = {
  email: "",
  secretAnswer: "",
  newPassword: "",
  secretQuestion: null,
  isLoading: false,
  error: null,
};

export const usePasswordReset = () => {
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
      const authorizedEmail = await checkAuthorizedEmail(formState.email);
      
      if (!authorizedEmail) {
        setFormState(prev => ({ 
          ...prev, 
          error: "Cette adresse email n'est pas autorisée", 
          isLoading: false 
        }));
        return;
      }

      const profile = await fetchSecretQuestion(formState.email);

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
    if (!formState.secretAnswer) {
      setFormState(prev => ({ ...prev, error: "Veuillez remplir tous les champs" }));
      return;
    }

    setFormState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const isAnswerCorrect = await verifySecretAnswer(formState.email, formState.secretAnswer);

      if (!isAnswerCorrect) {
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

  const updateField = (field: FormFieldName, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  return {
    formState,
    handleEmailSubmit,
    handleResetPassword,
    updateField,
  };
};