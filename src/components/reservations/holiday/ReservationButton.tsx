
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ReservationButtonProps {
  onSubmitClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isDisabled: boolean;
  isSubmitting: boolean;
}

export const ReservationButton = ({
  onSubmitClick,
  isDisabled,
  isSubmitting
}: ReservationButtonProps) => {
  return (
    <div className="flex justify-end mt-6">
      <Button
        onClick={onSubmitClick}
        className="w-full md:w-auto"
        disabled={isDisabled}
        type="button"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Réservation en cours...
          </>
        ) : (
          "Confirmer réservation"
        )}
      </Button>
    </div>
  );
};
