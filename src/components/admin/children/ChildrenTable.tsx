
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Child } from "@/types/profile";
import { useChildReservations } from "@/hooks/useChildReservations";

interface ChildWithProfile extends Child {
  profile?: {
    first_name: string | null;
    last_name: string | null;
  };
}

interface ChildrenTableProps {
  children: ChildWithProfile[];
  isLoading?: boolean;
  onEdit?: (child: Child) => void;
  onDelete?: (child: Child) => void;
}

const ChildRow = ({ 
  child, 
  onEdit, 
  onDelete 
}: { 
  child: ChildWithProfile; 
  onEdit?: (child: Child) => void;
  onDelete?: (child: Child) => void;
}) => {
  const { hasReservations, isLoading: checkingReservations } = useChildReservations(child.id);

  return (
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
      <TableCell>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit?.(child)}
            disabled={hasReservations || checkingReservations}
            title={hasReservations ? "Impossible de modifier : l'enfant a des réservations actives" : "Modifier"}
          >
            <Pencil className={`w-4 h-4 ${hasReservations ? 'text-gray-400' : 'text-blue-600'}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete?.(child)}
            disabled={hasReservations || checkingReservations}
            title={hasReservations ? "Impossible de supprimer : l'enfant a des réservations actives" : "Supprimer"}
          >
            <Trash2 className={`w-4 h-4 ${hasReservations ? 'text-gray-400' : 'text-red-600'}`} />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export const ChildrenTable = ({ 
  children, 
  isLoading = false,
  onEdit,
  onDelete
}: ChildrenTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Prénom</TableHead>
          <TableHead>Classe</TableHead>
          <TableHead>Parent</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {children.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center h-24">
              Aucun enfant trouvé
            </TableCell>
          </TableRow>
        ) : (
          children.map((child) => (
            <ChildRow
              key={child.id}
              child={child}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
};
