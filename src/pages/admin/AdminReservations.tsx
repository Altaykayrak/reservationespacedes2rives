import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

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
        `)
        .order('reservation_date', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Gestion des réservations</h1>

      <Card className="p-6">
        <div className="space-y-4">
          {reservations?.map((reservation) => (
            <div
              key={reservation.id}
              className="flex flex-col p-4 border rounded bg-white shadow-sm"
            >
              <div className="flex justify-between items-start w-full">
                <div className="space-y-2">
                  <p className="font-medium text-lg">
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
                </div>
                <div className="flex gap-2">
                  {reservation.without_meal && (
                    <Badge>Sans repas</Badge>
                  )}
                  {reservation.early_dropoff && (
                    <Badge>Accueil avant 8h30</Badge>
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