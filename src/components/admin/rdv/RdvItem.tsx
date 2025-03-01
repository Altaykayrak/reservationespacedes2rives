
import React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rdv } from "@/types/rdv";

interface RdvItemProps {
  rdv: Rdv;
  onDeleteRdv: (id: string) => void;
}

const RdvItem: React.FC<RdvItemProps> = ({ rdv, onDeleteRdv }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'EEEE d MMMM yyyy', { locale: fr });
  };

  return (
    <Card key={rdv.id} className="p-3 relative group">
      <div className="flex items-center space-x-3">
        <div className="w-36 flex-shrink-0">
          <p className="font-semibold text-sm">{formatDate(rdv.date)}</p>
          <p className="text-xs text-gray-600">{rdv.heure_debut.substring(0, 5)} - {rdv.heure_fin.substring(0, 5)}</p>
        </div>
        
        <span className={`px-2 py-0.5 rounded text-xs flex-shrink-0 ${
          rdv.status === 'disponible' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {rdv.status}
        </span>
        
        {rdv.status === 'réservé' && rdv.profiles ? (
          <div className="flex-grow overflow-hidden flex items-center space-x-2 text-xs">
            <span className="truncate">{rdv.profiles.first_name} {rdv.profiles.last_name}</span>
            <span className="truncate">{rdv.profiles.email}</span>
            <span className="truncate">Motifs: {rdv.motifs.join(', ')}</span>
          </div>
        ) : (
          <div className="flex-grow"></div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-auto"
          onClick={() => onDeleteRdv(rdv.id)}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-red-500"
          >
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
        </Button>
      </div>
    </Card>
  );
};

export default RdvItem;
