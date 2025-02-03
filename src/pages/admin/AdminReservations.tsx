import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { ReservationList } from "@/components/admin/reservations/ReservationList";
import { EditReservationDialog } from "@/components/admin/reservations/EditReservationDialog";
import { DeleteReservationDialog } from "@/components/admin/reservations/DeleteReservationDialog";
import { Tables } from "@/integrations/supabase/types";
import { ReservationFilters } from "@/components/admin/reservations/ReservationFilters";
import { toast } from "sonner";

type ReservationWithChild = Tables<"reservations"> & {
  children: {
    first_name: string;
    last_name: string;
    school_class: string;
  };
};

const AdminReservations = () => {
  const [reservationToDelete, setReservationToDelete] = useState<string | null>(null);
  const [editingReservation, setEditingReservation] = useState<ReservationWithChild | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState("all");

  // Vérifie si l'utilisateur est un admin
  const { data: isAdmin, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      const adminSession = localStorage.getItem('adminSession');
      return adminSession === 'true';
    },
  });

  const { data: reservations, refetch: refetchReservations, isLoading, error: queryError } = useQuery({
    queryKey: ["admin_reservations"],
    queryFn: async () => {
      try {
        console.log("Fetching reservations...");
        const adminUsername = localStorage.getItem('adminUsername');
        
        // Set admin session
        await supabase.auth.setSession({
          access_token: adminUsername || '',
          refresh_token: '',
        });
        
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
        
        if (error) {
          console.error("Error fetching reservations:", error);
          throw error;
        }

        console.log("Fetched reservations:", data);
        return data as ReservationWithChild[];
      } catch (error) {
        console.error("Error in query function:", error);
        throw error;
      }
    },
  });

  const filteredReservations = reservations?.filter((reservation) => {
    const fullName = `${reservation.children?.first_name} ${reservation.children?.last_name}`.toLowerCase();
    const searchMatch = searchQuery 
      ? fullName.includes(searchQuery.toLowerCase())
      : true;

    const dateMatch = selectedDate
      ? reservation.reservation_date === selectedDate
      : true;

    const classMatch = selectedClass === "all"
      ? true
      : reservation.children?.school_class === selectedClass;

    const getGroup = (schoolClass: string) => {
      if (["PS", "MS", "GS"].includes(schoolClass)) return "maternelle";
      if (["CP", "CE1", "CE2", "CM1", "CM2"].includes(schoolClass)) return "primaire";
      return "ado";
    };

    const groupMatch = selectedGroup === "all"
      ? true
      : getGroup(reservation.children?.school_class || "") === selectedGroup;

    return searchMatch && dateMatch && classMatch && groupMatch;
  });

  const handleDelete = async () => {
    if (!reservationToDelete) return;

    try {
      const adminUsername = localStorage.getItem('adminUsername');
      await supabase.auth.setSession({
        access_token: adminUsername || '',
        refresh_token: '',
      });

      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', reservationToDelete);

      if (error) throw error;

      toast.success("Réservation supprimée avec succès");
      await refetchReservations();
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast.error("Une erreur est survenue lors de la suppression de la réservation");
    } finally {
      setReservationToDelete(null);
    }
  };

  const handleUpdate = async () => {
    if (!editingReservation) return;

    try {
      setIsSubmitting(true);
      const adminUsername = localStorage.getItem('adminUsername');
      await supabase.auth.setSession({
        access_token: adminUsername || '',
        refresh_token: '',
      });

      const { error } = await supabase
        .from("reservations")
        .update({
          without_meal: editingReservation.without_meal,
          early_dropoff: editingReservation.early_dropoff,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingReservation.id);

      if (error) throw error;

      toast.success("Réservation mise à jour avec succès");
      await refetchReservations();
      setEditingReservation(null);
    } catch (error) {
      console.error("Error updating reservation:", error);
      toast.error("Une erreur est survenue lors de la modification de la réservation");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingAdmin) {
    return (
      <div>
        <AdminNavbar />
        <div className="container mx-auto p-8">
          <h1 className="text-3xl font-bold mb-8">Gestion des réservations</h1>
          <div>Vérification des droits d'accès...</div>
        </div>
      </div>
    );
  }

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

  if (queryError) {
    return (
      <div>
        <AdminNavbar />
        <div className="container mx-auto p-8">
          <h1 className="text-3xl font-bold mb-8">Gestion des réservations</h1>
          <div className="text-red-500">
            Erreur lors du chargement des réservations: {queryError.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminNavbar />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Gestion des réservations</h1>

        <ReservationFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          selectedClass={selectedClass}
          onClassChange={setSelectedClass}
          selectedGroup={selectedGroup}
          onGroupChange={setSelectedGroup}
        />

        {isLoading ? (
          <div>Chargement des réservations...</div>
        ) : (
          <ReservationList
            reservations={filteredReservations}
            onEdit={setEditingReservation}
            onDelete={setReservationToDelete}
          />
        )}

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