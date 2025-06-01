
import { Rdv } from "@/types/rdv";

export const filterRdvList = (
  rdvList: Rdv[],
  startDate: string,
  endDate: string,
  status: string,
  selectedMotifs: string[],
  searchQuery: string
): Rdv[] => {
  return rdvList.filter((rdv) => {
    // Filter by date range if set
    const dateMatches = 
      (!startDate || rdv.date >= startDate) && 
      (!endDate || rdv.date <= endDate);
    
    // Filter by status if not "all"
    const statusMatches = 
      status === "all" || 
      (status === "disponible" && rdv.status === "disponible") ||
      (status === "réservé" && rdv.status === "réservé");
    
    // Filter by motifs if any are selected
    const motifsMatch = 
      selectedMotifs.length === 0 || 
      (rdv.motifs && 
        selectedMotifs.some(motif => rdv.motifs?.includes(motif)));
    
    // Filter by search query (user name)
    const searchMatches = 
      !searchQuery ||
      (rdv.profiles?.first_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rdv.profiles?.last_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rdv.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return dateMatches && statusMatches && motifsMatch && searchMatches;
  });
};
