// ══════════════════════════════════════════════════════════════════
// src/pages/Rdv.tsx  — Redesign, logique identique
// ══════════════════════════════════════════════════════════════════
import { Navbar } from "@/components/ui/navbar";
import { LoadingState } from "@/components/rdv/LoadingState";
import { UserRdv } from "@/components/rdv/UserRdv";
import { RdvCalendar } from "@/components/rdv/RdvCalendar";
import { AvailableSlots } from "@/components/rdv/AvailableSlots";
import { ConfirmRdvDialog } from "@/components/rdv/ConfirmRdvDialog";
import { ReservationCompleteDialog } from "@/components/rdv/ReservationCompleteDialog";
import { useRdv } from "@/hooks/useRdv";
import { useAccessControl } from "@/hooks/useAccessControl";
import { CalendarDays } from "lucide-react";

export default function RdvPage() {
  const { rdvAccess, loading: accessLoading } = useAccessControl();
  const {
    loading, userRdv, rdvList, selectedDate, setSelectedDate,
    availableSlots, selectedRdv, selectedMotifs, showConfirmDialog,
    setShowConfirmDialog, reservationComplete, setReservationComplete,
    summerRange, handleMotifChange, handleReservation, handleSelectSlot,
    handleCompleteDialogClose,
  } = useRdv();

  if (accessLoading || loading) return <LoadingState />;

  if (!rdvAccess) {
    return (
      <div className="min-h-screen bg-cream font-sans">
        <Navbar />
        <div className="container mx-auto px-4 py-12 max-w-lg">
          <div className="bg-white rounded-2xl border border-sand-dark p-8 text-center">
            <span className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mx-auto mb-4">
              <CalendarDays className="h-7 w-7" />
            </span>
            <h1 className="font-display text-xl font-medium text-charcoal mb-2">
              Rendez-vous d'inscription
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              La prise de rendez-vous pour les inscriptions de l'année 2026-2027 n'est pas encore ouverte.
              Vous serez informé dès que le service sera accessible.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (userRdv) return <UserRdv userRdv={userRdv} />;

  return (
    <div className="min-h-screen bg-cream font-sans">
      <Navbar />
      <div className="container mx-auto px-4 pb-12 max-w-4xl">
        <div className="mt-6 mb-5 space-y-1">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <CalendarDays className="h-5 w-5" />
            </span>
            <h1 className="font-display text-2xl font-medium text-charcoal">
              Rendez-vous d'inscription 2025-2026
            </h1>
          </div>
          <p className="text-muted-foreground text-sm pl-1">
            Une inscription avant chaque début d'année scolaire est obligatoire.
            Sélectionnez une date pour voir les créneaux disponibles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl shadow-sm border border-sand-dark p-5">
            <RdvCalendar
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              rdvList={rdvList}
              summerRange={summerRange}
            />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-sand-dark p-5">
            <AvailableSlots
              selectedDate={selectedDate}
              availableSlots={availableSlots}
              onSelectSlot={handleSelectSlot}
            />
          </div>
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
    </div>
  );
}
