import { WednesdayReservationContent } from "@/components/reservations/WednesdayReservationContent";
import { ReservationsList } from "@/components/reservations/ReservationsList";
import { CalendarDays } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type ReservationWithChild = Tables<"reservations"> & {
  children: Tables<"children">;
};

const WednesdayReservations = () => {
  const { data: reservations } = useQuery({
    queryKey: ["reservations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select(`
          *,
          children (*)
        `)
        .is('period_id', null) // Only get non-holiday reservations
        .order('reservation_date', { ascending: true });
      
      if (error) throw error;
      return data as ReservationWithChild[];
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar />
      
      <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              Réservations mercredis
            </h1>
          </div>
          <p className="text-muted-foreground text-base md:text-lg">
            Réservez les mercredis pour vos enfants.
          </p>
        </div>

        <WednesdayReservationContent />

        <div className="bg-white rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100 overflow-hidden">
          <div className="p-4 md:p-6">
            <ReservationsList reservations={reservations} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WednesdayReservations;