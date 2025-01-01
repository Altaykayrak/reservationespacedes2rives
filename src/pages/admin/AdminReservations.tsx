import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const AdminReservations = () => {
  const { toast } = useToast();

  const { data: reservations } = useQuery({
    queryKey: ["admin_reservations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select(`
          *,
          children (
            first_name,
            last_name,
            school_class
          )
        `);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Gestion des réservations</h1>

      <Card className="p-6">
        <div className="space-y-4">
          {reservations?.map((reservation) => (
            <div
              key={reservation.id}
              className="flex items-center justify-between p-4 border rounded"
            >
              <div>
                <p className="font-medium">
                  {reservation.children?.first_name} {reservation.children?.last_name}
                </p>
                <p className="text-sm text-gray-600">
                  Classe: {reservation.children?.school_class}
                </p>
                <p className="text-sm text-gray-600">
                  Date: {new Date(reservation.reservation_date).toLocaleDateString("fr-FR")}
                </p>
                <p className="text-sm text-gray-600">
                  N° de réservation: {reservation.reservation_number}
                </p>
                <div className="mt-2 space-x-2 text-sm">
                  {reservation.without_meal && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Sans repas
                    </span>
                  )}
                  {reservation.early_dropoff && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      Accueil avant 8h30
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AdminReservations;