
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0"

const resend = new Resend(Deno.env.get('resendapikey'));

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
  type: 'wednesday' | 'holiday';
  parentEmail: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { childName, dates, type, parentEmail }: ReservationEmailData = await req.json();

    console.log('Sending confirmation email for:', {
      childName,
      dates,
      type,
      parentEmail
    });

    const datesFormatted = dates.map(d => {
      const options = [];
      if (d.withoutMeal) options.push('Sans repas');
      if (d.earlyDropoff) options.push('Accueil avant 8h30');
      
      return `
        - ${d.date}${options.length > 0 ? ` (${options.join(', ')})` : ''}
      `;
    }).join('\n');

    const emailResponse = await resend.emails.send({
      from: 'Centre de Loisirs <contact@centreloisirs.fr>',
      to: parentEmail,
      subject: `Confirmation de réservation - ${type === 'wednesday' ? 'Mercredi' : 'Vacances'}`,
      html: `
        <h1>Confirmation de votre réservation</h1>
        <p>Bonjour,</p>
        <p>Nous confirmons la réservation pour ${childName} aux dates suivantes :</p>
        <pre>${datesFormatted}</pre>
        <p>Nous vous remercions de votre confiance.</p>
        <p>L'équipe du Centre de Loisirs</p>
      `,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
