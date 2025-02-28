import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { Child } from "@/types/profile";
import { useState, useEffect } from "react";
interface ChildrenTableProps {
  children: Child[];
}
export function ChildrenTable({
  children
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
        </TableRow>
      </TableHeader>
      <TableBody>
        {children && children.length > 0 ? children.map(child => <TableRow key={child.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <TableCell className="text-left">{child.last_name}</TableCell>
              <TableCell className="text-left">{child.first_name}</TableCell>
              <TableCell className="text-left">{child.school_class}</TableCell>
            </TableRow>) : <TableRow>
            <TableCell colSpan={3} className={`text-center h-32 text-red-600 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-30'}`}>Aucun enfant enregistré</TableCell>
          </TableRow>}
      </TableBody>
    </Table>;
}