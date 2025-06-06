
import { useState } from "react";
import { ChildrenFilters } from "@/components/admin/children/ChildrenFilters";
import { ChildrenTable } from "@/components/admin/children/ChildrenTable";
import { useChildrenData } from "@/hooks/useChildrenData";
import { useChildActions } from "@/hooks/useChildActions";
import { getGroupName } from "@/utils/schoolClassUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddChildForm } from "@/components/profile/AddChildForm";
import { EditChildDialog } from "@/components/profile/dialogs/EditChildDialog";
import { DeleteChildDialog } from "@/components/profile/dialogs/DeleteChildDialog";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Users } from "lucide-react";
import { exportChildrenToPdf } from "@/components/admin/children/export/childrenPdfExport";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

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
    handleDelete,
    handleSuccessfulEdit
  } = useChildActions();

  const queryClient = useQueryClient();

  const filteredChildren = children?.filter((child) => {
    const matchesSearch = 
      child.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (child.profile?.first_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (child.profile?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesClass = selectedClass === "all" || child.school_class === selectedClass;
    const matchesGroup = selectedGroup === "all" || getGroupName(child.school_class) === selectedGroup;

    return matchesSearch && matchesClass && matchesGroup;
  });

  const handleSuccessfulAdd = () => {
    setShowAddDialog(false);
    // Refresh the data explicitly
    queryClient.invalidateQueries({ queryKey: ["admin_all_children"] });
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

        {/* Compteur d'enfants */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-lg font-medium">
              <Users className="w-5 h-5 text-purple-600" />
              <span>
                {filteredChildren?.length || 0} enfant{(filteredChildren?.length || 0) > 1 ? 's' : ''} 
                {(searchQuery || selectedClass !== "all" || selectedGroup !== "all") && 
                  ` sur ${children?.length || 0} au total`
                }
              </span>
            </div>
          </CardContent>
        </Card>

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
          isLoading={isLoading}
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
              isAdminMode={true}
            />
          </DialogContent>
        </Dialog>

        <EditChildDialog
          child={editingChild}
          onOpenChange={setEditingChild}
          onSuccess={handleSuccessfulEdit}
          isAdminMode={true}
        />

        <DeleteChildDialog
          child={deletingChild}
          onOpenChange={setDeletingChild}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
};

export default AdminChildren;
