
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import { Child } from "@/types/profile"
import { useState, useEffect } from "react"
import { ChildrenTable } from "./ChildrenTable"
import { useChildManagement } from "@/hooks/useChildManagement"
import { AddChildDialog } from "./dialogs/AddChildDialog"
import { EditChildDialog } from "./dialogs/EditChildDialog"
import { DeleteChildDialog } from "./dialogs/DeleteChildDialog"

interface ChildrenListProps {
  children: Child[]
}

export function ChildrenList({ children }: ChildrenListProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [isButtonFlashing, setIsButtonFlashing] = useState(false)
  
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
  } = useChildManagement()

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

  const handleAddSuccess = () => {
    setShowAddDialog(false);
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

      <AddChildDialog 
        isOpen={showAddDialog} 
        onOpenChange={setShowAddDialog}
        onSuccess={handleAddSuccess} 
      />

      <EditChildDialog 
        child={editingChild} 
        onOpenChange={setEditingChild}
        onSuccess={handleSuccessfulEdit} 
      />

      <DeleteChildDialog 
        child={deletingChild}
        onOpenChange={setDeletingChild}
        onDelete={handleDeleteChild}
        isDeleting={isDeleting}
      />
    </div>
  )
}
