
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReservationEmailRequest {
  rdvId?: string;
  motifs?: string[];
  userId?: string;
  reservationType?: string;
  childName?: string;
  childClass?: string;
  dates?: string[];
  period?: string;
  withoutMeal?: boolean[];
  earlyDropoff?: boolean[];
  requestId?: string;
  userEmail?: string;
  userName?: string;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";

const resend = new Resend(resendApiKey);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const processedRequests = new Map<string, number>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes TTL for cache entries

setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of processedRequests.entries()) {
    if (now - timestamp > CACHE_TTL) {
      processedRequests.delete(key);
    }
  }
}, 60 * 1000); // Every minute

// Function to generate iCalendar format string for calendar events
function generateICalendarString(eventDetails: {
  summary: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
  uid: string;
}): string {
  // Format date to iCalendar format: YYYYMMDDTHHMMSS
  const formatDateToICS = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/g, '');
  };
  
  const now = new Date();
  
  // Make sure the dates use proper UTC format for iCalendar
  const startDate = formatDateToICS(eventDetails.start);
  const endDate = formatDateToICS(eventDetails.end);
  const createdDate = formatDateToICS(now);
  
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//E2Rives//Reservation System//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    `X-WR-CALNAME:Rendez-vous E2Rives`,
    'BEGIN:VEVENT',
    `DTSTAMP:${createdDate}`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `UID:${eventDetails.uid}@e2rives.fr`,
    `CREATED:${createdDate}`,
    `DESCRIPTION:${eventDetails.description.replace(/\n/g, '\\n')}`,
    `LAST-MODIFIED:${createdDate}`,
    `LOCATION:${eventDetails.location}`,
    `SEQUENCE:0`,
    `STATUS:CONFIRMED`,
    `SUMMARY:${eventDetails.summary}`,
    `TRANSP:OPAQUE`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Rappel du rendez-vous',
    'TRIGGER:-PT15M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

