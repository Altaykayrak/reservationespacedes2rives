
import { Resend } from "npm:resend@2.0.0";
import { ReservationEmailRequest } from "./types.ts";
import { corsHeaders } from "./utils.ts";

export async function processHolidayReservation(
  requestData: ReservationEmailRequest,
  resend: Resend,
  requestId: string
): Promise<Response> {
  console.log(`[${Date.now()}] Processing a ${requestData.reservationType} reservation`);
  
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

  const reservationType = requestData.reservationType === "holiday" ? "vacances" : "mercredi";
  
  const emailHtml = `
    <h1>Nouvelle réservation de ${reservationType}</h1>
    ${requestData.userId ? `<p><strong>ID Utilisateur:</strong> ${requestData.userId}</p>` : ''}
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
    subject: `Nouvelle réservation - ${requestData.reservationType === "holiday" ? "Vacances" : "Mercredi"}${requestData.childName ? " - " + requestData.childName : ""}`,
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
