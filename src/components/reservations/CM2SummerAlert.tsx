
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface CM2SummerAlertProps {
  show: boolean;
}

export const CM2SummerAlert = ({ show }: CM2SummerAlertProps) => {
  if (!show) return null;
  
  return (
    <Alert className="mt-4 bg-amber-50 border-amber-200">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Attention</AlertTitle>
      <AlertDescription className="text-amber-700 text-sm">
        Pour les enfants de CM2 pendant les vacances d'été, merci d'utiliser la page 
        "Réservations Club Ado" pour les inscrire.
      </AlertDescription>
    </Alert>
  );
};
