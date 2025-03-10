
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
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import { exportChildrenToPdf } from "@/components/admin/children/export/childrenPdfExport";
import { useChildManagement } from "@/hooks/useChildManagement";

const AdminChildren = () => {
  const { children, isLoading } = useChildrenData();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const {
    editingChild,
    setEditingChild,
    deletingChild,
    setDeletingChild,
    isDeleting,
    isChecking,
    handleEditClick,
    handleSuccessfulEdit,
    handleDeleteChild
  } = useChildManagement();

  const filteredChildren = children?.filter((child) => {
    const matchesSearch = 
      child.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.last_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesClass = selectedClass === "all" || child.school_class === selectedClass;
    const matchesGroup = selectedGroup === "all" || getGroupName(child.school_class) === selectedGroup;

    return matchesSearch && matchesClass && matchesGroup;
  });

  const handleSuccessfulAdd = () => {
    setShowAddDialog(false);
    // This is handled in the form via React Query
  };

  const handleExportPdf = () => {
    if (!filteredChildren || filteredChildren.length === 0) {
      return;
    }
    
    try {
      exportChildrenToPdf(filteredChildren, {
        searchQuery,
        selectedClass,
        selectedGroup
      });
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
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
          onEdit={handleEditClick}
          onDelete={setDeletingChild}
          isLoading={isChecking || isDeleting}
          editingChildId={editingChild?.id || null}
          deletingChildId={deletingChild?.id || null}
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

        <Dialog open={!!editingChild} onOpenChange={(open) => !isChecking && setEditingChild(open ? editingChild : null)}>
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
          onOpenChange={(open) => !isDeleting && setDeletingChild(open ? deletingChild : null)}
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
    </div>
  );
};

export default AdminChildren;
