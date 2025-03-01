
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

  console.log("AvailableSlots - Selected date:", selectedDate);
  console.log("AvailableSlots - Available slots:", availableSlots);

  const filteredSlots = selectedDate 
    ? availableSlots.filter(slot => slot.date === format(selectedDate, 'yyyy-MM-dd'))
    : [];
  
  console.log("AvailableSlots - Filtered slots:", filteredSlots);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          {selectedDate 
            ? `Créneaux disponibles pour le ${format(selectedDate, 'dd MMMM yyyy', { locale: fr })}` 
            : "Créneaux disponibles"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!selectedDate ? (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">Veuillez sélectionner une date sur le calendrier</p>
          </div>
        ) : filteredSlots.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">Aucun créneau disponible pour cette date</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-2">
            {filteredSlots.map((rdv) => (
              <Card 
                key={rdv.id} 
                className="hover:shadow-md transition-shadow cursor-pointer border-gray-200"
                onClick={() => onSelectSlot(rdv)}
              >
                <CardContent className="p-3 flex justify-between items-center">
                  <p className="text-gray-600 text-sm">
                    {formatTime(rdv.heure_debut)} à {formatTime(rdv.heure_fin)}
                  </p>
                  <Button size="sm" className="h-7 text-xs px-2">
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
