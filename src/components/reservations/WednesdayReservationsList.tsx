
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmptyReservations } from "./EmptyReservations";
import { useReservations } from "@/hooks/useReservations";
import { ChildWednesdayReservationCard } from "./ChildWednesdayReservationCard";
import { WednesdayReservationWithChild } from "@/types/reservations";

type GroupedReservations = Record<string, {
  childName: string;
  schoolClass: string;
  reservations: WednesdayReservationWithChild[];
}>;

export const WednesdayReservationsList = () => {
  const navigate = useNavigate();
  const { wednesdayReservations, refetchReservations, isSubmitting } = useReservations();

  console.log("Réservations du mercredi :", wednesdayReservations);

  if (!wednesdayReservations || wednesdayReservations.length === 0) {
    return <EmptyReservations />;
  }

  // Grouper les réservations par enfant
  const reservationsByChild = wednesdayReservations.reduce((acc, reservation) => {
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
          Vos mercredis réservés (sous réserve de règlement)
        </h2>
        <p className="text-sm text-red-600 mb-4">
          Pour toute modification de vos réservations (ajout ou suppression de journées), merci de contacter l'accueil.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
