
import { EmptyReservations } from "./EmptyReservations";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { HolidayChildReservationCard } from "./holiday/HolidayChildReservationCard";
import { useHolidayReservations } from "@/hooks/useHolidayReservations";
import { useSchoolClassCategories } from "@/hooks/useSchoolClassCategories";
import { HolidayReservationWithChild } from "@/types/reservations";
import { useToast } from "@/hooks/use-toast";

type GroupedReservations = Record<string, {
  childName: string;
  schoolClass: string;
  reservations: HolidayReservationWithChild[];
}>;

export const HolidayReservationsList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isTeenPage = window.location.pathname === "/teenholiday-reservations";
  const { reservations, isError, error, refetch } = useHolidayReservations();
  const { isTeenClass } = useSchoolClassCategories();

  console.log("1. Réservations reçues du hook:", reservations);
  console.log("2. Est-ce une erreur ?", isError);
  if (error) console.log("3. Erreur détectée:", error);

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

  // Add additional check for empty array, not just null or undefined
  if (!reservations || reservations.length === 0) {
    console.log("4. Aucune réservation trouvée");
    return <EmptyReservations />;
  }

  console.log("5. Nombre de réservations avant filtrage:", reservations.length);

  // Make sure we properly handle the reservation data structure
  const filteredReservations = reservations
    .filter(reservation => {
      // Make sure the reservation and its children data exists
      if (!reservation || !reservation.children || !reservation.children.school_class) {
        console.warn("Données manquantes pour la réservation:", reservation?.id);
        return false;
      }
      
      // Filter based on page type
      return isTeenPage 
        ? isTeenClass(reservation.children.school_class) 
        : !isTeenClass(reservation.children.school_class);
    })
    .map(reservation => {
      // Ensure consistent data structure
      return {
        ...reservation,
        children: {
          ...reservation.children,
          profile: reservation.children.profile || { school_city: '' }
        }
      };
    });

  console.log("11. Nombre de réservations après filtrage:", filteredReservations.length);

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

  console.log("12. Réservations groupées par enfant:", reservationsByChild);

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
