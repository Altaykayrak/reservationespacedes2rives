
import { useState } from "react";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { ChildrenFilters } from "@/components/admin/children/ChildrenFilters";
import { ChildrenTable } from "@/components/admin/children/ChildrenTable";
import { useChildrenData } from "@/hooks/useChildrenData";
import { getGroupName } from "@/utils/schoolClassUtils";
import { Child } from "@/types/profile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddChildForm } from "@/components/profile/AddChildForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import { exportChildrenToPdf } from "@/components/admin/children/export/childrenPdfExport";

const AdminChildren = () => {
  const queryClient = useQueryClient();
  const { children, isLoading } = useChildrenData();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [deletingChild, setDeletingChild] = useState<Child | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const filteredChildren = children?.filter((child) => {
    const matchesSearch = 
      child.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.last_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesClass = selectedClass === "all" || child.school_class === selectedClass;
    const matchesGroup = selectedGroup === "all" || getGroupName(child.school_class) === selectedGroup;

    return matchesSearch && matchesClass && matchesGroup;
  });

  const handleSuccessfulEdit = () => {
    setEditingChild(null);
    // Invalider explicitement le cache pour forcer un re-fetch
    queryClient.invalidateQueries({ queryKey: ['children'] });
    toast.success("Enfant modifié avec succès");
  };

  const handleSuccessfulAdd = () => {
    setShowAddDialog(false);
    // Invalider explicitement le cache pour forcer un re-fetch
    queryClient.invalidateQueries({ queryKey: ['children'] });
    toast.success("Enfant ajouté avec succès");
  };

  const handleDeleteChild = async () => {
    if (!deletingChild) return;

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
    }
  };

  const handleExportPdf = () => {
    if (!filteredChildren || filteredChildren.length === 0) {
      toast.error("Aucun enfant à exporter");
      return;
    }
    
    try {
      exportChildrenToPdf(filteredChildren, {
        searchQuery,
        selectedClass,
        selectedGroup
      });
      toast.success("Export PDF généré avec succès");
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
      toast.error("Erreur lors de la génération du PDF");
    }
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <AdminNavbar />
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestion des enfants</h1>
          <div className="flex gap-2">
            <Button 
              onClick={handleExportPdf}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Export PDF
            </Button>
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter un enfant
            </Button>
          </div>
        </div>

        <ChildrenFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedClass={selectedClass}
          onClassChange={setSelectedClass}
          selectedGroup={selectedGroup}
          onGroupChange={setSelectedGroup}
        />

        <ChildrenTable
          children={filteredChildren || []}
          onEdit={setEditingChild}
          onDelete={setDeletingChild}
        />

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un enfant</DialogTitle>
            </DialogHeader>
            <AddChildForm
              onSuccess={handleSuccessfulAdd}
            />
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
          onOpenChange={() => setDeletingChild(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. L'enfant sera définitivement supprimé.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteChild}>
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AdminChildren;
