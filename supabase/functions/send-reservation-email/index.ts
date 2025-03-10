
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
  childClass?: string;  // Ajout de la classe scolaire
  dates?: string[];
  period?: string;  // Période de vacances
  withoutMeal?: boolean[];
  earlyDropoff?: boolean[];
  requestId?: string;
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
      
      if (!requestData.userId) {
        throw new Error("User ID is required for reservation emails with profile information");
      }
      
      const { data: profileData, error: profileError } = await supabase
        .from("profiles_with_emails")
        .select("*")
        .eq("id", requestData.userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw new Error("Error fetching user profile");
      }

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
        <p><strong>Parent:</strong> ${profileData.first_name} ${profileData.last_name}</p>
        <p><strong>Email:</strong> ${profileData.email}</p>
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
        subject: `Nouvelle réservation - ${requestData.reservationType === "holiday" ? "Vacances" : "Mercredi"} - ${profileData.first_name} ${profileData.last_name}`,
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

      if (!requestData.userId) {
        throw new Error("User ID is required for RDV emails");
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles_with_emails")
        .select("*")
        .eq("id", requestData.userId)
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
          <p><strong>Motifs:</strong> ${requestData.motifs?.join(", ") || "Non spécifié"}</p>
          <p><strong>ID de requête:</strong> ${requestId}</p>
        `,
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
