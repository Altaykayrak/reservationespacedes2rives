
import React, { useState } from "react";
import { format, isWeekend } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rdv } from "@/types/rdv";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface RdvFormProps {
  onRdvAdded: (newRdvs: Rdv[]) => void;
}

const RdvForm: React.FC<RdvFormProps> = ({ onRdvAdded }) => {
  const { toast } = useToast();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [heureDebut, setHeureDebut] = useState("09:00");
  const [heureFin, setHeureFin] = useState("09:30");

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Check if the date is already selected
    const dateExists = selectedDates.some(
      selectedDate => format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    
    if (dateExists) {
      // Remove the date if it's already selected
      setSelectedDates(selectedDates.filter(
        selectedDate => format(selectedDate, 'yyyy-MM-dd') !== format(date, 'yyyy-MM-dd')
      ));
    } else {
      // Add the date if it's not already selected
      setSelectedDates([...selectedDates, date]);
    }
  };

  const removeDate = (dateToRemove: Date) => {
    setSelectedDates(selectedDates.filter(
      date => format(date, 'yyyy-MM-dd') !== format(dateToRemove, 'yyyy-MM-dd')
    ));
  };

  const handleAddRdv = async () => {
    if (selectedDates.length === 0 || !heureDebut || !heureFin) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez sélectionner au moins une date et remplir les heures de début et de fin",
        variant: "destructive",
      });
      return;
    }

    // Vérifier si les dates sélectionnées incluent des weekends
    const weekendDates = selectedDates.filter(date => isWeekend(date));
    if (weekendDates.length > 0) {
      toast({
        title: "Jours non valides",
        description: "Les rendez-vous ne peuvent pas être programmés les samedis et dimanches",
        variant: "destructive",
      });
      return;
    }

    try {
      const newRdvs: Rdv[] = [];
      const errors: string[] = [];

      // Process each date
      for (const date of selectedDates) {
        const formattedDate = format(date, 'yyyy-MM-dd');
        
        // Vérifier si un rendez-vous existe déjà à la même date et heure
        const { data: existingRdv, error: checkError } = await supabase
          .from('rdv')
          .select('*')
          .eq('date', formattedDate)
          .eq('heure_debut', heureDebut)
          .eq('heure_fin', heureFin);
          
        if (checkError) throw checkError;
        
        if (existingRdv && existingRdv.length > 0) {
          errors.push(`Un rendez-vous existe déjà le ${format(date, 'dd/MM/yyyy')} à cette heure`);
          continue;
        }
        
        // Si aucun conflit, ajouter le nouveau rendez-vous
        const { data: newRdv, error } = await supabase
          .from('rdv')
          .insert([
            { 
              date: formattedDate,
              heure_debut: heureDebut,
              heure_fin: heureFin,
              status: 'disponible',
              motifs: [],
            }
          ])
          .select();

        if (error) {
          errors.push(`Erreur lors de la création du RDV pour le ${format(date, 'dd/MM/yyyy')}: ${error.message}`);
        } else if (newRdv && newRdv.length > 0) {
          newRdvs.push(newRdv[0] as Rdv);
        }
      }

      // Display success or error messages
      if (newRdvs.length > 0) {
        toast({
          title: "Succès",
          description: `${newRdvs.length} rendez-vous ont été ajoutés avec succès`,
        });
        onRdvAdded(newRdvs);
        // Clear selection after successful creation
        setSelectedDates([]);
      }

      if (errors.length > 0) {
        toast({
          title: `${errors.length} erreur(s) rencontrée(s)`,
          description: errors.join('. '),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding RDVs:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter les rendez-vous",
        variant: "destructive",
      });
    }
  };

  // Fonction pour désactiver les weekends dans le calendrier
  const disableWeekends = (date: Date) => {
    return isWeekend(date);
  };

  // Fonction pour vérifier si une date est sélectionnée
  const isDateSelected = (date: Date) => {
    return selectedDates.some(
      selectedDate => format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajouter des rendez-vous</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Sélectionnez une ou plusieurs dates</Label>
            <Calendar
              mode="single"
              onSelect={handleDateSelect}
              locale={fr}
              className="mx-auto"
              disabled={disableWeekends}
              modifiers={{ selected: isDateSelected }}
              modifiersClassNames={{
                selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground"
              }}
            />
          </div>

          {selectedDates.length > 0 && (
            <div className="mt-4">
              <Label>Dates sélectionnées</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedDates.map((date, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {format(date, 'dd/MM/yyyy', { locale: fr })}
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.preventDefault();
                        removeDate(date);
                      }}
                      className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="heureDebut">Heure de début</Label>
              <Input
                id="heureDebut"
                type="time"
                value={heureDebut}
                onChange={(e) => setHeureDebut(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="heureFin">Heure de fin</Label>
              <Input
                id="heureFin"
                type="time"
                value={heureFin}
                onChange={(e) => setHeureFin(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={handleAddRdv} 
            className="w-full"
            disabled={selectedDates.length === 0}
          >
            {selectedDates.length > 1 
              ? `Ajouter ${selectedDates.length} rendez-vous` 
              : selectedDates.length === 1 
                ? "Ajouter un rendez-vous" 
                : "Sélectionnez au moins une date"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RdvForm;
