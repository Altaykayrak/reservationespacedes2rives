
import { useParams } from "react-router-dom";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { useAdminReservations } from "@/components/admin/reservations/hooks/useAdminReservations";
import { useAdminAuth } from "@/components/admin/reservations/hooks/useAdminAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const AdminChildReservations = () => {
  const { childId } = useParams();
  const { data: isAdmin } = useAdminAuth();
  const { data, isLoading } = useAdminReservations(isAdmin);

  const childWednesdayReservations = data?.wednesdayReservations?.filter(
    (reservation) => reservation.child_id === childId
  );

  const childHolidayReservations = data?.holidayReservations?.filter(
    (reservation) => reservation.child_id === childId
  );

  if (isLoading) {
    return (
      <div>
        <AdminNavbar />
        <div className="container mx-auto p-8">
          <div>Chargement...</div>
        </div>
      </div>
    );
  }

  const childName = childWednesdayReservations?.[0]?.children.first_name || 
                   childHolidayReservations?.[0]?.children.first_name || 
                   "Enfant";

  return (
    <div>
      <AdminNavbar />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Réservations de {childName}</h1>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Réservations des mercredis</CardTitle>
              <CardDescription>Liste des mercredis réservés</CardDescription>
            </CardHeader>
            <CardContent>
              {childWednesdayReservations?.length === 0 ? (
                <p className="text-muted-foreground">Aucune réservation trouvée</p>
              ) : (
                <ul className="space-y-4">
                  {childWednesdayReservations?.map((reservation) => (
                    <li key={reservation.id} className="border p-4 rounded-lg">
                      <div className="font-medium">
                        {format(new Date(reservation.available_wednesdays?.date || ''), 'EEEE d MMMM yyyy', { locale: fr })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {reservation.early_dropoff && "Accueil avant 8h30 • "}
                        {reservation.without_meal ? "Sans repas" : "Avec repas"}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Réservations des vacances</CardTitle>
              <CardDescription>Liste des jours de vacances réservés</CardDescription>
            </CardHeader>
            <CardContent>
              {childHolidayReservations?.length === 0 ? (
                <p className="text-muted-foreground">Aucune réservation trouvée</p>
              ) : (
                <ul className="space-y-4">
                  {childHolidayReservations?.map((reservation) => (
                    <li key={reservation.id} className="border p-4 rounded-lg">
                      <div className="font-medium">
                        {format(new Date(reservation.reservation_date), 'EEEE d MMMM yyyy', { locale: fr })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {reservation.early_dropoff && "Accueil avant 8h30 • "}
                        {reservation.without_meal ? "Sans repas" : "Avec repas"}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminChildReservations;
