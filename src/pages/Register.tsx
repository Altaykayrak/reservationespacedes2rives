
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { RegisterForm } from "@/components/forms/RegisterForm";
import { registerUser } from "@/services/authService";
import type { RegisterFormData } from "@/schemas/registerSchema";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (values: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser(values);
      setShowSuccessDialog(true);
    } catch (error: any) {
      console.error("Registration error:", error);
      setErrorMessage(error.message || "Une erreur est survenue lors de l'inscription");
      setShowErrorDialog(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessDialog(false);
    navigate("/login");
  };

  return (
    <>
      <AuthLayout
        title="Inscription"
        description="Créez votre compte pour accéder à L'espace des deux rives"
        subDescription="Merci de remplir tout les champs du formulaire."
      >
        <RegisterForm onSubmit={handleSubmit} isLoading={isLoading} />
      </AuthLayout>

      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Erreur d'inscription</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => setShowErrorDialog(false)}>
              D'accord
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Inscription réussie !</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter pour réserver les vacances pour vos enfants.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={handleSuccessConfirm}>
              Aller à la page de connexion
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Register;
