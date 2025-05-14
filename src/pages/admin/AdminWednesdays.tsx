
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddWednesdayForm } from "@/components/admin/wednesdays/AddWednesdayForm";
import { WednesdaysList } from "@/components/admin/wednesdays/WednesdaysList";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface Wednesday {
  id: string;
  date: string;
  max_participants_kindergarten: number;
  max_participants_primary: number;
}

const AdminWednesdays = () => {
  const [wednesdayToEdit, setWednesdayToEdit] = useState<Wednesday | null>(null);
  const { toast } = useToast();
  const { data: isAdmin } = useAdminAuth();

  const { data: wednesdays, refetch, isLoading, error } = useQuery({
    queryKey: ["available_wednesdays"],
    queryFn: async () => {
      console.log("Fetching available Wednesdays...");
      
      if (!isAdmin) {
        toast({
          title: "Erreur",
          description: "Vous n'avez pas les droits administrateur",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase
        .from("available_wednesdays")
        .select("*")
        .order('date', { ascending: true });
      
      if (error) {
        console.error("Error fetching Wednesdays:", error);
        throw error;
      }
      
      console.log("Fetched Wednesdays:", data);
      return data;
    },
    enabled: !!isAdmin,
  });

  const handleEdit = (wednesday: Wednesday) => {
    setWednesdayToEdit(wednesday);
  };

  const handleSuccess = () => {
    console.log("Refreshing Wednesdays list after successful operation");
    refetch();
    setWednesdayToEdit(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Gestion des mercredis</h1>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des mercredis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Gestion des mercredis</h1>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">
          Une erreur est survenue lors du chargement des mercredis.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Gestion des mercredis</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AddWednesdayForm onSuccess={handleSuccess} wednesdayToEdit={wednesdayToEdit} />
        <WednesdaysList 
          wednesdays={wednesdays} 
          onDelete={handleSuccess} 
          onEdit={handleEdit}
        />
      </div>
    </div>
  );
};

export default AdminWednesdays;
