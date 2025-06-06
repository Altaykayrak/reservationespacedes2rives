import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isLoading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}
export const LoginForm = ({
  email,
  setEmail,
  password,
  setPassword,
  isLoading,
  error,
  onSubmit
}: LoginFormProps) => {
  return <>
      {error && <Alert variant="destructive" className="mb-4">
          <AlertDescription className="text-destructive-foreground">{error}</AlertDescription>
        </Alert>}
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="exemple@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <PasswordInput id="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full bg-fuchsia-300 hover:bg-fuchsia-200 text-violet-800 font-semibold text-xs">
          {isLoading ? "Connexion..." : "Se connecter"}
        </Button>
        <div className="text-center text-sm">
          <Link to="/register" className="text-[#1F2937] hover:underline">
            Créer un compte
          </Link>
          <span className="text-[#1F2937]"> • </span>
          <Link to="/forgot-password" className="text-[#1F2937] hover:underline">
            Mot de passe oublié
          </Link>
        </div>
      </form>
    </>;
};