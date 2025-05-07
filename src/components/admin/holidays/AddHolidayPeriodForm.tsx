
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import HolidayDatePicker from "./form/HolidayDatePicker";
import HolidayNameInput from "./form/HolidayNameInput";
import ParticipantsInputs from "./form/ParticipantsInputs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const AddHolidayPeriodForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [maxParticipantsKindergarten, setMaxParticipantsKindergarten] = useState("");
  const [maxParticipantsPrimary, setMaxParticipantsPrimary] = useState("");
  const [maxParticipantsTeen, setMaxParticipantsTeen] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const { toast } = useToast();

  // Vérifier explicitement les droits d'administration
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setIsAdmin(false);
          return;
        }
        
        console.log("Checking admin permissions for:", session.user.id);
        const { data: adminStatus, error } = await supabase
          .rpc('is_admin', { user_id: session.user.id });
        
        if (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
          return;
        }
        
        console.log("Admin status result:", adminStatus);
        setIsAdmin(!!adminStatus);
      } catch (error) {
        console.error("Error in admin check:", error);
        setIsAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, []);

  // Fetch all school class categories
  const { data: schoolClasses } = useQuery({
    queryKey: ["school_class_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("school_class_categories")
        .select("*");
      
      if (error) throw error;
      return data;
    },
  });

  const handleAddHolidayPeriod = async () => {
    if (!startDate || !endDate || !maxParticipantsKindergarten || !maxParticipantsPrimary || !maxParticipantsTeen || !name) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Format dates to YYYY-MM-DD to avoid timezone issues
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      const fullName = `${currentYear}-${name}`;

      console.log("Submitting holiday period with:", {
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        name: fullName,
        maxParticipantsKindergarten: parseInt(maxParticipantsKindergarten),
        maxParticipantsPrimary: parseInt(maxParticipantsPrimary),
        maxParticipantsTeen: parseInt(maxParticipantsTeen)
      });

      // Vérifier d'abord les permissions d'administration
      const { data: adminCheck, error: adminError } = await supabase
        .rpc('is_admin', { user_id: (await supabase.auth.getSession()).data.session?.user.id });
      
      if (adminError || !adminCheck) {
        console.error("Admin permission check failed:", adminError || "User is not admin");
        toast({
          title: "Erreur d'autorisation",
          description: "Vous n'avez pas les droits nécessaires pour cette action",
          variant: "destructive",
        });
        return;
      }

      // 1. Insert the holiday period
      const { data: holidayPeriod, error: holidayError } = await supabase
        .from("available_holiday_periods")
        .insert({
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          name: fullName,
          max_participants_kindergarten: parseInt(maxParticipantsKindergarten),
          max_participants_primary: parseInt(maxParticipantsPrimary),
          max_participants_teen: parseInt(maxParticipantsTeen),
        })
        .select()
        .single();

      if (holidayError) {
        console.error("Error creating holiday period:", holidayError);
        toast({
          title: "Erreur",
          description: `Échec de création de la période: ${holidayError.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log("Created holiday period:", holidayPeriod);

      // 2. Add allowed classes based on categories
      if (schoolClasses && holidayPeriod) {
        const allowedClassesData = schoolClasses.map(schoolClass => ({
          holiday_period_id: holidayPeriod.id,
          school_class: schoolClass.name,
        }));

        console.log("Adding allowed classes:", allowedClassesData);

        const { error: allowedClassesError } = await supabase
          .from("holiday_allowed_classes")
          .insert(allowedClassesData);

        if (allowedClassesError) {
          console.error("Error adding allowed classes:", allowedClassesError);
          toast({
            title: "Attention",
            description: "La période a été créée mais les classes autorisées n'ont pas été associées",
            variant: "warning",
          });
        }
      }

      toast({
        title: "Succès",
        description: "La période de vacances a été ajoutée avec succès",
      });

      setStartDate(undefined);
      setEndDate(undefined);
      setMaxParticipantsKindergarten("");
      setMaxParticipantsPrimary("");
      setMaxParticipantsTeen("");
      setName("");
      
      // Appel de la fonction de callback pour rafraîchir la liste
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error in handleAddHolidayPeriod:", error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAdmin === false) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Ajouter une période de vacances</h2>
        <Alert variant="destructive" className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Vous n'avez pas les droits d'administration nécessaires pour ajouter des périodes de vacances.
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Ajouter une période de vacances</h2>
      
      <div className="space-y-4">
        <HolidayNameInput
          name={name}
          currentYear={currentYear}
          setName={setName}
        />

        <HolidayDatePicker
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
        />

        <ParticipantsInputs
          maxParticipantsKindergarten={maxParticipantsKindergarten}
          maxParticipantsPrimary={maxParticipantsPrimary}
          maxParticipantsTeen={maxParticipantsTeen}
          setMaxParticipantsKindergarten={setMaxParticipantsKindergarten}
          setMaxParticipantsPrimary={setMaxParticipantsPrimary}
          setMaxParticipantsTeen={setMaxParticipantsTeen}
        />

        <Button 
          onClick={handleAddHolidayPeriod} 
          className="w-full"
          disabled={isSubmitting || isAdmin === false || isAdmin === null}
        >
          {isSubmitting ? "Ajout en cours..." : "Ajouter"}
        </Button>
      </div>
    </Card>
  );
};

export default AddHolidayPeriodForm;
