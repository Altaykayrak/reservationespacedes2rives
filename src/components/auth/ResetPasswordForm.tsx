import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ResetPasswordFormProps {
  secretQuestion: string;
  secretAnswer: string;
  isLoading: boolean;
  onSecretAnswerChange: (answer: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const ResetPasswordForm = ({
  secretQuestion,
  secretAnswer,
  isLoading,
  onSecretAnswerChange,
  onSubmit,
}: ResetPasswordFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Question secrète</Label>
        <p className="text-sm text-muted-foreground">{secretQuestion}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="secretAnswer">Votre réponse</Label>
        <Input
          id="secretAnswer"
          type="text"
          value={secretAnswer}
          onChange={(e) => onSecretAnswerChange(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
      </Button>
    </form>
  );
};