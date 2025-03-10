
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Child } from "@/types/profile";

interface ChildrenTableProps {
  children: Child[];
  isLoading?: boolean;
}

export const ChildrenTable = ({ 
  children, 
  isLoading = false
}: ChildrenTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Prénom</TableHead>
          <TableHead>Classe</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {children.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="text-center h-24">
              Aucun enfant trouvé
            </TableCell>
          </TableRow>
        ) : (
          children.map((child) => (
            <TableRow key={child.id}>
              <TableCell>{child.last_name}</TableCell>
              <TableCell>{child.first_name}</TableCell>
              <TableCell>{child.school_class}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
