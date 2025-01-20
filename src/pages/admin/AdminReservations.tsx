import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { useState } from "react";
import { ReservationList } from "@/components/admin/reservations/ReservationList";
import { EditReservationDialog } from "@/components/admin/reservations/EditReservationDialog";
import { DeleteReservationDialog } from "@/components/admin/reservations/DeleteReservationDialog";
import { Tables } from "@/integrations/supabase/types";

type ReservationWithChild = Tables<"reservations"> & {
  children: {
    first_name: string;
    last_name: string;
    school_class: string;
  };
};

const AdminReservations = () => {
  const { toast } = useToast();
  const [reservationToDelete, setReservationToDelete] = useState<string | null>(null);
  const [editingReservation, setEditingReservation] = useState<ReservationWithChild | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: reservations, refetch: refetchReservations } = useQuery({
    queryKey: ["admin_reservations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select(`
          *,
          children (
            first_name,
            last_name,
            school_class
          )
        `)
        .order('reservation_date', { ascending: true });
      
      if (error) throw error;
      return data as ReservationWithChild[];
    },
  });

  const handleDelete = async () => {
    if (!reservationToDelete) return;

    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', reservationToDelete);

      if (error) throw error;

      toast({
        title: "Réservation supprimée",
        description: "La réservation a été supprimée avec succès.",
      });

      await refetchReservations();
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de la réservation.",
        variant: "destructive",
      });
    } finally {
      setReservationToDelete(null);
    }
  };

  const handleUpdate = async () => {
    if (!editingReservation) return;

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from("reservations")
        .update({
          without_meal: editingReservation.without_meal,
          early_dropoff: editingReservation.early_dropoff,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingReservation.id);

      if (error) throw error;

      toast({
        title: "Réservation mise à jour",
        description: "La réservation a été modifiée avec succès.",
      });

      await refetchReservations();
      setEditingReservation(null);
    } catch (error) {
      console.error("Error updating reservation:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification de la réservation.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <AdminNavbar />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Gestion des réservations</h1>

        <ReservationList
          reservations={reservations}
          onEdit={setEditingReservation}
          onDelete={setReservationToDelete}
        />

        <EditReservationDialog
          reservation={editingReservation}
          isOpen={!!editingReservation}
          onClose={() => setEditingReservation(null)}
          onUpdate={handleUpdate}
          isSubmitting={isSubmitting}
          withoutMeal={editingReservation?.without_meal || false}
          earlyDropoff={editingReservation?.early_dropoff || false}
          onWithoutMealChange={(checked) => 
            setEditingReservation(prev => 
              prev ? { ...prev, without_meal: checked } : null
            )
          }
          onEarlyDropoffChange={(checked) => 
            setEditingReservation(prev => 
              prev ? { ...prev, early_dropoff: checked } : null
            )
          }
        />

        <DeleteReservationDialog
          isOpen={!!reservationToDelete}
          onClose={() => setReservationToDelete(null)}
          onConfirm={handleDelete}
        />
      </div>
    </div>
  );
};

export default AdminReservations;