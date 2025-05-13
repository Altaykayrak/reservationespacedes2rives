
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface CM2SummerAlertProps {
  show: boolean;
}

export const CM2SummerAlert = ({ show }: CM2SummerAlertProps) => {
  if (!show) return null;
  
  return (
    <Alert className="mt-3 bg-blue-50 border-blue-200">
      <Info className="h-4 w-4 text-blue-500" />
      <AlertDescription className="text-sm">
        <span className="font-bold text-red-500 animate-blink">
          Sur le mois de juillet, les enfants en CM2 seront accueilli avec les adolescents, vous pouvez faire votre réservation dans le menu "Club Ado"
        </span>
      </AlertDescription>
    </Alert>
  );
};
