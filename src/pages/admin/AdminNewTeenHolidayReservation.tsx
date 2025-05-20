
import { useAdminAuth } from "@/components/admin/reservations/hooks/useAdminAuth";
import { HolidayReservationContent } from "@/components/reservations/HolidayReservationContent";
import { CalendarDays } from "lucide-react";
import { useChildrenData } from "@/hooks/useChildrenData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

const AdminNewTeenHolidayReservation = () => {
  const { data: isAdmin } = useAdminAuth();
  const { data: schoolClassCategories } = useQuery({
    queryKey: ["schoolClassCategories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("school_class_categories")
        .select("*")
        .eq("category", "adolescent");
      
      if (error) throw error;
      return data;
    },
  });

  // Récupérer tous les enfants
  const { children } = useChildrenData();

  // Filtrer les adolescents ET les CM2
  const teenChildren = children?.filter(child => 
    // Inclure tous les CM2
    child.school_class === 'CM2' ||
    // Ou les enfants des classes d'adolescents
    schoolClassCategories?.some(
      category => category.name.toUpperCase() === child.school_class.toUpperCase()
    )
  );

  console.log("Teen children with CM2:", teenChildren);

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Accès non autorisé</h1>
        <div>Vous devez être administrateur pour accéder à cette page.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              Réservations Club Ado
            </h1>
          </div>
          <p className="text-muted-foreground text-base md:text-lg">
            Créez une nouvelle réservation pour les adolescents et CM2. Minimum 3 jours par semaine.
          </p>
        </div>

        <HolidayReservationContent 
          filteredChildren={teenChildren} 
          filterTeenPeriods={true}
        />
      </div>
    </div>
  );
};

export default AdminNewTeenHolidayReservation;
