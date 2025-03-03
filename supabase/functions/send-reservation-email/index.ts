
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
  reservationDetails?: {
    childName?: string;
    dates?: string[];
    period?: string;
  };
}

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";

const resend = new Resend(resendApiKey);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: ReservationEmailRequest = await req.json();
    console.log("Received request data:", JSON.stringify(requestData));

    // Check if we're dealing with an RDV or a reservation
    if (requestData.reservationType === "holiday" || requestData.reservationType === "wednesday") {
      // Handle reservation email for holiday or wednesday
      if (!requestData.userId) {
        throw new Error("User ID is required for reservation emails");
      }
      
      if (!requestData.reservationDetails) {
        throw new Error("Reservation details are required");
      }

      // Fetch the user profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles_with_emails")
        .select("*")
        .eq("id", requestData.userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw new Error("Error fetching user profile");
      }

      // Send reservation confirmation email
      const emailResponse = await resend.emails.send({
        from: "Réservation <onboarding@resend.dev>",
        to: ["accueil@e2rives.fr"],
        subject: `Nouvelle réservation - ${requestData.reservationType === "holiday" ? "Vacances" : "Mercredi"} - ${profileData.first_name} ${profileData.last_name}`,
        html: generateReservationEmailHtml(requestData, profileData),
      });

      console.log("Email sent successfully:", emailResponse);
      
      return new Response(JSON.stringify(emailResponse), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } else {
      // Legacy RDV email handling
      const { rdvId, motifs, userId } = requestData;
      
      if (!rdvId) {
        throw new Error("RDV ID is required");
      }
      
      if (!userId) {
        throw new Error("User ID is required");
      }

      // Fetch the rdv details
      const { data: rdvData, error: rdvError } = await supabase
        .from("rdv")
        .select("*")
        .eq("id", rdvId)
        .single();

      if (rdvError) {
        console.error("Error fetching rdv:", rdvError);
        throw new Error("Error fetching rdv details");
      }

      // Fetch the user profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles_with_emails")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw new Error("Error fetching user profile");
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

      // Send email
      const emailResponse = await resend.emails.send({
        from: "Réservation <onboarding@resend.dev>",
        to: ["accueil@e2rives.fr"],
        subject: `Nouvelle réservation de rendez-vous - ${profileData.first_name} ${profileData.last_name}`,
        html: `
          <h1>Nouvelle réservation de rendez-vous</h1>
          <p><strong>Nom et prénom:</strong> ${profileData.first_name} ${profileData.last_name}</p>
          <p><strong>Email:</strong> ${profileData.email}</p>
          <p><strong>Date:</strong> ${formatDate(rdvData.date)}</p>
          <p><strong>Horaire:</strong> ${formatTime(rdvData.heure_debut)} - ${formatTime(rdvData.heure_fin)}</p>
          <p><strong>Motifs:</strong> ${motifs?.join(", ") || "Non spécifié"}</p>
        `,
      });

      console.log("Email sent successfully:", emailResponse);

      return new Response(JSON.stringify(emailResponse), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }
  } catch (error: any) {
    console.error("Error in send-reservation-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

// Helper function to generate HTML for reservation emails
function generateReservationEmailHtml(requestData: ReservationEmailRequest, profileData: any): string {
  const reservationType = requestData.reservationType === "holiday" ? "vacances" : "mercredi";
  const { childName, dates, period } = requestData.reservationDetails || {};
  
  return `
    <h1>Nouvelle réservation de ${reservationType}</h1>
    <p><strong>Parent:</strong> ${profileData.first_name} ${profileData.last_name}</p>
    <p><strong>Email:</strong> ${profileData.email}</p>
    ${childName ? `<p><strong>Enfant:</strong> ${childName}</p>` : ''}
    ${period ? `<p><strong>Période:</strong> ${period}</p>` : ''}
    ${dates && dates.length > 0 ? 
      `<p><strong>Dates réservées:</strong></p>
      <ul>
        ${dates.map(date => `<li>${date}</li>`).join('')}
      </ul>` : 
      ''}
  `;
}

serve(handler);

