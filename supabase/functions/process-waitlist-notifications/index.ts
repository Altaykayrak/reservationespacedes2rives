import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY") || "");

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { data: notifications, error } = await supabase
      .from("waitlist_notifications")
      .select("id, waitlist_id, child_id, date, school_class_category_id")
      .is("processed_at", null)
      .limit(50);

    if (error) throw error;
    if (!notifications || notifications.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let processed = 0;
    for (const n of notifications) {
      const [{ data: child }, { data: cat }] = await Promise.all([
        supabase.from("children").select("first_name, last_name").eq("id", n.child_id).maybeSingle(),
        supabase.from("school_class_categories").select("name, category").eq("id", n.school_class_category_id).maybeSingle(),
      ]);

      const childName = child ? `${child.first_name} ${child.last_name}` : "Enfant inconnu";
      const catName = cat?.category || cat?.name || "—";
      const dateStr = new Date(n.date).toLocaleDateString("fr-FR");

      const html = `
        <h2>Place disponible — Liste d'attente</h2>
        <p>Une place s'est libérée le <strong>${dateStr}</strong> en <strong>${catName}</strong>.</p>
        <p>L'enfant <strong>${childName}</strong> est le premier sur liste d'attente pour ce jour et peut être inscrit.</p>
        <p><em>Ses autres jours en liste d'attente ne sont pas affectés.</em></p>
      `;

      try {
        await resend.emails.send({
          from: "Réservation <onboarding@resend.dev>",
          to: ["accueil@e2rives.fr"],
          subject: `Place disponible — ${childName} — ${dateStr}`,
          html,
        });
        await supabase
          .from("waitlist_notifications")
          .update({ processed_at: new Date().toISOString() })
          .eq("id", n.id);
        processed++;
      } catch (e) {
        console.error("Email send failed for notification", n.id, e);
      }
    }

    return new Response(JSON.stringify({ processed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});