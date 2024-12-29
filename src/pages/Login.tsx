import { useState } from "react";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulation de connexion
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur L'espace des deux rives",
      });
    }, 1000);
  };

  return (
    <AuthLayout
      title="Connexion"
      description="Bienvenue sur L'espace des deux rives"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="exemple@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Connexion..." : "Se connecter"}
        </Button>
        <div className="text-center text-sm">
          <Link to="/register" className="text-primary hover:underline">
            Créer un compte
          </Link>
          {" • "}
          <Link to="/forgot-password" className="text-primary hover:underline">
            Mot de passe oublié
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;