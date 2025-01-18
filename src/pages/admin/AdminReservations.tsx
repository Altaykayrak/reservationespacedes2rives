import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ReservationBadges } from "@/components/reservations/ReservationBadges";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { Pencil, Trash2 } from "lucide-react";

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
      console.log('Fetched reservations:', data);
      return data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  return (
    <div>
      <AdminNavbar />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Gestion des réservations</h1>

        <Card className="p-6">
          <div className="space-y-4">
            {reservations?.map((reservation) => {
              console.log('Rendering reservation:', {
                id: reservation.id,
                withoutMeal: reservation.without_meal,
                earlyDropoff: reservation.early_dropoff
              });
              
              return (
                <div
                  key={reservation.id}
                  className="flex flex-col p-4 border rounded bg-white shadow-sm"
                >
                  <div className="flex justify-between items-start">
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
                      <ReservationBadges 
                        withoutMeal={Boolean(reservation.without_meal)}
                        earlyDropoff={Boolean(reservation.early_dropoff)}
                      />
                      <p className="text-xs text-gray-500">
                        N° de réservation: {reservation.reservation_number}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Modifier la réservation"
                      >
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </button>
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Supprimer la réservation"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminReservations;