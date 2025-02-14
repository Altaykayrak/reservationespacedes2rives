import { ReservationList } from "./ReservationList";
import { ReservationFilters } from "./ReservationFilters";
import { EditReservationDialog } from "./EditReservationDialog";
import { DeleteReservationDialog } from "./DeleteReservationDialog";
import { useFilteredReservations } from "./hooks/useFilteredReservations";
import { useReservationActions } from "./ReservationActions";
import { WednesdayReservationWithChild, HolidayReservationWithChild } from "@/types/reservations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet } from "lucide-react";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import { fr } from "date-fns/locale";

interface AdminReservationsContentProps {
  wednesdayReservations: WednesdayReservationWithChild[] | null;
  holidayReservations: HolidayReservationWithChild[] | null;
  isLoading: boolean;
  refetchReservations: () => Promise<unknown>;
}

export const AdminReservationsContent = ({
  wednesdayReservations,
  holidayReservations,
  isLoading,
  refetchReservations
}: AdminReservationsContentProps) => {
  const {
    searchQuery,
    setSearchQuery,
    selectedDate,
    setSelectedDate,
    selectedClass,
    setSelectedClass,
    selectedGroup,
    setSelectedGroup,
    filteredWednesdayReservations,
    filteredHolidayReservations,
    sortOrder,
    setSortOrder
  } = useFilteredReservations(wednesdayReservations, holidayReservations);

  const {
    reservationToDelete,
    setReservationToDelete,
    editingReservation,
    setEditingReservation,
    isSubmitting,
    handleDelete,
    handleUpdate
  } = useReservationActions({ refetchReservations });

  const exportToPDF = (reservations: (WednesdayReservationWithChild | HolidayReservationWithChild)[] | null) => {
    if (!reservations) return;
    
    const doc = new jsPDF();
    doc.setFont("helvetica");
    doc.setFontSize(16);
    doc.text("Liste des réservations", 15, 15);
    doc.setFontSize(12);
    
    const badgeStyle = {
      withoutMeal: {
        border: '#EAB308', // yellow-500
        text: '#A16207',   // yellow-700
        bg: '#FEFCE8'      // yellow-50
      },
      earlyDropoff: {
        border: '#3B82F6', // blue-500
        text: '#1D4ED8',   // blue-700
        bg: '#EFF6FF'      // blue-50
      }
    };

    let y = 30;
    const lineHeight = 8;
    const margin = 15;
    const dateWidth = 30;
    const nameWidth = 40;
    const classWidth = 20;
    
    reservations.forEach((r) => {
      if (y > 270) {
        doc.addPage();
        y = 30;
      }

      const date = format(
        new Date('wednesday_id' in r ? r.available_wednesdays.date : r.reservation_date),
        'dd/MM/yyyy',
        { locale: fr }
      );

      const fullName = `${r.children?.first_name} ${r.children?.last_name}`;
      
      doc.text(date, margin, y);
      doc.text(fullName, margin + dateWidth, y);
      doc.text(`(${r.children?.school_class || ''})`, margin + dateWidth + nameWidth, y);

      let badgeX = margin + dateWidth + nameWidth + classWidth;

      if (r.without_meal) {
        doc.setFillColor(badgeStyle.withoutMeal.bg);
        doc.setDrawColor(badgeStyle.withoutMeal.border);
        doc.setTextColor(badgeStyle.withoutMeal.text);
        
        doc.roundedRect(badgeX, y - 4, 25, 6, 1, 1, 'FD');
        doc.text('Sans repas', badgeX + 2, y);
        
        badgeX += 30;
      }

      if (r.early_dropoff) {
        doc.setFillColor(badgeStyle.earlyDropoff.bg);
        doc.setDrawColor(badgeStyle.earlyDropoff.border);
        doc.setTextColor(badgeStyle.earlyDropoff.text);
        
        doc.roundedRect(badgeX, y - 4, 35, 6, 1, 1, 'FD');
        doc.text('Accueil avant 8h30', badgeX + 2, y);
      }

      doc.setTextColor(0);
      doc.setDrawColor(0);
      
      y += lineHeight;
    });

    doc.save(`reservations_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const exportToExcel = (reservations: (WednesdayReservationWithChild | HolidayReservationWithChild)[] | null) => {
    if (!reservations) return;
    
    const rows = reservations.map(r => ({
      date: format(new Date(('available_wednesdays' in r) ? r.available_wednesdays.date : r.reservation_date), 'dd/MM/yyyy'),
      nom: r.children?.last_name,
      prenom: r.children?.first_name,
      classe: r.children?.school_class,
      repas: r.without_meal ? "Non" : "Oui",
      garderie: r.early_dropoff ? "Oui" : "Non",
      status: r.status
    }));

    const headers = "Date;Nom;Prénom;Classe;Repas;Garderie;Status\n";
    const content = headers + rows.map(row => 
      `${row.date};${row.nom};${row.prenom};${row.classe};${row.repas};${row.garderie};${row.status}`
    ).join('\n');

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservations_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Gestion des réservations</h1>

      <Tabs defaultValue="wednesday" className="space-y-4">
        <TabsList>
          <TabsTrigger value="wednesday">Mercredis</TabsTrigger>
          <TabsTrigger value="holiday">Vacances</TabsTrigger>
        </TabsList>

        <ReservationFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          selectedClass={selectedClass}
          onClassChange={setSelectedClass}
          selectedGroup={selectedGroup}
          onGroupChange={setSelectedGroup}
        />

        <TabsContent value="wednesday">
          <div className="my-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  {filteredWednesdayReservations ? (
                    <p>Total des réservations affichées : <span className="font-semibold">{filteredWednesdayReservations.length}</span></p>
                  ) : null}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "date" ? "name" : "date")}
                >
                  Trier par {sortOrder === "date" ? "nom" : "date"}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => exportToPDF(filteredWednesdayReservations)}
                  disabled={!filteredWednesdayReservations?.length}
                >
                  <FileText className="mr-2" />
                  Export PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => exportToExcel(filteredWednesdayReservations)}
                  disabled={!filteredWednesdayReservations?.length}
                >
                  <FileSpreadsheet className="mr-2" />
                  Export Excel
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div>Chargement des réservations...</div>
            ) : (
              <ReservationList
                reservations={filteredWednesdayReservations}
                onEdit={setEditingReservation}
                onDelete={setReservationToDelete}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="holiday">
          <div className="my-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  {filteredHolidayReservations ? (
                    <p>Total des réservations affichées : <span className="font-semibold">{filteredHolidayReservations.length}</span></p>
                  ) : null}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "date" ? "name" : "date")}
                >
                  Trier par {sortOrder === "date" ? "nom" : "date"}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => exportToPDF(filteredHolidayReservations)}
                  disabled={!filteredHolidayReservations?.length}
                >
                  <FileText className="mr-2" />
                  Export PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => exportToExcel(filteredHolidayReservations)}
                  disabled={!filteredHolidayReservations?.length}
                >
                  <FileSpreadsheet className="mr-2" />
                  Export Excel
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div>Chargement des réservations...</div>
            ) : (
              <ReservationList
                reservations={filteredHolidayReservations}
                onEdit={setEditingReservation}
                onDelete={setReservationToDelete}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      <EditReservationDialog
        reservation={editingReservation}
        isOpen={!!editingReservation}
        onClose={() => setEditingReservation(null)}
        onUpdate={handleUpdate}
        isSubmitting={isSubmitting}
        withoutMeal={editingReservation?.without_meal || false}
        earlyDropoff={editingReservation?.early_dropoff || false}
        onWithoutMealChange={(checked) => 
          setEditingReservation(prev => 
            prev ? { ...prev, without_meal: checked } : null
          )
        }
        onEarlyDropoffChange={(checked) => 
          setEditingReservation(prev => 
            prev ? { ...prev, early_dropoff: checked } : null
          )
        }
      />

      <DeleteReservationDialog
        isOpen={!!reservationToDelete}
        onClose={() => setReservationToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
