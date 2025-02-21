
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { useAdminAuth } from "@/components/admin/reservations/hooks/useAdminAuth";
import { HolidayReservationContent } from "@/components/reservations/HolidayReservationContent";
import { CalendarDays } from "lucide-react";

const AdminNewHolidayReservation = () => {
  const { data: isAdmin } = useAdminAuth();

  if (!isAdmin) {
    return (
      <div>
        <AdminNavbar />
        <div className="container mx-auto p-8">
          <h1 className="text-3xl font-bold mb-8">Accès non autorisé</h1>
          <div>Vous devez être administrateur pour accéder à cette page.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <AdminNavbar />
      
      <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                Nouvelle réservation vacances
              </h1>
            </div>
            <p className="text-muted-foreground text-base md:text-lg">
              Créez une nouvelle réservation de vacances pour un enfant.
            </p>
          </div>
        </div>

        <HolidayReservationContent />
      </div>
    </div>
  );
};

export default AdminNewHolidayReservation;
