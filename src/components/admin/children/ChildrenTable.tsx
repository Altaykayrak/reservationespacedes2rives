
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Child } from "@/types/profile";
import { PencilIcon, Trash2Icon } from "lucide-react";

interface ChildrenTableProps {
  children: Child[];
  onEdit: (child: Child) => void;
  onDelete: (child: Child) => void;
  isLoading?: boolean;
  editingChildId?: string | null;
  deletingChildId?: string | null;
}

export const ChildrenTable = ({ 
  children, 
  onEdit, 
  onDelete, 
  isLoading = false,
  editingChildId = null,
  deletingChildId = null
}: ChildrenTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Prénom</TableHead>
          <TableHead>Classe</TableHead>
          <TableHead>Actions</TableHead>
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(child)}
                    disabled={isLoading || editingChildId === child.id}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(child)}
                    disabled={isLoading || deletingChildId === child.id}
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
