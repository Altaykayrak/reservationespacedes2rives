
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { useAdminAuth } from "@/components/admin/reservations/hooks/useAdminAuth";
import { HolidayReservationContent } from "@/components/reservations/HolidayReservationContent";
import { CalendarDays } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useChildrenData } from "@/hooks/useChildrenData";
import { Tables } from "@/integrations/supabase/types";

const AdminNewHolidayReservation = () => {
  const { data: isAdmin } = useAdminAuth();
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const { children } = useChildrenData();

  const filteredChildren = children?.filter(child => {
    if (selectedGroup === "all") return true;
    if (selectedGroup === "maternelle") {
      return ["PS", "MS", "GS"].some(cls => 
        child.school_class.toUpperCase().includes(cls));
    }
    if (selectedGroup === "primaire") {
      return ["CP", "CE1", "CE2", "CM1", "CM2"].some(cls => 
        child.school_class.toUpperCase().includes(cls));
    }
    return true;
  });

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <AdminNavbar />
      
      <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                Nouvelle réservation vacances
              </h1>
            </div>
            <p className="text-muted-foreground text-base md:text-lg">
              Créez une nouvelle réservation de vacances pour un enfant.
            </p>
          </div>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Sélectionner un groupe</Label>
              <Select
                value={selectedGroup}
                onValueChange={(value) => {
                  console.log("Groupe sélectionné:", value);
                  setSelectedGroup(value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner un groupe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les groupes</SelectItem>
                  <SelectItem value="maternelle">Maternelle</SelectItem>
                  <SelectItem value="primaire">Primaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <HolidayReservationContent filteredChildren={filteredChildren as Tables<"children">[] | null} />
      </div>
    </div>
  );
};

export default AdminNewHolidayReservation;
