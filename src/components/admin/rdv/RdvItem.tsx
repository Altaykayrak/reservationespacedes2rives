
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
    <Card key={rdv.id} className="p-4 relative group">
      <div className="absolute top-2 right-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
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
      <div>
        <p className="font-semibold">{formatDate(rdv.date)}</p>
        <p className="text-sm">{rdv.heure_debut.substring(0, 5)} - {rdv.heure_fin.substring(0, 5)}</p>
        <p className="text-sm mt-1">
          <span className={`px-2 py-0.5 rounded text-xs ${
            rdv.status === 'disponible' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {rdv.status}
          </span>
        </p>
        {rdv.status === 'réservé' && rdv.profiles && (
          <div className="mt-2 text-sm">
            <p>Réservé par: {rdv.profiles.first_name} {rdv.profiles.last_name}</p>
            <p>Email: {rdv.profiles.email}</p>
            <p>Motifs: {rdv.motifs.join(', ')}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RdvItem;
