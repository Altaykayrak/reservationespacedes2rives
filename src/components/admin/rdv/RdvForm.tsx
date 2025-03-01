
import React, { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rdv } from "@/types/rdv";

interface RdvFormProps {
  onRdvAdded: (newRdvs: Rdv[]) => void;
}

const RdvForm: React.FC<RdvFormProps> = ({ onRdvAdded }) => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [heureDebut, setHeureDebut] = useState("09:00");
  const [heureFin, setHeureFin] = useState("09:30");

  const handleAddRdv = async () => {
    if (!date || !heureDebut || !heureFin) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez remplir tous les champs du formulaire",
        variant: "destructive",
      });
      return;
    }

    try {
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
        toast({
          title: "Conflit d'horaire",
          description: "Un rendez-vous existe déjà à cette date et cette heure",
          variant: "destructive",
        });
        return;
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

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Le rendez-vous a été ajouté avec succès",
      });

      // Notify parent component
      if (newRdv && newRdv.length > 0) {
        onRdvAdded(newRdv as Rdv[]);
      }
    } catch (error) {
      console.error("Error adding RDV:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le rendez-vous",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajouter un rendez-vous</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Date</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={fr}
              className="mx-auto"
            />
          </div>

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

          <Button onClick={handleAddRdv} className="w-full">
            Ajouter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RdvForm;
