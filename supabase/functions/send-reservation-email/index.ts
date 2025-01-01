import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  childName: string;
  reservationDate: string;
  withoutMeal: boolean;
  earlyDropoff: boolean;
  reservationNumber: string;
  parentEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailRequest: EmailRequest = await req.json();
    
    const emailHtml = `
      <h2>Confirmation de réservation</h2>
      <p>Votre réservation pour ${emailRequest.childName} a été confirmée.</p>
      <p><strong>Détails de la réservation :</strong></p>
      <ul>
        <li>Date : ${emailRequest.reservationDate}</li>
        <li>Numéro de réservation : ${emailRequest.reservationNumber}</li>
        <li>Sans repas : ${emailRequest.withoutMeal ? 'Oui' : 'Non'}</li>
        <li>Accueil avant 8h30 : ${emailRequest.earlyDropoff ? 'Oui' : 'Non'}</li>
      </ul>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Réservations <onboarding@resend.dev>",
        to: [emailRequest.parentEmail],
        subject: `Confirmation de réservation - ${emailRequest.childName}`,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);