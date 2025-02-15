import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyReservations } from "./EmptyReservations";
import { ChildReservationCard } from "./ChildReservationCard";
import { useEffect, useRef } from "react";
import { WednesdayReservationWithChild } from "@/types/reservations";
import { useLocation } from "react-router-dom";

type GroupedReservations = Record<string, {
  childName: string;
  schoolClass: string;
  reservations: WednesdayReservationWithChild[];
}>;

interface ReservationsListProps {
  reservations: WednesdayReservationWithChild[] | null;
}

export const ReservationsList = ({ reservations }: ReservationsListProps) => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isTeenHolidayReservation = location.pathname === "/teenholiday-reservations";

  useEffect(() => {
    if (containerRef.current) {
      // Nettoyage de l'ancien ResizeObserver
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }

      // Création d'un nouveau ResizeObserver avec gestion d'erreur
      resizeObserverRef.current = new ResizeObserver((entries) => {
        try {
          // Traiter les changements de taille ici si nécessaire
          entries.forEach(() => {
            // Mettre à jour uniquement si nécessaire
            window.requestAnimationFrame(() => {
              // Code de mise à jour si nécessaire
            });
          });
        } catch (error) {
          console.warn("ResizeObserver error:", error);
        }
      });

      // Observer le conteneur
      resizeObserverRef.current.observe(containerRef.current);
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, []);

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

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wednesday_reservations'
        },
        (payload) => {
          console.log('Changement de réservation détecté:', payload);
          queryClient.invalidateQueries({ queryKey: ["wednesday_reservations"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  if (!reservations || reservations.length === 0) {
    return <EmptyReservations />;
  }

  console.log("Réservations reçues:", reservations);

  const isTeenClass = (schoolClass: string) => {
    return schoolClassCategories?.some(
      category => 
        category.category === "adolescent" && 
        schoolClass.toUpperCase() === category.name.toUpperCase()
    );
  };

  // Filtrer les réservations valides (qui ont toutes les données requises)
  const validReservations = reservations.filter(
    (reservation) => {
      const isValid = reservation.available_wednesdays && reservation.children;
      if (!isValid) {
        console.log("Réservation invalide:", {
          id: reservation.id,
          available_wednesdays: reservation.available_wednesdays,
          children: reservation.children
        });
      }
      if (isTeenHolidayReservation) {
        // Pour la page Club Ado, montrer uniquement les réservations des adolescents
        return isValid && isTeenClass(reservation.children.school_class);
      }
      // Pour les autres pages, montrer uniquement les réservations des non-adolescents
      return isValid && !isTeenClass(reservation.children.school_class);
    }
  );

  console.log("Réservations valides:", validReservations);

  if (validReservations.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Aucune réservation valide trouvée.</p>
      </div>
    );
  }

  // Grouper les réservations par enfant
  const reservationsByChild = validReservations.reduce((acc, reservation) => {
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
    <div ref={containerRef}>
      <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
        Vos {isTeenHolidayReservation ? "activités Club Ado" : "mercredis"} réservés (sous réserve de règlement)
      </h2>
      <ScrollArea className="h-[450px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
          {Object.entries(reservationsByChild).map(([childId, data]) => (
            <ChildReservationCard
              key={childId}
              childName={data.childName}
              schoolClass={data.schoolClass}
              reservations={data.reservations}
              onUpdate={() => queryClient.invalidateQueries({ queryKey: ["wednesday_reservations"] })}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
