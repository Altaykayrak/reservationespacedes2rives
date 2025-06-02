
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Child } from "@/types/profile";

interface ChildWithProfile extends Child {
  profile?: {
    first_name: string | null;
    last_name: string | null;
  };
}

interface ChildrenTableProps {
  children: ChildWithProfile[];
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
          <TableHead>Parent</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {children.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center h-24">
              Aucun enfant trouvé
            </TableCell>
          </TableRow>
        ) : (
          children.map((child) => (
            <TableRow key={child.id}>
              <TableCell>{child.last_name}</TableCell>
              <TableCell>{child.first_name}</TableCell>
              <TableCell>{child.school_class}</TableCell>
              <TableCell>
                {child.profile ? 
                  `${child.profile.first_name || ''} ${child.profile.last_name || ''}`.trim() || 'Non renseigné'
                  : 'Non renseigné'
                }
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
