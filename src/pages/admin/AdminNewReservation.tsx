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
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type Child = {
  id: string;
  first_name: string;
  last_name: string;
  school_class: string;
};

type Group = "all" | "maternelle" | "primaire" | "ado";

type Wednesday = {
  id: string;
  date: string;
  max_participants_kindergarten: number;
  max_participants_primary: number;
  remaining_spots_kindergarten?: number;
  remaining_spots_primary?: number;
};

const AdminNewReservation = () => {
  const { data: isAdmin } = useAdminAuth();
  const { toast } = useToast();
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [reservationType, setReservationType] = useState<"wednesday" | "holiday">("wednesday");
  const [selectedGroup, setSelectedGroup] = useState<Group>("all");
  const [earlyDropoff, setEarlyDropoff] = useState(false);
  const [withoutMeal, setWithoutMeal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [availableWednesdays, setAvailableWednesdays] = useState<Wednesday[]>([]);
  const [selectedWednesday, setSelectedWednesday] = useState<string>("");
  const [showNoSpotsDialog, setShowNoSpotsDialog] = useState(false);
  const [noSpotsMessage, setNoSpotsMessage] = useState("");

  useEffect(() => {
    fetchChildren();
    if (reservationType === "wednesday") {
      fetchAvailableWednesdays();
    }
  }, [reservationType]);

  const fetchAvailableWednesdays = async () => {
    const { data, error } = await supabase
      .from('available_wednesdays')
      .select('*')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date');

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les mercredis disponibles",
        variant: "destructive",
      });
      return;
    }

    const wednesdaysWithSpots = await Promise.all(data.map(async (wednesday) => {
      const { data: spotsCounts } = await supabase
        .rpc('check_wednesday_spots_remaining', {
          wednesday_id: wednesday.id,
          child_school_class: 'PS'
        });

      const { data: spotsPrimary } = await supabase
        .rpc('check_wednesday_spots_remaining', {
          wednesday_id: wednesday.id,
          child_school_class: 'CP'
        });

      return {
        ...wednesday,
        remaining_spots_kindergarten: spotsCounts,
        remaining_spots_primary: spotsPrimary
      };
    }));

    setAvailableWednesdays(wednesdaysWithSpots);
  };

  const getGroupFromSchoolClass = (schoolClass: string): Group => {
    const maternelleClasses = ["PS", "MS", "GS"];
    const primaireClasses = ["CP", "CE1", "CE2", "CM1", "CM2"];
    const adoClasses = ["6EME", "5EME", "4EME", "3EME"];

    if (maternelleClasses.includes(schoolClass.toUpperCase())) return "maternelle";
    if (primaireClasses.includes(schoolClass.toUpperCase())) return "primaire";
    if (adoClasses.includes(schoolClass.toUpperCase())) return "ado";
    return "all";
  };

  const filteredChildren = children
    .filter(child => 
      selectedGroup === "all" || getGroupFromSchoolClass(child.school_class) === selectedGroup
    )
    .sort((a, b) => {
      const lastNameComparison = a.last_name.localeCompare(b.last_name);
      if (lastNameComparison === 0) {
        return a.first_name.localeCompare(b.first_name);
      }
      return lastNameComparison;
    });

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

  const handleWednesdaySelect = (wednesdayId: string) => {
    setSelectedWednesday(wednesdayId);
    const wednesday = availableWednesdays.find(w => w.id === wednesdayId);
    if (wednesday) {
      setSelectedDates([new Date(wednesday.date)]);
    }
  };

  const handleCreateReservation = async () => {
    if (!selectedChild || (reservationType === "wednesday" && !selectedWednesday) || 
        (reservationType === "holiday" && selectedDates.length === 0)) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un enfant et une date",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (reservationType === "wednesday") {
        const selectedChildData = children.find(child => child.id === selectedChild);
        if (!selectedChildData) throw new Error("Enfant non trouvé");

        const selectedWednesdayData = availableWednesdays.find(w => w.id === selectedWednesday);
        if (!selectedWednesdayData) throw new Error("Mercredi non trouvé");

        const isKindergarten = ["PS", "MS", "GS"].includes(selectedChildData.school_class.toUpperCase());
        const remainingSpots = isKindergarten 
          ? selectedWednesdayData.remaining_spots_kindergarten 
          : selectedWednesdayData.remaining_spots_primary;

        if (remainingSpots !== undefined && remainingSpots <= 0) {
          setNoSpotsMessage(`Il n'y a plus de places disponibles pour le groupe ${isKindergarten ? 'maternelle' : 'primaire'} à cette date.`);
          setShowNoSpotsDialog(true);
          setLoading(false);
          return;
        }

        const { error } = await supabase
          .from('wednesday_reservations')
          .insert({
            child_id: selectedChild,
            wednesday_id: selectedWednesday,
            early_dropoff: earlyDropoff,
            without_meal: withoutMeal,
            status: 'confirmed',
            reservation_number: `W-${Date.now()}`
          });

        if (error) throw error;
      } else {
        const { data: periodData, error: periodError } = await supabase
          .from('available_holiday_periods')
          .select('id')
          .lte('start_date', format(selectedDates[0], 'yyyy-MM-dd'))
          .gte('end_date', format(selectedDates[selectedDates.length - 1], 'yyyy-MM-dd'))
          .single();

        if (periodError || !periodData) {
          throw new Error("Période de vacances non trouvée");
        }

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
                    onValueChange={(value: "wednesday" | "holiday") => {
                      setReservationType(value);
                      setSelectedDates([]);
                      setSelectedWednesday("");
                    }}
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
                  <Label>Groupe</Label>
                  <Select 
                    value={selectedGroup}
                    onValueChange={(value: Group) => {
                      setSelectedGroup(value);
                      setSelectedChild("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un groupe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les groupes</SelectItem>
                      <SelectItem value="maternelle">Maternelle</SelectItem>
                      <SelectItem value="primaire">Primaire</SelectItem>
                      {reservationType === "holiday" && (
                        <SelectItem value="ado">Adolescent</SelectItem>
                      )}
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
                      {filteredChildren.map((child) => (
                        <SelectItem key={child.id} value={child.id}>
                          {child.last_name} {child.first_name} ({child.school_class})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {reservationType === "wednesday" ? (
                  <div className="space-y-4">
                    <Label>Mercredis disponibles</Label>
                    <RadioGroup value={selectedWednesday} onValueChange={handleWednesdaySelect}>
                      <div className="grid gap-4">
                        {availableWednesdays.map((wednesday) => (
                          <div key={wednesday.id} className="border rounded-lg p-4 space-y-4">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value={wednesday.id} id={wednesday.id} />
                              <Label htmlFor={wednesday.id} className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span>
                                    {format(new Date(wednesday.date), 'EEEE d MMMM yyyy', { locale: fr })}
                                  </span>
                                  <div className="flex gap-2">
                                    <Badge variant="outline">
                                      Maternelle: {wednesday.remaining_spots_kindergarten} places
                                    </Badge>
                                    <Badge variant="outline">
                                      Primaire: {wednesday.remaining_spots_primary} places
                                    </Badge>
                                  </div>
                                </div>
                              </Label>
                            </div>
                            
                            {selectedWednesday === wednesday.id && (
                              <div className="ml-6 space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`earlyDropoff-${wednesday.id}`}
                                    checked={earlyDropoff}
                                    onCheckedChange={(checked) => setEarlyDropoff(checked as boolean)}
                                  />
                                  <Label htmlFor={`earlyDropoff-${wednesday.id}`}>Accueil avant 8h30</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`withoutMeal-${wednesday.id}`}
                                    checked={withoutMeal}
                                    onCheckedChange={(checked) => setWithoutMeal(checked as boolean)}
                                  />
                                  <Label htmlFor={`withoutMeal-${wednesday.id}`}>Sans repas</Label>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                ) : (
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
                )}

                <Button 
                  onClick={handleCreateReservation} 
                  disabled={loading || !selectedChild || (reservationType === "wednesday" ? !selectedWednesday : selectedDates.length === 0)}
                  className="w-full"
                >
                  {loading ? "Création en cours..." : "Créer la réservation"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showNoSpotsDialog} onOpenChange={setShowNoSpotsDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Plus de places disponibles</AlertDialogTitle>
            <AlertDialogDescription>
              {noSpotsMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowNoSpotsDialog(false)}>
              Fermer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminNewReservation;
