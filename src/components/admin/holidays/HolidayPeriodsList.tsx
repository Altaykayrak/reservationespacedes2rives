import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface HolidayPeriod {
  id: string;
  start_date: string;
  end_date: string;
  max_participants_kindergarten: number;
  max_participants_primary: number;
  max_participants_teen: number;
}

const HolidayPeriodsList = ({ 
  holidays,
  onDelete
}: { 
  holidays: HolidayPeriod[];
  onDelete: () => void;
}) => {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<HolidayPeriod | null>(null);
  const [maxParticipantsKindergarten, setMaxParticipantsKindergarten] = useState("");
  const [maxParticipantsPrimary, setMaxParticipantsPrimary] = useState("");
  const [maxParticipantsTeen, setMaxParticipantsTeen] = useState("");

  const handleDeleteHolidayPeriod = async (id: string, startDate: string, endDate: string) => {
    try {
      // Vérifier s'il existe des réservations pour cette période
      const { data: reservations, error: reservationsError } = await supabase
        .from("reservations")
        .select("id")
        .gte("reservation_date", startDate)
        .lte("reservation_date", endDate);

      if (reservationsError) throw reservationsError;

      if (reservations && reservations.length > 0) {
        toast({
          title: "Suppression impossible",
          description: "Il existe déjà des réservations pour cette période. La suppression n'est pas possible.",
          variant: "destructive",
        });
        return;
      }

      // Si pas de réservations, on peut procéder à la suppression
      const { error } = await supabase
        .from("available_holiday_periods")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "La période de vacances a été supprimée avec succès",
      });

      onDelete();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditHolidayPeriod = async (holiday: HolidayPeriod) => {
    try {
      // Vérifier s'il existe des réservations pour cette période
      const { data: reservations, error: reservationsError } = await supabase
        .from("reservations")
        .select("id")
        .gte("reservation_date", holiday.start_date)
        .lte("reservation_date", holiday.end_date);

      if (reservationsError) throw reservationsError;

      if (reservations && reservations.length > 0) {
        toast({
          title: "Modification impossible",
          description: "Il existe déjà des réservations pour cette période. La modification n'est pas possible.",
          variant: "destructive",
        });
        return;
      }

      // Si pas de réservations, on peut procéder à la modification
      setSelectedHoliday(holiday);
      setMaxParticipantsKindergarten(holiday.max_participants_kindergarten.toString());
      setMaxParticipantsPrimary(holiday.max_participants_primary.toString());
      setMaxParticipantsTeen(holiday.max_participants_teen.toString());
      setIsEditDialogOpen(true);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedHoliday) return;

    try {
      const { error } = await supabase
        .from("available_holiday_periods")
        .update({
          max_participants_kindergarten: parseInt(maxParticipantsKindergarten),
          max_participants_primary: parseInt(maxParticipantsPrimary),
          max_participants_teen: parseInt(maxParticipantsTeen),
        })
        .eq("id", selectedHoliday.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "La période de vacances a été modifiée avec succès",
      });

      setIsEditDialogOpen(false);
      onDelete(); // Rafraîchir la liste
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 lg:col-span-2">
      <h2 className="text-xl font-semibold mb-4">Périodes de vacances disponibles</h2>
      
      <div className="space-y-4">
        {holidays?.map((holiday) => (
          <div
            key={holiday.id}
            className="flex items-center justify-between p-4 border rounded"
          >
            <div>
              <p className="font-medium">
                Du {new Date(holiday.start_date).toLocaleDateString("fr-FR")} au{" "}
                {new Date(holiday.end_date).toLocaleDateString("fr-FR")}
              </p>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Maternelle: {holiday.max_participants_kindergarten} participants</p>
                <p>Primaire: {holiday.max_participants_primary} participants</p>
                <p>Adolescent: {holiday.max_participants_teen} participants</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleEditHolidayPeriod(holiday)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. Cela supprimera définitivement la période de vacances.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteHolidayPeriod(holiday.id, holiday.start_date, holiday.end_date)}>
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le nombre de places</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="maxParticipantsKindergarten">Nombre maximum de participants (Maternelle)</Label>
              <Input
                id="maxParticipantsKindergarten"
                type="number"
                value={maxParticipantsKindergarten}
                onChange={(e) => setMaxParticipantsKindergarten(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxParticipantsPrimary">Nombre maximum de participants (Primaire)</Label>
              <Input
                id="maxParticipantsPrimary"
                type="number"
                value={maxParticipantsPrimary}
                onChange={(e) => setMaxParticipantsPrimary(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxParticipantsTeen">Nombre maximum de participants (Adolescent)</Label>
              <Input
                id="maxParticipantsTeen"
                type="number"
                value={maxParticipantsTeen}
                onChange={(e) => setMaxParticipantsTeen(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveEdit}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default HolidayPeriodsList;