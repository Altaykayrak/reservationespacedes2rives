
import { EmptyReservations } from "./EmptyReservations";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { HolidayChildReservationCard } from "./HolidayChildReservationCard";
import { useHolidayReservations } from "@/hooks/useHolidayReservations";
import { useSchoolClassCategories } from "@/hooks/useSchoolClassCategories";
import { HolidayReservationWithChild } from "@/types/reservations";

type GroupedReservations = Record<string, {
  childName: string;
  schoolClass: string;
  reservations: HolidayReservationWithChild[];
}>;

export const HolidayReservationsList = () => {
  const navigate = useNavigate();
  const isTeenPage = window.location.pathname === "/teenholiday-reservations";
  const { reservations, isError, error, refetch } = useHolidayReservations();
  const { isTeenClass } = useSchoolClassCategories();

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

  const filteredReservations = reservations.map(reservation => {
    const childData = reservation.children;
    return {
      ...reservation,
      children: {
        id: childData.id,
        first_name: childData.first_name,
        last_name: childData.last_name,
        school_class: childData.school_class,
        profile: {
          school_city: childData.profiles?.school_city || ''
        }
      }
    } as HolidayReservationWithChild;
  }).filter(reservation => {
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
            onUpdate={refetch}
          />
        ))}
      </div>
    </div>
  );
};
