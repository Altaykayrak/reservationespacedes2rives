
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { useAdminAuth } from "@/components/admin/reservations/hooks/useAdminAuth";
import { useAdminReservations } from "@/components/admin/reservations/hooks/useAdminReservations";
import { AdminReservationsContent } from "@/components/admin/reservations/AdminReservationsContent";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";

const AdminReservations = () => {
  const { data: isAdmin } = useAdminAuth();
  const { 
    data, 
    refetch: refetchReservations, 
    isLoading, 
    error: queryError 
  } = useAdminReservations(isAdmin);

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

  if (queryError) {
    return (
      <div>
        <AdminNavbar />
        <div className="container mx-auto p-8">
          <h1 className="text-3xl font-bold mb-8">Gestion des réservations</h1>
          <div className="text-red-500">
            Erreur lors du chargement des réservations: {queryError.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminNavbar />
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestion des réservations</h1>
          <Button onClick={() => window.location.href = '/admin/reservations/new'}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Ajouter une réservation
          </Button>
        </div>
        <AdminReservationsContent
          wednesdayReservations={data?.wednesdayReservations || null}
          holidayReservations={data?.holidayReservations || null}
          isLoading={isLoading}
          refetchReservations={refetchReservations}
        />
      </div>
    </div>
  );
};

export default AdminReservations;
