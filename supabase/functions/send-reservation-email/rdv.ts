
import { Resend } from "npm:resend@2.0.0";
import { ReservationEmailRequest } from "./types.ts";
import { corsHeaders, generateICalendarString, generateCalendarButtons, initSupabase } from "./utils.ts";

export async function processRdvReservation(
  requestData: ReservationEmailRequest,
  resend: Resend,
  requestId: string
): Promise<Response> {
  console.log("Processing an RDV reservation");
  
  const supabase = initSupabase();
  
  const { data: rdvData, error: rdvError } = await supabase
    .from("rdv")
    .select("*")
    .eq("id", requestData.rdvId)
    .single();

  if (rdvError) {
    console.error("Error fetching rdv:", rdvError);
    throw new Error("Error fetching rdv details");
  }

  // Retrieve user information either from provided request data or from the database
  let userFullName = requestData.userName || "Utilisateur";
  let userEmail = requestData.userEmail;
  
  if (requestData.userId && (!userFullName || userFullName === "Utilisateur" || !userEmail)) {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", requestData.userId)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
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
  
  // Create Date objects for the appointment start and end times
  const appointmentDate = new Date(rdvData.date);
  const startTime = rdvData.heure_debut.split(':');
  const endTime = rdvData.heure_fin.split(':');
  
  const startDateTime = new Date(appointmentDate);
  startDateTime.setHours(parseInt(startTime[0], 10), parseInt(startTime[1], 10), 0);
  
  const endDateTime = new Date(appointmentDate);
  endDateTime.setHours(parseInt(endTime[0], 10), parseInt(endTime[1], 10), 0);
  
  // Generate the iCalendar content for the appointment
  const eventSummary = `Rendez-vous E2Rives`;
  const eventDescription = `Motifs: ${requestData.motifs?.join(", ") || "Non spécifié"}`;
  const eventLocation = "Centre Entre 2 Rives";
  
  // Set the organizer (the user) and the attendee (the center)
  const organizer = userEmail ? {
    email: userEmail,
    name: userFullName
  } : undefined;
  
  const attendee = {
    email: "accueil@e2rives.fr",
    name: "Centre Entre 2 Rives"
  };
  
  const icsContent = generateICalendarString({
    summary: eventSummary,
    description: eventDescription,
    location: eventLocation,
    start: startDateTime,
    end: endDateTime,
    uid: `rdv-${rdvData.id}`,
    organizer,
    attendee
  });
  
  // Generate the calendar buttons
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
}
