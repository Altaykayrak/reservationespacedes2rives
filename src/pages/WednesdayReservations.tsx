
import { WednesdayReservationContent } from "@/components/reservations/WednesdayReservationContent";
import { ReservationsList } from "@/components/reservations/ReservationsList";
import { CalendarDays } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

type ReservationWithChild = Tables<"reservations"> & {
  children: Tables<"children">;
};

const WednesdayReservations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Vérifier la session au chargement
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        console.error("Erreur de session:", error);
        toast({
          title: "Session expirée",
          description: "Veuillez vous reconnecter pour continuer",
          variant: "destructive",
        });
        navigate("/login");
      }
    };

    checkSession();
  }, [navigate, toast]);

  const { data: reservations, isError } = useQuery({
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
      
      if (error) {
        console.error("Erreur lors de la récupération des réservations:", error);
        throw error;
      }
      return data as ReservationWithChild[];
    },
  });

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Oops!</h1>
          <p className="text-gray-600">
            Une erreur est survenue lors du chargement des réservations.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Retour
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    );
  }

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
