import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface EmailSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const EmailSearch = ({ searchTerm, onSearchChange }: EmailSearchProps) => {
  return (
    <div className="mb-4">
      <div className="relative max-w-md">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
    </div>
  );
};