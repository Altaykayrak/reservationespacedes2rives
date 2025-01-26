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
      setFormState(prev => ({ ...prev, error: "Veuillez entrer votre email" }));
      return;
    }

    setFormState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const authorizedEmail = await checkAuthorizedEmail(formState.email);
      
      if (!authorizedEmail) {
        setFormState(prev => ({ 
          ...prev, 
          error: "Cet email n'est pas autorisé",
          isLoading: false 
        }));
        return;
      }

      const profile = await fetchSecretQuestion(formState.email);

      if (!profile) {
        setFormState(prev => ({ 
          ...prev, 
          error: "Aucun profil trouvé pour cet email",
          isLoading: false 
        }));
        return;
      }

      setFormState(prev => ({
        ...prev,
        secretQuestion: profile.secret_question,
        isLoading: false,
      }));

    } catch (error: any) {
      setFormState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));
    }
  };

  const handleSecretAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.secretAnswer) {
      setFormState(prev => ({ ...prev, error: "Veuillez répondre à la question secrète" }));
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

      setFormState(prev => ({
        ...prev,
        isLoading: false,
      }));

    } catch (error: any) {
      setFormState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.newPassword) {
      setFormState(prev => ({ ...prev, error: "Veuillez entrer un nouveau mot de passe" }));
      return;
    }

    setFormState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formState.email);

      if (error) throw error;

      toast.success("Un email de réinitialisation a été envoyé");
      navigate("/login");
    } catch (error: any) {
      setFormState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));
    }
  };

  const handleInputChange = (field: FormFieldName, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value,
      error: null,
    }));
  };

  return {
    formState,
    handleEmailSubmit,
    handleSecretAnswerSubmit,
    handlePasswordReset,
    handleInputChange,
  };
};