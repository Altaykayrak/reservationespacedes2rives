
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/ui/navbar";
import { Rdv } from "@/types/rdv";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface UserRdvProps {
  userRdv: Rdv;
}

export const UserRdv = ({
  userRdv
}: UserRdvProps) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'EEEE d MMMM yyyy', {
      locale: fr
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5);
  };

  const createGoogleCalendarLink = (rdv: Rdv) => {
    const rdvDate = new Date(rdv.date);
    const [startHour, startMinute] = rdv.heure_debut.split(':').map(Number);
    const [endHour, endMinute] = rdv.heure_fin.split(':').map(Number);
    const startDate = new Date(rdvDate);
    startDate.setHours(startHour, startMinute, 0);
    const endDate = new Date(rdvDate);
    endDate.setHours(endHour, endMinute, 0);
    const formatDateForGCal = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    const start = formatDateForGCal(startDate);
    const end = formatDateForGCal(endDate);
    const title = "Rendez-vous inscription Espace des 2 rives";
    const mapsUrl = "https://www.google.com/maps/place//data=!4m2!3m1!1s0x47e127d4acf81da1:0xf77c5488daee9f99?sa=X&ved=1t:8290&ictx=111";
    const phone = "02 32 68 32 10";
    const details = `Motif(s): ${rdv.motifs.join(", ")}\n\nDocuments à apporter:\n- Justificatif de domicile\n- Carnet de santé (si nouveaux vaccins)\n- Quotient familial CAF ou avis d'imposition N-2\n- Un moyen de règlement (chèque, carte de paiement, RIB si vous souhaitez mettre en place le prélèvement automatique)\n\nTéléphone: ${phone}`;
    const location = `Service Enfance - Espace des 2 rives\n${mapsUrl}`;
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
    return googleCalendarUrl;
  };

  return <>
      <Navbar />
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Votre rendez-vous d'inscription(s)</h1>
          <p className="text-gray-600">
            Voici les détails de votre rendez-vous confirmé
          </p>
          <p className="text-gray-600 mt-2">
            Pour toute annulation ou modification merci de nous contacter au 02 32 68 32 10 ou par mail : accueil@e2rives.fr
          </p>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Rendez-vous inscription(s)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-lg">Détails du rendez-vous :</h3>
              <p className="mt-2">
                <strong>Date :</strong> {formatDate(userRdv.date)}
              </p>
              <p>
                <strong>Heure :</strong> {formatTime(userRdv.heure_debut)} - {formatTime(userRdv.heure_fin)}
              </p>
              <p>
                <strong>Lieu :</strong> Accueil Espace des 2 rives 4 place de la fraternité, 27590 Pîtres
              </p>
              <p>
                <strong>Motif(s) :</strong> {userRdv.motifs.join(", ")}
              </p>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium mb-2">Documents à apporter :</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Justificatif de domicile</li>
                <li>Carnet de santé (si nouveaux vaccins)</li>
                <li>Quotient familial CAF ou avis d'imposition N-2</li>
                <li>Un moyen de règlement (chèque, carte de paiement, RIB si vous souhaitez mettre en place le prélèvement automatique)</li>
              </ul>
            </div>

            <div className="mt-6">
              <Button className="w-full flex items-center justify-center gap-2" onClick={() => window.open(createGoogleCalendarLink(userRdv), "_blank")}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
                Ajouter à mon agenda Google
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>;
};
