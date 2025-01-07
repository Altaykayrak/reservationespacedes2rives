import { Calendar } from "lucide-react";

export const EmptyReservations = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      <Calendar className="h-12 w-12 text-muted-foreground" />
      <div>
        <h3 className="font-semibold">Aucune réservation</h3>
        <p className="text-sm text-muted-foreground">
          Vous n'avez pas encore de réservations.
        </p>
      </div>
    </div>
  );
};