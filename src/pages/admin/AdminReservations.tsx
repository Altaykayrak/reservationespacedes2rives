
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { useAdminAuth } from "@/components/admin/reservations/hooks/useAdminAuth";
import { useAdminReservations } from "@/components/admin/reservations/hooks/useAdminReservations";
import { AdminReservationsContent } from "@/components/admin/reservations/AdminReservationsContent";

const AdminReservations = () => {
  const { data: isAdmin } = useAdminAuth();
  const { data: reservations, refetch: refetchReservations, isLoading, error: queryError } = useAdminReservations(isAdmin);

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
      <AdminReservationsContent
        reservations={reservations}
        isLoading={isLoading}
        refetchReservations={refetchReservations}
      />
    </div>
  );
};

export default AdminReservations;
