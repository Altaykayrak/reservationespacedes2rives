
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import { Child } from "@/types/profile"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { AddChildForm } from "./AddChildForm"
import { useQueryClient } from "@tanstack/react-query"
import { ChildrenTable } from "./ChildrenTable"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface ChildrenListProps {
  children: Child[]
}

export function ChildrenList({ children }: ChildrenListProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingChild, setEditingChild] = useState<Child | null>(null)
  const [deletingChild, setDeletingChild] = useState<Child | null>(null)
  const [isButtonFlashing, setIsButtonFlashing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const queryClient = useQueryClient()

  // Effet de clignotement du bouton quand il n'y a pas d'enfants
  useEffect(() => {
    if (children.length === 0) {
      setIsButtonFlashing(true);
      
      // Arrêter l'effet après 3 secondes
      const timeout = setTimeout(() => {
        setIsButtonFlashing(false);
      }, 3000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [children.length]);

  const handleEditClick = async (child: Child) => {
    setIsChecking(true);
    
    try {
      // Vérifier si l'enfant a des réservations
      const { data: wednesdayReservations, error: wednesdayError } = await supabase
        .from('wednesday_reservations')
        .select('id')
        .eq('child_id', child.id)
        .limit(1);

      if (wednesdayError) throw wednesdayError;

      const { data: holidayReservations, error: holidayError } = await supabase
        .from('holiday_reservations')
        .select('id')
        .eq('child_id', child.id)
        .limit(1);

      if (holidayError) throw holidayError;

      if (wednesdayReservations?.length > 0 || holidayReservations?.length > 0) {
        toast.error("Impossible de modifier un enfant qui a des réservations");
        return;
      }

      // Si pas de réservations, permettre la modification
      setEditingChild(child);
    } catch (error) {
      console.error('Error checking reservations:', error);
      toast.error("Erreur lors de la vérification des réservations");
    } finally {
      setIsChecking(false);
    }
  };

  const handleSuccessfulEdit = () => {
    setEditingChild(null);
    // Invalider explicitement le cache pour forcer un re-fetch
    queryClient.invalidateQueries({ queryKey: ['children'] });
    toast.success("Enfant modifié avec succès");
  };

  const handleDeleteChild = async () => {
    if (!deletingChild) return;
    
    setIsDeleting(true);

    try {
      // Vérifier si l'enfant a des réservations
      const { data: wednesdayReservations, error: wednesdayError } = await supabase
        .from('wednesday_reservations')
        .select('id')
        .eq('child_id', deletingChild.id)
        .limit(1);

      if (wednesdayError) throw wednesdayError;

      const { data: holidayReservations, error: holidayError } = await supabase
        .from('holiday_reservations')
        .select('id')
        .eq('child_id', deletingChild.id)
        .limit(1);

      if (holidayError) throw holidayError;

      if (wednesdayReservations?.length > 0 || holidayReservations?.length > 0) {
        toast.error("Impossible de supprimer un enfant qui a des réservations");
        return;
      }

      // Supprimer l'enfant
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', deletingChild.id);

      if (error) throw error;

      // Invalider explicitement le cache pour forcer un re-fetch
      queryClient.invalidateQueries({ queryKey: ['children'] });
      toast.success("Enfant supprimé avec succès");
      setDeletingChild(null);
    } catch (error) {
      console.error('Error deleting child:', error);
      toast.error("Erreur lors de la suppression de l'enfant");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold tracking-tight text-left">Liste des enfants</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAddDialog(true)}
            className={isButtonFlashing ? "animate-shake text-red-600 border-red-600" : ""}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Ajouter un enfant
          </Button>
        </div>
        <p className="text-[#ea384c] text-sm">
          Pour vos enfants en petite section, seules les vacances d'été sont réservables en ligne.
        </p>
      </div>
      <Card className="overflow-hidden border-0 shadow-sm">
        <div className="overflow-x-auto">
          <ChildrenTable 
            children={children} 
            onEdit={handleEditClick}
            onDelete={setDeletingChild}
            isChecking={isChecking}
          />
        </div>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un enfant</DialogTitle>
          </DialogHeader>
          <AddChildForm onSuccess={() => setShowAddDialog(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingChild} onOpenChange={() => setEditingChild(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'enfant</DialogTitle>
          </DialogHeader>
          {editingChild && (
            <AddChildForm
              initialData={editingChild}
              onSuccess={handleSuccessfulEdit}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog 
        open={!!deletingChild} 
        onOpenChange={(isOpen) => !isDeleting && setDeletingChild(isOpen ? deletingChild : null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'enfant sera définitivement supprimé.
              {isDeleting && <p className="mt-2">Vérification des réservations en cours...</p>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteChild}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
