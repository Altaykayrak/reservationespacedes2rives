
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { Child } from "@/types/profile";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface ChildrenTableProps {
  children: Child[];
  onEdit?: (child: Child) => void;
  onDelete?: (child: Child) => void;
  isAdmin?: boolean;
}

export function ChildrenTable({
  children,
  onEdit,
  onDelete,
  isAdmin = false
}: ChildrenTableProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Effet de clignotement au chargement quand il n'y a pas d'enfants
  useEffect(() => {
    if (children.length === 0) {
      const interval = setInterval(() => {
        setIsVisible(prev => !prev);
      }, 700);

      // Arrêter l'effet après 3 secondes
      const timeout = setTimeout(() => {
        clearInterval(interval);
        setIsVisible(true);
      }, 3000);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [children.length]);
  
  return <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent border-b border-gray-200 dark:border-gray-800">
          <TableHead className="text-left">Nom</TableHead>
          <TableHead className="text-left">Prénom</TableHead>
          <TableHead className="text-left">Classe</TableHead>
          {(onEdit || onDelete) && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {children && children.length > 0 ? children.map(child => <TableRow key={child.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <TableCell className="text-left">{child.last_name}</TableCell>
              <TableCell className="text-left">{child.first_name}</TableCell>
              <TableCell className="text-left">{child.school_class}</TableCell>
              {(onEdit || onDelete) && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {onEdit && (
                      <Button variant="ghost" size="icon" onClick={() => onEdit(child)} title="Modifier">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button variant="ghost" size="icon" onClick={() => onDelete(child)} title="Supprimer">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>) : <TableRow>
            <TableCell colSpan={(onEdit || onDelete) ? 4 : 3} className={`text-center h-32 text-red-600 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-30'}`}>Aucun enfant enregistré</TableCell>
          </TableRow>}
      </TableBody>
    </Table>;
}
