
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rdv } from "@/types/rdv";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AvailableSlotsProps {
  selectedDate: Date | undefined;
  availableSlots: Rdv[];
  onSelectSlot: (rdv: Rdv) => void;
}

export const AvailableSlots = ({ 
  selectedDate, 
  availableSlots, 
  onSelectSlot 
}: AvailableSlotsProps) => {
  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {selectedDate 
            ? `Créneaux disponibles pour le ${format(selectedDate, 'dd MMMM yyyy', { locale: fr })}` 
            : "Créneaux disponibles"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!selectedDate ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Veuillez sélectionner une date sur le calendrier</p>
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Aucun créneau disponible pour cette date</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {availableSlots.map((rdv) => (
              <Card 
                key={rdv.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onSelectSlot(rdv)}
              >
                <CardContent className="p-4 flex justify-between items-center">
                  <p className="text-gray-600">
                    {formatTime(rdv.heure_debut)} à {formatTime(rdv.heure_fin)}
                  </p>
                  <Button size="sm">
                    Sélectionner
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
