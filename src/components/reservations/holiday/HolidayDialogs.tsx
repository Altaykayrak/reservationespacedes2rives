
import { SuccessReservationDialog } from "../SuccessReservationDialog";
import { NoSpotsDialog } from "../NoSpotsDialog";
import { MinimumDaysDialog } from "../dialogs/MinimumDaysDialog";

interface HolidayDialogsProps {
  showSuccessDialog: boolean;
  setShowSuccessDialog: (show: boolean) => void;
  noSpotsDialog: {
    isOpen: boolean;
    schoolClass?: string;
    date?: Date;
  };
  setNoSpotsDialog: (dialog: {
    isOpen: boolean;
    schoolClass?: string;
    date?: Date;
  }) => void;
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
        onOpenChange={(open) => setNoSpotsDialog({ ...noSpotsDialog, isOpen: open })}
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
