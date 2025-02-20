
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { childName, dates, parentEmail } = await req.json();
    console.log("Données reçues pour l'email:", { childName, dates, parentEmail });

    const emailContent = `
      <h1>Confirmation de réservation pour ${childName}</h1>
      <p>Voici le récapitulatif de vos réservations :</p>
      <ul>
        ${dates.map(date => `
          <li>
            ${date.date}
            ${date.withoutMeal ? ' (Sans repas)' : ''}
            ${date.earlyDropoff ? ' (Accueil avant 8h30)' : ''}
          </li>
        `).join('')}
      </ul>
      <p>Merci de votre confiance !</p>
    `;

    console.log("Tentative d'envoi d'email à:", parentEmail);
    console.log("Contenu de l'email:", emailContent);

    // Pendant la période de test, on envoie toujours à l'adresse de test
    const testEmail = "altaykayrak@gmail.com";
    console.log("En mode test - envoi à:", testEmail);

    const emailResult = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: testEmail, // Utilisation de l'adresse de test
      subject: `[TEST] Confirmation de réservation - ${childName} (pour ${parentEmail})`,
      html: `
        <p><strong>Ceci est un email de test</strong></p>
        <p>Dans la version finale, cet email sera envoyé à : ${parentEmail}</p>
        ${emailContent}
      `,
    });

    console.log("Résultat de l'envoi d'email:", emailResult);

    return new Response(
      JSON.stringify({ success: true, data: emailResult }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
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
