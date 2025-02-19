
import { useState, useEffect } from "react";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { useAdminAuth } from "@/components/admin/reservations/hooks/useAdminAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type Child = {
  id: string;
  first_name: string;
  last_name: string;
  school_class: string;
};

const AdminNewReservation = () => {
  const { data: isAdmin } = useAdminAuth();
  const { toast } = useToast();
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [reservationType, setReservationType] = useState<"wednesday" | "holiday">("wednesday");
  const [earlyDropoff, setEarlyDropoff] = useState(false);
  const [withoutMeal, setWithoutMeal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    fetchChildren();
  }, []);

  // Charger la liste des enfants
  const fetchChildren = async () => {
    const { data, error } = await supabase
      .from('children')
      .select(`
        id,
        first_name,
        last_name,
        school_class
      `);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des enfants",
        variant: "destructive",
      });
      return;
    }

    setChildren(data || []);
  };

  // Créer une réservation
  const handleCreateReservation = async () => {
    if (!selectedChild || selectedDates.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un enfant et au moins une date",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (reservationType === "wednesday") {
        // Obtenir d'abord l'ID du mercredi
        const { data: wednesdayData, error: wednesdayError } = await supabase
          .from('available_wednesdays')
          .select('id')
          .eq('date', format(selectedDates[0], 'yyyy-MM-dd'))
          .single();

        if (wednesdayError || !wednesdayData) {
          throw new Error("Mercredi non trouvé");
        }

        const { error } = await supabase
          .from('wednesday_reservations')
          .insert({
            child_id: selectedChild,
            wednesday_id: wednesdayData.id,
            early_dropoff: earlyDropoff,
            without_meal: withoutMeal,
            status: 'confirmed',
            reservation_number: `W-${Date.now()}`
          });

        if (error) throw error;
      } else {
        // Obtenir d'abord l'ID de la période de vacances
        const { data: periodData, error: periodError } = await supabase
          .from('available_holiday_periods')
          .select('id')
          .lte('start_date', format(selectedDates[0], 'yyyy-MM-dd'))
          .gte('end_date', format(selectedDates[selectedDates.length - 1], 'yyyy-MM-dd'))
          .single();

        if (periodError || !periodData) {
          throw new Error("Période de vacances non trouvée");
        }

        // Créer les réservations pour les vacances
        for (const date of selectedDates) {
          const { error } = await supabase
            .from('holiday_reservations')
            .insert({
              child_id: selectedChild,
              period_id: periodData.id,
              reservation_date: format(date, 'yyyy-MM-dd'),
              early_dropoff: earlyDropoff,
              without_meal: withoutMeal,
              status: 'confirmed',
              reservation_number: `H-${Date.now()}-${format(date, 'yyyyMMdd')}`
            });

          if (error) throw error;
        }
      }

      toast({
        title: "Succès",
        description: "La réservation a été créée avec succès",
      });

      // Rediriger vers la liste des réservations
      window.location.href = '/admin/reservations';
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la réservation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div>
        <AdminNavbar />
        <div className="container mx-auto p-8">
          <h1 className="text-3xl font-bold mb-8">Accès non autorisé</h1>
          <div>Vous devez être administrateur pour accéder à cette page.</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminNavbar />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Nouvelle réservation</h1>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Informations de la réservation</CardTitle>
              <CardDescription>Sélectionnez l'enfant et les dates de réservation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Type de réservation</Label>
                  <Select 
                    value={reservationType}
                    onValueChange={(value: "wednesday" | "holiday") => setReservationType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le type de réservation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wednesday">Mercredi</SelectItem>
                      <SelectItem value="holiday">Vacances</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Enfant</Label>
                  <Select value={selectedChild} onValueChange={setSelectedChild}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un enfant" />
                    </SelectTrigger>
                    <SelectContent>
                      {children.map((child) => (
                        <SelectItem key={child.id} value={child.id}>
                          {child.first_name} {child.last_name} ({child.school_class})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Dates de réservation</Label>
                  <Calendar
                    mode="multiple"
                    selected={selectedDates}
                    onSelect={(dates) => setSelectedDates(dates || [])}
                    className="rounded-md border"
                    locale={fr}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="earlyDropoff"
                      checked={earlyDropoff}
                      onCheckedChange={(checked) => setEarlyDropoff(checked as boolean)}
                    />
                    <Label htmlFor="earlyDropoff">Accueil avant 8h30</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="withoutMeal"
                      checked={withoutMeal}
                      onCheckedChange={(checked) => setWithoutMeal(checked as boolean)}
                    />
                    <Label htmlFor="withoutMeal">Sans repas</Label>
                  </div>
                </div>

                <Button 
                  onClick={handleCreateReservation} 
                  disabled={loading || !selectedChild || selectedDates.length === 0}
                  className="w-full"
                >
                  {loading ? "Création en cours..." : "Créer la réservation"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminNewReservation;
