
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
import { ScrollArea } from "@/components/ui/scroll-area";

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
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Configuration des classes pour {holiday.name}</DialogTitle>
          <DialogDescription>
            Définissez la catégorie (maternelle, primaire, adolescent) pour chaque classe scolaire spécifiquement pour cette période de vacances. Utilisez "Aucune catégorie" pour exclure une classe de cette période.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(80vh-130px)]">
          <div className="p-6 pt-2">
            <ClassMappingManager 
              holidayPeriodId={holiday.id}
              onMappingChange={() => {
                if (onSuccess) onSuccess();
              }}
            />
          </div>
        </ScrollArea>

        <div className="flex justify-end p-6 pt-2 border-t">
          <Button variant="outline" onClick={handleClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditHolidayClassMappings;
