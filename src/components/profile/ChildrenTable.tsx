import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { Child } from "@/types/profile"

interface ChildrenTableProps {
  children: Child[]
  onDelete: (child: Child) => void
}

export function ChildrenTable({ children, onDelete }: ChildrenTableProps) {
  return (
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
                  onClick={() => onDelete(child)}
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
  )
}