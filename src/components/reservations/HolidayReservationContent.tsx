
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

interface HolidayReservationContentProps {
  filteredChildren?: Tables<"children">[] | null;
  filterTeenPeriods?: boolean;
}

export const HolidayReservationContent = ({ 
  filteredChildren, 
  filterTeenPeriods = false 
}: HolidayReservationContentProps) => {
  const [selectedChild, setSelectedChild] = useState<string>("");
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Fonctionnalité en cours de développement",
      description: "Cette fonctionnalité sera disponible prochainement."
    });
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Sélection de l'enfant et de la période
          </h2>
          
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-blue-800">
              La fonctionnalité de réservation pour les vacances est en cours de développement. 
              Elle sera disponible prochainement.
            </p>
          </div>

          <Button type="submit" className="w-full md:w-auto">
            Valider la réservation
          </Button>
        </div>
      </form>
    </div>
  );
};
