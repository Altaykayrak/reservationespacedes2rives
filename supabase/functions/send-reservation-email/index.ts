
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { ReservationEmailRequest } from "./types.ts";
import { corsHeaders, isRequestProcessed, markRequestAsProcessed, setupCacheCleanup } from "./utils.ts";
import { processHolidayReservation } from "./holiday.ts";
import { processRdvReservation } from "./rdv.ts";

const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
const resend = new Resend(resendApiKey);

// Setup cache cleanup interval
setupCacheCleanup();

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: ReservationEmailRequest = await req.json();
    console.log(`[${Date.now()}] Received request data:`, JSON.stringify(requestData));

    const requestId = requestData.requestId || 
      `${requestData.childName || ''}-${requestData.reservationType || ''}-${requestData.period || ''}-${Date.now()}`;

    console.log(`[${Date.now()}] Request ID:`, requestId);

    if (isRequestProcessed(requestId)) {
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

    markRequestAsProcessed(requestId);
    console.log(`[${Date.now()}] Request marked as processed:`, requestId);

    // Process based on reservation type
    if (requestData.reservationType === "holiday" || requestData.reservationType === "wednesday") {
      return await processHolidayReservation(requestData, resend, requestId);
    } 
    else if (requestData.rdvId) {
      return await processRdvReservation(requestData, resend, requestId);
    } 
    else {
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
