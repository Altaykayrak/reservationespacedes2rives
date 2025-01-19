import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import EditHolidayDialog from "./EditHolidayDialog";
import HolidayPeriodItem from "./HolidayPeriodItem";

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
  onDelete: refreshList
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

      const { error } = await supabase
        .from("available_holiday_periods")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "La période de vacances a été supprimée avec succès",
      });

      refreshList();
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
      refreshList();
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
          <HolidayPeriodItem
            key={holiday.id}
            holiday={holiday}
            onEdit={handleEditHolidayPeriod}
            onDelete={handleDeleteHolidayPeriod}
          />
        ))}
      </div>

      <EditHolidayDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveEdit}
        maxParticipantsKindergarten={maxParticipantsKindergarten}
        maxParticipantsPrimary={maxParticipantsPrimary}
        maxParticipantsTeen={maxParticipantsTeen}
        setMaxParticipantsKindergarten={setMaxParticipantsKindergarten}
        setMaxParticipantsPrimary={setMaxParticipantsPrimary}
        setMaxParticipantsTeen={setMaxParticipantsTeen}
      />
    </Card>
  );
};

export default HolidayPeriodsList;