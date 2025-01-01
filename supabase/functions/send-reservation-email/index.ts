import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  childName: string;
  reservationDate: string;
  reservationNumber: string;
  parentEmail: string;
  withoutMeal?: boolean;
  earlyDropoff?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      throw new Error("RESEND_API_KEY is not configured");
    }

    const emailRequest: EmailRequest = await req.json();
    console.log("Received email request:", emailRequest);

    const emailHtml = `
      <h2>Confirmation de réservation</h2>
      <p>Votre réservation pour ${emailRequest.childName} a été confirmée.</p>
      <p><strong>Détails de la réservation :</strong></p>
      <ul>
        <li>Date : ${emailRequest.reservationDate}</li>
        <li>Numéro de réservation : ${emailRequest.reservationNumber}</li>
        ${emailRequest.withoutMeal ? '<li>Sans repas</li>' : '<li>Avec repas</li>'}
        ${emailRequest.earlyDropoff ? '<li>Accueil avant 8h30</li>' : ''}
      </ul>
    `;

    console.log("Sending email to:", emailRequest.parentEmail);
    
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

    const responseData = await res.json();
    console.log("Resend API response:", responseData);

    if (!res.ok) {
      throw new Error(`Resend API error: ${JSON.stringify(responseData)}`);
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in send-reservation-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error instanceof Error ? error.stack : undefined 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);