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
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Liste des enfants</h3>
        <Button variant="outline" size="sm" onClick={() => setShowAddDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Ajouter un enfant
        </Button>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Nom</TableHead>
              <TableHead className="text-left">Prénom</TableHead>
              <TableHead className="text-left">Classe</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {children && children.length > 0 ? (
              children.map((child) => (
                <TableRow key={child.id}>
                  <TableCell className="text-left">{child.last_name}</TableCell>
                  <TableCell className="text-left">{child.first_name}</TableCell>
                  <TableCell className="text-left">{child.school_class}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Aucun enfant enregistré
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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