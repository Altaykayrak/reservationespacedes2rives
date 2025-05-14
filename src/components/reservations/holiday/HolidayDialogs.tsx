
import { SuccessReservationDialog } from "../SuccessReservationDialog";
import { NoSpotsDialog } from "../NoSpotsDialog";
import { MinimumDaysDialog } from "../dialogs/MinimumDaysDialog";
import { Dispatch, SetStateAction } from "react";

interface HolidayDialogsProps {
  showSuccessDialog: boolean;
  setShowSuccessDialog: (show: boolean) => void;
  noSpotsDialog: {
    isOpen: boolean;
    schoolClass?: string;
    date?: Date;
  };
  setNoSpotsDialog: Dispatch<SetStateAction<{
    isOpen: boolean;
    schoolClass: string;
    date: Date | null;
  }>>;
  minimumDaysDialog: {
    isOpen: boolean;
  };
  setMinimumDaysDialog: (dialog: { isOpen: boolean }) => void;
}

export const HolidayDialogs = ({
  showSuccessDialog,
  setShowSuccessDialog,
  noSpotsDialog,
  setNoSpotsDialog,
  minimumDaysDialog,
  setMinimumDaysDialog
}: HolidayDialogsProps) => {
  return (
    <>
      <SuccessReservationDialog 
        open={showSuccessDialog} 
        onOpenChange={setShowSuccessDialog}
      />

      <NoSpotsDialog
        open={noSpotsDialog.isOpen}
        onOpenChange={(open) => setNoSpotsDialog(prev => ({ ...prev, isOpen: open }))}
        schoolClass={noSpotsDialog.schoolClass}
        date={noSpotsDialog.date}
      />
      
      <MinimumDaysDialog
        open={minimumDaysDialog.isOpen}
        onOpenChange={(open) => setMinimumDaysDialog({ isOpen: open })}
      />
    </>
  );
};
