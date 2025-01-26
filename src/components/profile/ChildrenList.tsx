import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { UserPlus, Trash2 } from "lucide-react"
import { Child } from "@/types/profile"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useState } from "react"
import { AddChildForm } from "./AddChildForm"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

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
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-gray-200 dark:border-gray-800">
                <TableHead className="text-left">Nom</TableHead>
                <TableHead className="text-left">Prénom</TableHead>
                <TableHead className="text-left">Classe</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {children && children.length > 0 ? (
                children.map((child) => (
                  <TableRow 
                    key={child.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <TableCell className="text-left">{child.last_name}</TableCell>
                    <TableCell className="text-left">{child.first_name}</TableCell>
                    <TableCell className="text-left">{child.school_class}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(child)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Supprimer</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell 
                    colSpan={4} 
                    className="text-center h-32 text-muted-foreground"
                  >
                    Aucun enfant enregistré
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer un enfant</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet enfant ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}