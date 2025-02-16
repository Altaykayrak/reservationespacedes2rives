
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table"
import { Child } from "@/types/profile"

interface ChildrenTableProps {
  children: Child[]
}

export function ChildrenTable({ children }: ChildrenTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent border-b border-gray-200 dark:border-gray-800">
          <TableHead className="text-left">Nom</TableHead>
          <TableHead className="text-left">Prénom</TableHead>
          <TableHead className="text-left">Classe</TableHead>
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
  )
}
