
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmptyReservations } from "./EmptyReservations";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { HolidayReservationWithChild } from "@/types/reservations";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useQueryClient } from "@tanstack/react-query";

type GroupedReservations = Record<string, {
  childName: string;
  schoolClass: string;
  reservations: HolidayReservationWithChild[];
}>;

interface ChildReservationCardProps {
  childName: string;
  schoolClass: string;
  reservations: HolidayReservationWithChild[];
  onUpdate: () => void;
}

export const HolidayChildReservationCard = ({
  childName,
  schoolClass,
  reservations,
  onUpdate,
}: ChildReservationCardProps) => {
  return (
    <Card className="overflow-hidden border-gray-100 shadow-sm h-full">
      <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white p-2 md:p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 md:h-7 md:w-7 items-center justify-center rounded-full bg-primary/10">
              <User className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary" />
            </div>
            <div>
              <h3 className="text-xs md:text-sm font-medium text-gray-800">{childName}</h3>
              <p className="text-[10px] md:text-xs text-muted-foreground">{schoolClass}</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 text-[8px] md:text-[10px]">
            {reservations.length} réservation{reservations.length > 1 ? 's' : ''}
          </Badge>
        </div>
      </div>
      <div className="divide-y divide-gray-50 bg-white">
        {reservations.map((reservation) => (
          <div key={reservation.id} className="flex items-center justify-between p-3 transition-colors hover:bg-gray-50">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-800">
                {new Date(reservation.reservation_date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <div className="flex flex-wrap gap-2 mt-1">
                {reservation.without_meal && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                    Sans repas
                  </span>
                )}
                {reservation.early_dropoff && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    Accueil avant 8h30
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const HolidayReservationsList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isTeenPage = window.location.pathname === "/teenholiday-reservations";

  const { data: schoolClassCategories } = useQuery({
    queryKey: ["schoolClassCategories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("school_class_categories")
        .select("*");
      
      if (error) throw error;
      return data;
    },
  });

  const { data: reservations, isError, error, refetch } = useQuery({
    queryKey: ["holiday_reservations"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: userChildren } = await supabase
        .from("children")
        .select("id")
        .eq('profile_id', user.id);

      if (!userChildren || userChildren.length === 0) {
        return [];
      }

      const childrenIds = userChildren.map(child => child.id);

      const { data: rawReservations, error } = await supabase
        .from("holiday_reservations")
        .select(`
          *,
          children:children (
            id,
            first_name,
            last_name,
            school_class,
            profiles (
              school_city
            )
          ),
          available_holiday_periods:available_holiday_periods (*)
        `)
        .eq('status', 'confirmed')
        .in('child_id', childrenIds)
        .order('reservation_date', { ascending: true });
      
      if (error) {
        console.error("Error fetching reservations:", error);
        throw error;
      }

      if (!rawReservations) return [];

      return rawReservations.map((reservation: any): HolidayReservationWithChild => ({
        id: reservation.id,
        child_id: reservation.child_id,
        period_id: reservation.period_id,
        reservation_date: reservation.reservation_date,
        reservation_number: reservation.reservation_number,
        without_meal: reservation.without_meal,
        early_dropoff: reservation.early_dropoff,
        status: reservation.status,
        created_at: reservation.created_at,
        updated_at: reservation.updated_at,
        children: {
          id: reservation.children.id,
          first_name: reservation.children.first_name,
          last_name: reservation.children.last_name,
          school_class: reservation.children.school_class,
          profile: {
            school_city: reservation.children.profiles?.school_city || ''
          }
        },
        available_holiday_periods: reservation.available_holiday_periods
      }));
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('holiday-reservations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'holiday_reservations'
        },
        (payload) => {
          console.log('Changement détecté dans les réservations:', payload);
          queryClient.invalidateQueries({ queryKey: ["holiday_reservations"] });
          queryClient.invalidateQueries({ queryKey: ["spots_left"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  if (isError) {
    const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
    if (errorMessage.includes("Not authenticated")) {
      return (
        <Alert variant="destructive">
          <AlertDescription>
            Vous devez être connecté pour voir vos réservations.{" "}
            <button 
              onClick={() => navigate("/login")}
              className="underline hover:no-underline"
            >
              Se connecter
            </button>
          </AlertDescription>
        </Alert>
      );
    }
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Une erreur est survenue lors du chargement des réservations. Veuillez réessayer.
        </AlertDescription>
      </Alert>
    );
  }

  if (!reservations || reservations.length === 0) {
    return <EmptyReservations />;
  }

  const isTeenClass = (schoolClass: string) => {
    return schoolClassCategories?.some(
      category => 
        category.category === "adolescent" && 
        schoolClass.toUpperCase() === category.name.toUpperCase()
    );
  };

  const filteredReservations = reservations.filter(reservation => {
    const isTeen = isTeenClass(reservation.children.school_class);
    return isTeenPage ? isTeen : !isTeen;
  });

  if (filteredReservations.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">
          Aucune réservation trouvée pour {isTeenPage ? "les adolescents" : "les enfants de maternelle et primaire"}.
        </p>
      </div>
    );
  }

  const reservationsByChild = filteredReservations.reduce((acc, reservation) => {
    const childId = reservation.child_id;
    if (!acc[childId]) {
      acc[childId] = {
        childName: `${reservation.children.first_name} ${reservation.children.last_name}`,
        schoolClass: reservation.children.school_class,
        reservations: [],
      };
    }
    acc[childId].reservations.push(reservation);
    return acc;
  }, {} as GroupedReservations);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
          Vos {isTeenPage ? "activités Club Ado" : "vacances"} réservées (sous réserve de règlement)
        </h2>
        <p className="text-sm text-red-600 mb-4">
          Pour toute modification de vos réservations (ajout ou suppression de journées), merci de contacter l'accueil.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(reservationsByChild).map(([childId, data]) => (
          <HolidayChildReservationCard
            key={childId}
            childName={data.childName}
            schoolClass={data.schoolClass}
            reservations={data.reservations}
            onUpdate={() => refetch()}
          />
        ))}
      </div>
    </div>
  );
};
