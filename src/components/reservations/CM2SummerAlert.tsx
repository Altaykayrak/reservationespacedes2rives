
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface CM2SummerAlertProps {
  show: boolean;
}

export const CM2SummerAlert = ({ show }: CM2SummerAlertProps) => {
  if (!show) return null;
  
  console.log("Affichage de l'alerte CM2 été");
  
  return (
    <Alert className="mt-3 bg-blue-50 border-blue-200">
      <Info className="h-4 w-4 text-blue-500" />
      <AlertDescription className="text-sm flex flex-col gap-2">
        <span className="font-semibold text-blue-700">
          Durant le mois de juillet, les enfants en classe de CM2 sont accueillis avec les adolescents.
        </span>
        <Button variant="outline" size="sm" className="w-fit" asChild>
          <Link to="/teenholiday-reservations">
            Aller aux réservations Club Ado
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
};
