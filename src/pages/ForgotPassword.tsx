
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { EmailForm } from "@/components/auth/EmailForm";
import { usePasswordReset } from "@/hooks/usePasswordReset";

const ForgotPassword = () => {
  const { formState, handleEmailSubmit, handleInputChange } = usePasswordReset();

  return (
    <AuthLayout
      title="Mot de passe oublié"
      description="Entrez votre email pour recevoir un lien de réinitialisation"
    >
      {formState.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{formState.error}</AlertDescription>
        </Alert>
      )}

      <EmailForm
        email={formState.email}
        isLoading={formState.isLoading}
        onEmailChange={(email) => handleInputChange(email)}
        onSubmit={handleEmailSubmit}
      />

      <div className="text-center text-sm mt-4">
        <Link to="/login" className="text-primary hover:underline">
          Retour à la connexion
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
