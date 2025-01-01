import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddWednesdayForm } from "@/components/admin/wednesdays/AddWednesdayForm";
import { WednesdaysList } from "@/components/admin/wednesdays/WednesdaysList";

const AdminWednesdays = () => {
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

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Gestion des mercredis</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AddWednesdayForm onSuccess={refetch} />
        <WednesdaysList wednesdays={wednesdays} onDelete={refetch} />
      </div>
    </div>
  );
};

export default AdminWednesdays;