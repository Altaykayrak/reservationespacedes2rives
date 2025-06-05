
import { useAdminAuth } from "@/components/admin/reservations/hooks/useAdminAuth";
import { useAdminReservations } from "@/components/admin/reservations/hooks/useAdminReservations";
import { AdminWednesdayReservationsContent } from "@/components/admin/reservations/AdminWednesdayReservationsContent";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminWednesdayReservations = () => {
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
        <h1 className="text-3xl font-bold mb-8">Gestion des réservations - Mercredis</h1>
        <div className="text-red-500">
          Erreur lors du chargement des réservations: {queryError.message}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestion des réservations - Mercredis</h1>
        <div className="flex gap-4">
          <Button onClick={() => navigate('/admin/reservations/new')}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Réserver des mercredis
          </Button>
        </div>
      </div>
      <AdminWednesdayReservationsContent
        wednesdayReservations={data?.wednesdayReservations || null}
        isLoading={isLoading}
        refetchReservations={refetchReservations}
      />
    </div>
  );
};

export default AdminWednesdayReservations;
