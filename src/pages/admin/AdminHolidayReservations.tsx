
import { useAdminAuth } from "@/components/admin/reservations/hooks/useAdminAuth";
import { useAdminReservations } from "@/components/admin/reservations/hooks/useAdminReservations";
import { AdminHolidayReservationsContent } from "@/components/admin/reservations/AdminHolidayReservationsContent";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminHolidayReservations = () => {
  const navigate = useNavigate();
  const { data: isAdmin } = useAdminAuth();
  const { 
    data, 
    refetch: refetchReservations, 
    isLoading, 
    error: queryError 
  } = useAdminReservations(isAdmin);

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Accès non autorisé</h1>
        <div>Vous devez être administrateur pour accéder à cette page.</div>
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Gestion des réservations - Vacances</h1>
        <div className="text-red-500">
          Erreur lors du chargement des réservations: {queryError.message}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestion des réservations - Vacances</h1>
        <div className="flex gap-4">
          <Button 
            variant="secondary" 
            onClick={() => navigate('/admin/reservations/new-holiday')}
          >
            <CalendarPlus className="mr-2 h-4 w-4" />
            Réserver des vacances
          </Button>
          <Button 
            variant="default"
            onClick={() => navigate('/admin/reservations/new-teen-holiday')}
          >
            <Users className="mr-2 h-4 w-4" />
            Réserver Club Ado
          </Button>
        </div>
      </div>
      <AdminHolidayReservationsContent
        holidayReservations={data?.holidayReservations || null}
        isLoading={isLoading}
        refetchReservations={refetchReservations}
      />
    </div>
  );
};

export default AdminHolidayReservations;
