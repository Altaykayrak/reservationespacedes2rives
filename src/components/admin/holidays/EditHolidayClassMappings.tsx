
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";
import ClassMappingManager from "./ClassMappingManager";

type HolidayPeriod = Tables<"available_holiday_periods">;

interface EditHolidayClassMappingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holiday: HolidayPeriod | null;
  onSuccess?: () => void;
}

export const EditHolidayClassMappings = ({
  open,
  onOpenChange,
  holiday,
  onSuccess
}: EditHolidayClassMappingsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      if (onSuccess) onSuccess();
    }
  };

  if (!holiday) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configuration des classes pour {holiday.name}</DialogTitle>
          <DialogDescription>
            Définissez la catégorie (maternelle, primaire, adolescent) pour chaque classe scolaire spécifiquement pour cette période de vacances. Utilisez "Aucune catégorie" pour exclure une classe de cette période.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <ClassMappingManager 
            holidayPeriodId={holiday.id}
            onMappingChange={() => {
              if (onSuccess) onSuccess();
            }}
          />
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={handleClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditHolidayClassMappings;
