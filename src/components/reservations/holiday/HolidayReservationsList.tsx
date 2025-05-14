
import { EmptyReservations } from "./EmptyReservations";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { HolidayChildReservationCard } from "./HolidayChildReservationCard";
import { useHolidayReservations } from "@/hooks/useHolidayReservations";
import { useSchoolClassCategories } from "@/hooks/useSchoolClassCategories";
import { HolidayReservationWithChild } from "@/types/reservations";
import { Button } from "@/components/ui/button";

type GroupedReservations = Record<string, {
  childName: string;
  schoolClass: string;
  reservations: HolidayReservationWithChild[];
}>;

export const HolidayReservationsList = () => {
  const navigate = useNavigate();
  const isTeenPage = window.location.pathname === "/teenholiday-reservations";
  const { reservations, isError, error, refetch, isLoading } = useHolidayReservations();
  const { isTeenClass } = useSchoolClassCategories();

  console.log("[HolidayReservationsList] Réservations reçues du hook:", reservations);
  console.log("[HolidayReservationsList] État de chargement:", isLoading);
  console.log("[HolidayReservationsList] Est-ce une erreur ?", isError);
  if (error) console.log("[HolidayReservationsList] Erreur détectée:", error);

  // Afficher un indicateur de chargement
  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement des réservations...</p>
      </div>
    );
  }

  if (isError) {
    const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
    if (errorMessage.includes("Not authenticated") || errorMessage.includes("JWT expired")) {
      return (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div>
              Votre session a expiré. Veuillez vous reconnecter pour voir vos réservations.
            </div>
            <Button 
              onClick={() => navigate("/login")}
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
          <div>
            Une erreur est survenue lors du chargement des réservations. Veuillez réessayer.
          </div>
          <Button 
            onClick={() => refetch()}
            variant="outline"
            className="whitespace-nowrap"
          >
            Réessayer
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!reservations || reservations.length === 0) {
    console.log("[HolidayReservationsList] Aucune réservation trouvée");
    return <EmptyReservations />;
  }

  console.log("[HolidayReservationsList] Nombre de réservations avant filtrage:", reservations.length);

  const filteredReservations = reservations.map(reservation => {
    console.log("[HolidayReservationsList] Traitement de la réservation:", reservation);
    console.log("[HolidayReservationsList] Données de l'enfant:", reservation.children);
    
    const childData = reservation.children;
    
    const transformedReservation = {
      ...reservation,
      children: {
        id: childData.id,
        first_name: childData.first_name,
        last_name: childData.last_name,
        school_class: childData.school_class,
        profile: {
          school_city: childData.profile?.school_city || ''
        }
      }
    } as HolidayReservationWithChild;

    return transformedReservation;
  }).filter(reservation => {
    const isTeen = isTeenClass(reservation.children.school_class);
    console.log("[HolidayReservationsList] Classe:", reservation.children.school_class, "Est ado ?", isTeen);
    return isTeenPage ? isTeen : !isTeen;
  });

  console.log("[HolidayReservationsList] Nombre de réservations après filtrage:", filteredReservations.length);

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

  console.log("[HolidayReservationsList] Réservations groupées par enfant:", reservationsByChild);

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
}
