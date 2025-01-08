import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import { Child } from "@/types/profile"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { AddChildForm } from "./AddChildForm"

interface ChildrenListProps {
  children: Child[]
}

export function ChildrenList({ children }: ChildrenListProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)

  return (
    <div className="mt-8 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold tracking-tight">Liste des enfants</h3>
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
                <TableHead className="text-left font-medium">Nom</TableHead>
                <TableHead className="text-left font-medium">Prénom</TableHead>
                <TableHead className="text-left font-medium">Classe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {children && children.length > 0 ? (
                children.map((child) => (
                  <TableRow 
                    key={child.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <TableCell className="font-medium">{child.last_name}</TableCell>
                    <TableCell>{child.first_name}</TableCell>
                    <TableCell>{child.school_class}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell 
                    colSpan={3} 
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