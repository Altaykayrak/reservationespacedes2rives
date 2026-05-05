
import { useAdminAuth } from "@/components/admin/reservations/hooks/useAdminAuth";
import { HolidayReservationContent } from "@/components/reservations/HolidayReservationContent";
import { CalendarDays } from "lucide-react";
import { useAdminChildrenData } from "@/hooks/useAdminChildrenData";

const AdminNewTeenHolidayReservation = () => {
  const { data: isAdmin } = useAdminAuth();
  const { allChildren, isLoading } = useAdminChildrenData();

  // Filtrer les adolescents (6ème à Terminale) + CM2
  const teenChildren = allChildren?.filter(child => 
    ['6EME', '6ÈME', '5EME', '5ÈME', '4EME', '4ÈME', '3EME', '3ÈME', 
     'SECONDE', 'PREMIERE', 'PREMIÈRE', 'TERMINALE', 'CM2'].includes(child.school_class.toUpperCase())
  );

  console.log("Teen children (including CM2) with parent info:", teenChildren);

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Accès non autorisé</h1>
        <div>Vous devez être administrateur pour accéder à cette page.</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div>Chargement des enfants...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              Réservations Club Ado
            </h1>
          </div>
          <p className="text-muted-foreground text-base md:text-lg">
            Créez une nouvelle réservation pour les adolescents. Minimum 3 jours par semaine.
          </p>
        </div>

        <HolidayReservationContent 
          filteredChildren={teenChildren} 
          filterTeenPeriods={true}
          enforceCM2Summer={true}
        />
      </div>
    </div>
  );
};

export default AdminNewTeenHolidayReservation;
