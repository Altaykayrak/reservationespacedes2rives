
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmptyReservations } from "./EmptyReservations";
import { Button } from "@/components/ui/button";
import { ChildWednesdayReservationCard } from "./ChildWednesdayReservationCard";
import { WednesdayReservationWithChild } from "@/types/reservations";
import { useWednesdayReservations } from "@/hooks/useWednesdayReservations";
import { useNavigate } from "react-router-dom";

type GroupedReservations = Record<string, {
  childName: string;
  schoolClass: string;
  reservations: WednesdayReservationWithChild[];
}>;

export const WednesdayReservationsList = () => {
  const navigate = useNavigate();
  const { wednesdayReservations, refetchReservations, isLoading, isError, error } = useWednesdayReservations();
  
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Chargement des réservations...</p>
      </div>
    );
  }
  
  if (isError) {
    const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
    if (errorMessage.includes("Not authenticated") || errorMessage.includes("JWT expired")) {
      return (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div>Votre session a expiré. Veuillez vous reconnecter pour voir vos réservations.</div>
            <Button 
              onClick={() => navigate("/login", { state: { from: location.pathname } })}
              variant="outline"
              className="whitespace-nowrap"
            >
              Se connecter
            </Button>
          </AlertDescription>
        </Alert>
      );
    }
    
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>Une erreur est survenue lors du chargement de vos réservations.</div>
          <Button 
            onClick={() => refetchReservations()}
            variant="outline"
            className="whitespace-nowrap"
          >
            Réessayer
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  console.log("Réservations du mercredi :", wednesdayReservations);

  if (!wednesdayReservations || wednesdayReservations.length === 0) {
    return <EmptyReservations />;
  }

  const reservationsByChild = wednesdayReservations.reduce((acc, reservation) => {
    const childId = reservation.child_id;
    const child = reservation.children as { 
      first_name: string; 
      last_name: string; 
      school_class: string;
    };
    
    if (!child) return acc;
    
    if (!acc[childId]) {
      acc[childId] = {
        childName: `${child.first_name} ${child.last_name}`,
        schoolClass: child.school_class,
        reservations: [],
      };
    }
    acc[childId].reservations.push(reservation);
    return acc;
  }, {} as GroupedReservations);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Vos mercredis réservés (sous réserve de règlement)
        </h2>
        <p className="text-sm text-red-600">
          Pour toute modification de vos réservations (ajout ou suppression de journées), merci de contacter l'accueil.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(reservationsByChild).map(([childId, data]) => (
          <ChildWednesdayReservationCard
            key={childId}
            childName={data.childName}
            schoolClass={data.schoolClass}
            reservations={data.reservations}
            onUpdate={refetchReservations}
          />
        ))}
      </div>
    </div>
  );
};