// Fonction pour créer plusieurs boutons pour différents services de calendrier
function generateCalendarButtons(icsContent: string, eventSummary: string, startDateTime: Date, endDateTime: Date, location: string, description: string): string {
  // Créer l'objet du lien Google Calendar
  const googleStartTime = startDateTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/g, '');
  const googleEndTime = endDateTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/g, '');
  
  // Encodage URL pour Google Calendar
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventSummary)}&dates=${googleStartTime}/${googleEndTime}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
  
  // Au lieu d'utiliser data:URI qui peut causer des problèmes, on explique comment télécharger
  // et importer le fichier .ics manuellement
  return `
    <div style="margin-top: 20px; margin-bottom: 20px; text-align: center;">
      <p style="margin-bottom: 10px; font-weight: bold;">Ajouter à votre calendrier :</p>
      
      <a href="${googleCalendarUrl}" target="_blank" style="background-color: #4285F4; color: white; padding: 10px 15px; text-align: center; text-decoration: none; display: inline-block; font-size: 14px; margin: 4px 2px; cursor: pointer; border-radius: 4px;">
        Google Calendar
      </a>
      
      <p style="margin-top: 15px; margin-bottom: 5px;">Pour Outlook, Apple Calendar ou autre :</p>
      <div style="border: 1px solid #ddd; padding: 10px; border-radius: 4px; background-color: #f9f9f9; text-align: left; max-width: 500px; margin: 0 auto;">
        <p>1. Téléchargez le fichier calendrier ci-joint</p>
        <p>2. Ouvrez votre application de calendrier (Outlook, Apple Calendar, etc.)</p>
        <p>3. Importez le fichier calendrier téléchargé (Fichier > Importer)</p>
      </div>
    </div>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: ReservationEmailRequest = await req.json();
    console.log(`[${Date.now()}] Received request data:`, JSON.stringify(requestData));

    const requestId = requestData.requestId || 
      `${requestData.childName}-${requestData.reservationType}-${requestData.period}-${Date.now()}`;

    console.log(`[${Date.now()}] Request ID:`, requestId);

    if (processedRequests.has(requestId)) {
      console.log(`[${Date.now()}] Duplicate request detected. Skipping email send:`, requestId);
      return new Response(
        JSON.stringify({ success: true, message: "Duplicate request, email not sent" }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    processedRequests.set(requestId, Date.now());
    console.log(`[${Date.now()}] Request marked as processed:`, requestId);
    console.log(`[${Date.now()}] Cache size:`, processedRequests.size);

    if (requestData.reservationType === "holiday" || requestData.reservationType === "wednesday") {
      console.log(`[${Date.now()}] Processing a ${requestData.reservationType} reservation`);
      
      if (requestData.childName && requestData.dates) {
        console.log(`[${Date.now()}] Processing direct reservation for ${requestData.childName}`);
        
        const reservationType = requestData.reservationType === "holiday" ? "vacances" : "mercredi";
        
        let tableRows = '';
        if (requestData.dates && requestData.dates.length > 0) {
          requestData.dates.forEach((date, index) => {
            const earlyDropoff = requestData.earlyDropoff && requestData.earlyDropoff[index] ? '✓' : '';
            const withoutMeal = requestData.withoutMeal && requestData.withoutMeal[index] ? '✓' : '';
            
            tableRows += `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${date}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${earlyDropoff}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${withoutMeal}</td>
              </tr>
            `;
          });
        }
        
        const tableHtml = `
          <table style="border-collapse: collapse; width: 100%; margin-top: 10px;">
            <thead>
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Date</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Arrivée avant 8h30</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Sans Repas</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        `;
        
        const emailHtml = `
          <h1>Nouvelle réservation de ${reservationType}</h1>
          ${requestData.childName ? `<p><strong>Enfant:</strong> ${requestData.childName}</p>` : ''}
          ${requestData.childClass ? `<p><strong>Classe:</strong> ${requestData.childClass}</p>` : ''}
          ${requestData.period ? `<p><strong>Période:</strong> ${requestData.period}</p>` : ''}
          <p><strong>Dates réservées:</strong></p>
          ${tableHtml}
          <p><strong>ID de requête:</strong> ${requestId}</p>
        `;
        
        const emailResponse = await resend.emails.send({
          from: "Réservation <onboarding@resend.dev>",
          to: ["accueil@e2rives.fr"],
          subject: `Nouvelle réservation - ${requestData.reservationType === "holiday" ? "Vacances" : "Mercredi"} - ${requestData.childName}`,
          html: emailHtml,
        });

        console.log(`[${Date.now()}] Email sent successfully:`, emailResponse);
        
        return new Response(JSON.stringify({ success: true, data: emailResponse }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      }
      
      // Nous avons supprimé la récupération du profil utilisateur pour les autres cas
      // et utilisé les données fournies directement via la requête

      let tableRows = '';
      if (requestData.dates && requestData.dates.length > 0) {
        requestData.dates.forEach((date, index) => {
          const earlyDropoff = requestData.earlyDropoff && requestData.earlyDropoff[index] ? '✓' : '';
          const withoutMeal = requestData.withoutMeal && requestData.withoutMeal[index] ? '✓' : '';
          
          tableRows += `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${date}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${earlyDropoff}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${withoutMeal}</td>
            </tr>
          `;
        });
      }
      
      const tableHtml = `
        <table style="border-collapse: collapse; width: 100%; margin-top: 10px;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Date</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Arrivée avant 8h30</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Sans Repas</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      `;

      const emailHtml = `
        <h1>Nouvelle réservation de ${requestData.reservationType === "holiday" ? "vacances" : "mercredi"}</h1>
        <p><strong>ID Utilisateur:</strong> ${requestData.userId}</p>
        ${requestData.childName ? `<p><strong>Enfant:</strong> ${requestData.childName}</p>` : ''}
        ${requestData.childClass ? `<p><strong>Classe:</strong> ${requestData.childClass}</p>` : ''}
        ${requestData.period ? `<p><strong>Période:</strong> ${requestData.period}</p>` : ''}
        <p><strong>Dates réservées:</strong></p>
        ${tableHtml}
        <p><strong>ID de requête:</strong> ${requestId}</p>
      `;
      
      const emailResponse = await resend.emails.send({
        from: "Réservation <onboarding@resend.dev>",
        to: ["accueil@e2rives.fr"],
        subject: `Nouvelle réservation - ${requestData.reservationType === "holiday" ? "Vacances" : "Mercredi"}`,
        html: emailHtml,
      });

      console.log("Email sent successfully:", emailResponse);
      
      return new Response(JSON.stringify({ success: true, data: emailResponse }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } 
    else if (requestData.rdvId) {
      console.log("Processing an RDV reservation");
      
      const { data: rdvData, error: rdvError } = await supabase
        .from("rdv")
        .select("*")
        .eq("id", requestData.rdvId)
        .single();

      if (rdvError) {
        console.error("Error fetching rdv:", rdvError);
        throw new Error("Error fetching rdv details");
      }

      // Récupérer les données du profil utilisateur à partir de la table profiles
      let userFullName = "Utilisateur";
      let userEmail = null;
      
      if (requestData.userId) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", requestData.userId)
          .single();

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          // Continue without profile data
        } else if (profileData) {
          userFullName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || "Utilisateur";
          console.log("Retrieved user profile:", profileData);
        }
      }

      const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("fr-FR", { 
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      };

      const formatTime = (timeStr: string) => {
        return timeStr.substring(0, 5);
      };
      
      // Créer des objets Date pour le début et la fin du rendez-vous
      const appointmentDate = new Date(rdvData.date);
      const startTime = rdvData.heure_debut.split(':');
      const endTime = rdvData.heure_fin.split(':');
      
      const startDateTime = new Date(appointmentDate);
      startDateTime.setHours(parseInt(startTime[0], 10), parseInt(startTime[1], 10), 0);
      
      const endDateTime = new Date(appointmentDate);
      endDateTime.setHours(parseInt(endTime[0], 10), parseInt(endTime[1], 10), 0);
      
      // Générer le contenu iCalendar pour le rendez-vous
      const eventSummary = `Rendez-vous E2Rives`;
      const eventDescription = `Motifs: ${requestData.motifs?.join(", ") || "Non spécifié"}`;
      const eventLocation = "Centre Entre 2 Rives";
      
      const icsContent = generateICalendarString({
        summary: eventSummary,
        description: eventDescription,
        location: eventLocation,
        start: startDateTime,
        end: endDateTime,
        uid: `rdv-${rdvData.id}`
      });
      
      // Générer les boutons de calendrier
      const calendarButtons = generateCalendarButtons(
        icsContent,
        eventSummary,
        startDateTime,
        endDateTime,
        eventLocation,
        eventDescription
      );

      const emailResponse = await resend.emails.send({
        from: "Réservation <onboarding@resend.dev>",
        to: ["accueil@e2rives.fr"],
        subject: `Nouvelle réservation de rendez-vous - ${userFullName}`,
        html: `
          <h1>Nouvelle réservation de rendez-vous</h1>
          <p><strong>Utilisateur:</strong> ${userFullName}</p>
          <p><strong>Date:</strong> ${formatDate(rdvData.date)}</p>
          <p><strong>Horaire:</strong> ${formatTime(rdvData.heure_debut)} - ${formatTime(rdvData.heure_fin)}</p>
          <p><strong>Motifs:</strong> ${requestData.motifs?.join(", ") || "Non spécifié"}</p>
          ${calendarButtons}
          <p><strong>ID de requête:</strong> ${requestId}</p>
        `,
        attachments: [
          {
            filename: 'rendez-vous.ics',
            content: icsContent
          }
        ]
      });

      console.log("Email sent successfully:", emailResponse);
      
      return new Response(JSON.stringify({ success: true, data: emailResponse }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } else {
      console.error(`[${Date.now()}] Invalid request data, missing reservationType or rdvId:`, requestData);
      throw new Error("Invalid request: Either reservationType or rdvId is required");
    }
  } catch (error: any) {
    console.error(`[${Date.now()}] Error in send-reservation-email function:`, error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
