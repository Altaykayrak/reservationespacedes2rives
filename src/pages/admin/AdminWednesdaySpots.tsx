
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText } from "lucide-react";
import { exportWednesdaySpotsToPdf } from "@/components/admin/spots/export/wednesdaySpotsPdfExport";
import { useWednesdaySpots } from "@/hooks/useWednesdaySpots";
import { WednesdaySpotsList } from "@/components/admin/spots/WednesdaySpotsList";
import { groupWednesdaysByMonth } from "@/utils/wednesdayUtils";

const AdminWednesdaySpots = () => {
  const { data: wednesdaySpots, isLoading, error } = useWednesdaySpots();

  const groupedWednesdays = wednesdaySpots ? groupWednesdaysByMonth(wednesdaySpots) : {};

  const handlePdfExport = () => {
    if (wednesdaySpots) {
      exportWednesdaySpotsToPdf(wednesdaySpots);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Places restantes - Mercredis</h1>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des places disponibles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Places restantes - Mercredis</h1>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Erreur lors du chargement des données</p>
            <p className="text-sm text-gray-600">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Places restantes - Mercredis</h1>
          <Badge variant="secondary" className="ml-auto text-xs">
            {Object.keys(groupedWednesdays).length} mois
          </Badge>
        </div>
        <Button
          variant="outline"
          onClick={handlePdfExport}
          className="flex items-center gap-2"
          disabled={!wednesdaySpots || wednesdaySpots.length === 0}
        >
          <FileText className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <WednesdaySpotsList wednesdaySpots={wednesdaySpots || []} />
    </div>
  );
};

export default AdminWednesdaySpots;
