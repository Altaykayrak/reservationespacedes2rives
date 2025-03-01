
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReservationEmailRequest {
  rdvId: string;
  motifs: string[];
  userId: string;
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
    const { rdvId, motifs, userId }: ReservationEmailRequest = await req.json();

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
        <p><strong>Motifs:</strong> ${motifs.join(", ")}</p>
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

serve(handler);
