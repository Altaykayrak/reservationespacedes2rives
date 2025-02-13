
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

export const HolidayReservationsDisplay = () => {
  const { data: reservations, isError, isLoading } = useQuery({
    queryKey: ["holiday_reservations_display"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: userChildren } = await supabase
        .from("children")
        .select("*")
        .eq('profile_id', user.id);

      if (!userChildren || userChildren.length === 0) {
        return [];
      }

      const childrenIds = userChildren.map(child => child.id);

      const { data, error } = await supabase
        .from("holiday_reservations")
        .select(`
          *,
          children (*)
        `)
        .eq('status', 'confirmed')
        .in('child_id', childrenIds)
        .order('reservation_date', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="text-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Une erreur est survenue lors du chargement des réservations.
        </AlertDescription>
      </Alert>
    );
  }

  if (!reservations || reservations.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">Aucune réservation de vacances trouvée.</p>
      </div>
    );
  }

  // Grouper les réservations par enfant
  const reservationsByChild = reservations.reduce((acc, reservation) => {
    if (!reservation.children) return acc;
    
    const childId = reservation.child_id;
    if (!acc[childId]) {
      acc[childId] = {
        child: reservation.children,
        reservations: [],
      };
    }
    acc[childId].reservations.push(reservation);
    return acc;
  }, {} as Record<string, { child: any; reservations: any[] }>);

  return (
    <div className="space-y-6">
      {Object.entries(reservationsByChild).map(([childId, { child, reservations }]) => (
        <Card key={childId} className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {child.first_name} {child.last_name}
              </h3>
              <p className="text-sm text-muted-foreground">{child.school_class}</p>
            </div>
            <Badge className="ml-auto" variant="secondary">
              {reservations.length} réservation{reservations.length > 1 ? 's' : ''}
            </Badge>
          </div>
          <div className="space-y-2">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      {new Date(reservation.reservation_date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {reservation.early_dropoff && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          Accueil avant 8h30
                        </span>
                      )}
                      {reservation.without_meal && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                          Sans repas
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};
