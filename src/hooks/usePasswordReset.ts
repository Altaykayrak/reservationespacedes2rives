
import { useState } from "react";
import { toast } from "sonner";
import { checkAuthorizedEmail, sendPasswordResetEmail } from "@/utils/passwordResetUtils";

interface FormState {
  email: string;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}

const initialFormState: FormState = {
  email: "",
  isLoading: false,
  error: null,
  isSuccess: false,
};

export const usePasswordReset = () => {
  const [formState, setFormState] = useState<FormState>(initialFormState);

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

      await sendPasswordResetEmail(formState.email);
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        isSuccess: true,
      }));
      toast.success("Vous allez recevoir un mail afin de réinitialiser votre mot de passe, merci de suivre les instructions");

    } catch (error: any) {
      setFormState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));
    }
  };

  const handleInputChange = (email: string) => {
    setFormState(prev => ({
      ...prev,
      email,
      error: null,
      isSuccess: false,
    }));
  };

  return {
    formState,
    handleEmailSubmit,
    handleInputChange,
  };
};
