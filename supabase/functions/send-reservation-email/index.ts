
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReservationEmailData {
  childName: string;
  dates: Array<{
    date: string;
    withoutMeal: boolean;
    earlyDropoff: boolean;
  }>;
  type: 'wednesday';
  parentEmail: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ReservationEmailData = await req.json();
    console.log("Données reçues pour l'email:", data);

    const emailContent = `
      <h1>Confirmation de réservation pour ${data.childName}</h1>
      <p>Voici le récapitulatif de vos réservations :</p>
      <ul>
        ${data.dates.map(date => `
          <li>
            ${date.date}
            ${date.withoutMeal ? ' (Sans repas)' : ''}
            ${date.earlyDropoff ? ' (Accueil avant 8h30)' : ''}
          </li>
        `).join('')}
      </ul>
      <p>Merci de votre confiance !</p>
    `;

    const { data: emailResponse, error: emailError } = await resend.emails.send({
      from: "contact@resend.dev",
      to: data.parentEmail,
      subject: `Confirmation de réservation - ${data.childName}`,
      html: emailContent,
    });

    if (emailError) {
      console.error("Erreur lors de l'envoi de l'email:", emailError);
      throw emailError;
    }

    console.log("Email envoyé avec succès:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Erreur dans la fonction send-reservation-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
