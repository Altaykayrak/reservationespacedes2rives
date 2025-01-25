import { AuthLayout } from "@/components/layouts/AuthLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { EmailForm } from "@/components/auth/EmailForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { usePasswordReset } from "@/hooks/usePasswordReset";

const ForgotPassword = () => {
  const { formState, handleEmailSubmit, handleResetPassword, updateField } = usePasswordReset();

  return (
    <AuthLayout
      title="Mot de passe oublié"
      description={
        formState.secretQuestion
          ? "Répondez à votre question secrète pour réinitialiser votre mot de passe"
          : "Entrez votre email pour accéder à votre question secrète"
      }
    >
      {formState.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{formState.error}</AlertDescription>
        </Alert>
      )}

      {!formState.secretQuestion ? (
        <EmailForm
          email={formState.email}
          isLoading={formState.isLoading}
          onEmailChange={(email) => updateField("email", email)}
          onSubmit={handleEmailSubmit}
        />
      ) : (
        <ResetPasswordForm
          secretQuestion={formState.secretQuestion}
          secretAnswer={formState.secretAnswer}
          isLoading={formState.isLoading}
          onSecretAnswerChange={(answer) => updateField("secretAnswer", answer)}
          onSubmit={handleResetPassword}
        />
      )}

      <div className="text-center text-sm mt-4">
        <Link to="/login" className="text-primary hover:underline">
          Retour à la connexion
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;