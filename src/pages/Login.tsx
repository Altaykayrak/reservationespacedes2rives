import { AuthLayout } from "@/components/layouts/AuthLayout";
import { LoginForm } from "@/components/forms/LoginForm";
import { useLoginForm } from "@/hooks/useLoginForm";

const Login = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    error,
    handleSubmit,
  } = useLoginForm();

  return (
    <AuthLayout
      title="Connexion"
      description="Bienvenue sur L'espace des deux rives"
    >
      <LoginForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        isLoading={isLoading}
        error={error}
        onSubmit={handleSubmit}
      />
    </AuthLayout>
  );
};

export default Login;