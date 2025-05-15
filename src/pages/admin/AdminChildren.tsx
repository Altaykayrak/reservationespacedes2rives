
import { useState } from "react";
import { ChildrenFilters } from "@/components/admin/children/ChildrenFilters";
import { ChildrenTable } from "@/components/admin/children/ChildrenTable";
import { useChildrenData } from "@/hooks/useChildrenData";
import { getGroupName } from "@/utils/schoolClassUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddChildForm } from "@/components/profile/AddChildForm";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import { exportChildrenToPdf } from "@/components/admin/children/export/childrenPdfExport";

const AdminChildren = () => {
  const { children, isLoading } = useChildrenData();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);

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
          isLoading={isLoading}
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
      </div>
    </div>
  );
};

export default AdminChildren;
