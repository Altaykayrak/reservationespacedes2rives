
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FileSpreadsheet } from "lucide-react";
import { ExportData } from "./types";
import { exportToExcel } from "./excelExport";
import { formatDate } from "./utils";

interface ExcelFilterDialogProps {
  exportData: ExportData;
}

export const ExcelFilterDialog = ({ exportData }: ExcelFilterDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [filters, setFilters] = useState({
    withMeal: false, // AR
    withoutMeal: false, // SR
    earlyDropoff: false, // AM
  });
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (filterType: keyof typeof filters, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: checked
    }));
  };

  const handleExport = () => {
    if (!selectedDate) return;

    // Filtrer les données selon les critères sélectionnés
    const filteredData = {
      ...exportData,
      dates: [selectedDate] // Ne garder que la date sélectionnée
    };

    // Filtrer les enfants selon les critères
    const filteredChildrenByClass = new Map();
    
    exportData.childrenByClass.forEach((classData, className) => {
      const filteredChildren = classData.children.filter(child => {
        const reservationData = child.reservations.get(selectedDate);
        if (!reservationData) return false;

        const hasEarlyDropoff = reservationData.early_dropoff;
        const hasWithoutMeal = reservationData.without_meal;
        const hasWithMeal = !reservationData.without_meal;

        // Vérifier si l'enfant correspond aux filtres sélectionnés
        const matchesFilters = 
          (filters.earlyDropoff && hasEarlyDropoff) ||
          (filters.withoutMeal && hasWithoutMeal) ||
          (filters.withMeal && hasWithMeal);

        return matchesFilters;
      });

      if (filteredChildren.length > 0) {
        filteredChildrenByClass.set(className, {
          children: filteredChildren
        });
      }
    });

    const finalFilteredData = {
      ...filteredData,
      childrenByClass: filteredChildrenByClass
    };

    exportToExcel(finalFilteredData);
    setIsOpen(false);
  };

  const isExportDisabled = !selectedDate || (!filters.withMeal && !filters.withoutMeal && !filters.earlyDropoff);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Export Excel Filtré
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filtrer l'export Excel</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une date" />
              </SelectTrigger>
              <SelectContent>
                {exportData.dates.map(date => (
                  <SelectItem key={date} value={date}>
                    {formatDate(date)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Filtres</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="with-meal"
                  checked={filters.withMeal}
                  onCheckedChange={(checked) => handleFilterChange('withMeal', !!checked)}
                />
                <Label htmlFor="with-meal" className="text-sm">
                  Avec repas (AR)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="without-meal"
                  checked={filters.withoutMeal}
                  onCheckedChange={(checked) => handleFilterChange('withoutMeal', !!checked)}
                />
                <Label htmlFor="without-meal" className="text-sm">
                  Sans repas (SR)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="early-dropoff"
                  checked={filters.earlyDropoff}
                  onCheckedChange={(checked) => handleFilterChange('earlyDropoff', !!checked)}
                />
                <Label htmlFor="early-dropoff" className="text-sm">
                  Accueil matinal (AM)
                </Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleExport} disabled={isExportDisabled}>
              Exporter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
