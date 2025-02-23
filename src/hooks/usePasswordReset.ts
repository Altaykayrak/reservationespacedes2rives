
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { checkAuthorizedEmail, sendPasswordResetEmail } from "@/utils/passwordResetUtils";

interface FormState {
  email: string;
  isLoading: boolean;
  error: string | null;
}

const initialFormState: FormState = {
  email: "",
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

      await sendPasswordResetEmail(formState.email);
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

  const handleInputChange = (email: string) => {
    setFormState(prev => ({
      ...prev,
      email,
      error: null,
    }));
  };

  return {
    formState,
    handleEmailSubmit,
    handleInputChange,
  };
};
