
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReservationEmailData {
  childName: string;
  dates: string[];
  type: 'wednesday' | 'holiday';
  withoutMeal: boolean[];
  earlyDropoff: boolean[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { childName, dates, type, withoutMeal, earlyDropoff }: ReservationEmailData = await req.json();

    // Créer le contenu HTML pour les dates et options
    const datesHtml = dates.map((date, index) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${date}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${withoutMeal[index] ? 'Oui' : 'Non'}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${earlyDropoff[index] ? 'Oui' : 'Non'}</td>
      </tr>
    `).join('');

    const reservationType = type === 'wednesday' ? 'mercredis' : 'vacances';

    const emailResponse = await resend.emails.send({
      from: "E2R <onboarding@resend.dev>",
      to: ["accueil@e2rives.fr"],
      subject: `Nouvelle réservation ${reservationType} - ${childName}`,
      html: `
        <h1>Nouvelle réservation pour ${childName}</h1>
        <p>Une nouvelle réservation a été effectuée pour les ${reservationType}.</p>
        
        <h2>Détails de la réservation :</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 8px; border: 1px solid #ddd;">Date</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Sans repas</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Accueil avant 8h30</th>
            </tr>
          </thead>
          <tbody>
            ${datesHtml}
          </tbody>
        </table>
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
  } catch (error) {
    console.error("Error sending email:", error);
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
