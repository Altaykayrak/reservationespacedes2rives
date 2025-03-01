
import { Navbar } from "@/components/ui/navbar";
import { LoadingState } from "@/components/rdv/LoadingState";
import { UserRdv } from "@/components/rdv/UserRdv";
import { RdvCalendar } from "@/components/rdv/RdvCalendar";
import { AvailableSlots } from "@/components/rdv/AvailableSlots";
import { ConfirmRdvDialog } from "@/components/rdv/ConfirmRdvDialog";
import { ReservationCompleteDialog } from "@/components/rdv/ReservationCompleteDialog";
import { useRdv } from "@/hooks/useRdv";

export default function RdvPage() {
  const {
    loading,
    userRdv,
    selectedDate,
    setSelectedDate,
    availableSlots,
    selectedRdv,
    selectedMotifs,
    showConfirmDialog,
    setShowConfirmDialog,
    reservationComplete,
    setReservationComplete,
    summerRange,
    handleMotifChange,
    handleReservation,
    handleSelectSlot,
    handleCompleteDialogClose
  } = useRdv();

  if (loading) {
    return <LoadingState />;
  }

  if (userRdv) {
    return <UserRdv userRdv={userRdv} />;
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Prise de rendez-vous</h1>
          <p className="text-gray-600">
            Sélectionnez une date pour voir les créneaux disponibles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <RdvCalendar 
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            rdvList={availableSlots}
            summerRange={summerRange}
          />

          <AvailableSlots 
            selectedDate={selectedDate}
            availableSlots={availableSlots}
            onSelectSlot={handleSelectSlot}
          />
        </div>

        <ConfirmRdvDialog 
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          selectedRdv={selectedRdv}
          selectedMotifs={selectedMotifs}
          handleMotifChange={handleMotifChange}
          handleReservation={handleReservation}
          isLoading={loading}
        />

        <ReservationCompleteDialog 
          open={reservationComplete}
          onOpenChange={setReservationComplete}
          selectedRdv={selectedRdv}
          selectedMotifs={selectedMotifs}
          onClose={handleCompleteDialogClose}
        />
      </div>
    </>
  );
}
