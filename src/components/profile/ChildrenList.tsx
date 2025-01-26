import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import { Child } from "@/types/profile"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { AddChildForm } from "./AddChildForm"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { DeleteChildDialog } from "./DeleteChildDialog"
import { ChildrenTable } from "./ChildrenTable"

interface ChildrenListProps {
  children: Child[]
}

export function ChildrenList({ children }: ChildrenListProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const queryClient = useQueryClient()

  const handleDelete = (child: Child) => {
    setSelectedChild(child)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!selectedChild) return

    try {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', selectedChild.id)

      if (error) throw error

      toast.success("Enfant supprimé avec succès")
      queryClient.invalidateQueries({ queryKey: ['children'] })
      setShowDeleteDialog(false)
    } catch (error) {
      console.error('Error deleting child:', error)
      toast.error("Erreur lors de la suppression de l'enfant")
    }
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold tracking-tight text-left">Liste des enfants</h3>
          <Button variant="outline" size="sm" onClick={() => setShowAddDialog(true)}>
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
            onDelete={handleDelete}
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

      <DeleteChildDialog 
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        child={selectedChild}
      />
    </div>
  )
}