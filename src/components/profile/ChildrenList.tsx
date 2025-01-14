import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { UserPlus, Pencil, Trash2 } from "lucide-react"
import { Child } from "@/types/profile"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { AddChildForm } from "./AddChildForm"

interface ChildrenListProps {
  children: Child[]
}

export function ChildrenList({ children }: ChildrenListProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)

  const handleEdit = (child: Child) => {
    // TODO: Implement edit functionality
    console.log('Edit child:', child)
  }

  const handleDelete = (child: Child) => {
    // TODO: Implement delete functionality
    console.log('Delete child:', child)
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold tracking-tight text-left">Liste des enfants</h3>
        <Button variant="outline" size="sm" onClick={() => setShowAddDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Ajouter un enfant
        </Button>
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
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(child)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Modifier</span>
                      </Button>
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
    </div>
  )
}