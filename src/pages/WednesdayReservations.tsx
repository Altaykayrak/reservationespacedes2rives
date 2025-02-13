
import { WednesdayReservationContent } from "@/components/reservations/WednesdayReservationContent";
import { ReservationsList } from "@/components/reservations/ReservationsList";
import { CalendarDays } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { WednesdayReservationWithChild } from "@/types/reservations";

const WednesdayReservations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session && !loading) {
          console.log("No session found, redirecting to login");
          toast({
            title: "Accès non autorisé",
            description: "Veuillez vous connecter pour accéder à cette page",
            variant: "destructive",
          });
          navigate("../login", { relative: "path" });
        }
        setIsInitialized(true);
      } catch (error) {
        console.error("Error checking session:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la vérification de votre session",
          variant: "destructive",
        });
        navigate("../login", { relative: "path" });
      }
    };

    initializeAuth();
  }, [navigate, toast, loading]);

  const { data: reservations, isError } = useQuery({
    queryKey: ["wednesday_reservations"],
    queryFn: async () => {
      if (!user?.id) return [];

      // Récupérer d'abord les enfants de l'utilisateur
      const { data: userChildren, error: childrenError } = await supabase
        .from('children')
        .select('id')
        .eq('profile_id', user.id);

      if (childrenError) throw childrenError;
      if (!userChildren?.length) return [];

      const childrenIds = userChildren.map(child => child.id);

      // Récupérer les réservations avec les jointures
      const { data, error } = await supabase
        .from('wednesday_reservations')
        .select(`
          id,
          child_id,
          wednesday_id,
          without_meal,
          early_dropoff,
          status,
          created_at,
          updated_at,
          children!wednesday_reservations_child_id_fkey (
            id,
            first_name,
            last_name,
            school_class
          ),
          available_wednesdays!fk_wednesday_id (
            id,
            date,
            max_participants_kindergarten,
            max_participants_primary
          )
        `)
        .eq('status', 'confirmed')
        .in('child_id', childrenIds)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Type assertion plus sûre avec une vérification des données
      const validReservations = (data || []).map(reservation => {
        if (!reservation.children || !reservation.available_wednesdays) {
          console.error("Invalid reservation data:", reservation);
          return null;
        }
        return reservation as WednesdayReservationWithChild;
      }).filter((r): r is WednesdayReservationWithChild => r !== null);

      return validReservations;
    },
    enabled: !!user && isInitialized,
  });

  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Oops!</h1>
          <p className="text-gray-600">
            Une erreur est survenue lors du chargement des réservations.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Retour
          </button>
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
