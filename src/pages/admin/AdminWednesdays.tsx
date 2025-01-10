import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddWednesdayForm } from "@/components/admin/wednesdays/AddWednesdayForm";
import { WednesdaysList } from "@/components/admin/wednesdays/WednesdaysList";
import { useState } from "react";
import { AdminNavbar } from "@/components/admin/AdminNavbar";

interface Wednesday {
  id: string;
  date: string;
  max_participants_kindergarten: number;
  max_participants_primary: number;
}

const AdminWednesdays = () => {
  const [wednesdayToEdit, setWednesdayToEdit] = useState<Wednesday | null>(null);

  const { data: wednesdays, refetch } = useQuery({
    queryKey: ["available_wednesdays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("available_wednesdays")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const handleEdit = (wednesday: Wednesday) => {
    setWednesdayToEdit(wednesday);
  };

  return (
    <div>
      <AdminNavbar />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Gestion des mercredis</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AddWednesdayForm onSuccess={refetch} wednesdayToEdit={wednesdayToEdit} />
          <WednesdaysList 
            wednesdays={wednesdays} 
            onDelete={refetch} 
            onEdit={handleEdit}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminWednesdays;