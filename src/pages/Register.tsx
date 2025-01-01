import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { RegisterForm } from "@/components/forms/RegisterForm";
import { registerUser } from "@/services/authService";
import type { RegisterFormData } from "@/schemas/registerSchema";

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser(values);
      
      toast.success(
        "Inscription réussie ! Vous allez être redirigé vers la page de connexion."
      );

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(
        error.message || "Une erreur est survenue lors de l'inscription"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Inscription"
      description="Créez votre compte pour accéder à L'espace des deux rives"
    >
      <RegisterForm onSubmit={handleSubmit} isLoading={isLoading} />
    </AuthLayout>
  );
};

export default Register;