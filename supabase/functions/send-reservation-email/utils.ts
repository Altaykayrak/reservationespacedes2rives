
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";
import { EventDetails } from "./types.ts";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Cache system for deduplication
const processedRequests = new Map<string, number>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes TTL for cache entries

// Function to clean up the cache periodically
export function setupCacheCleanup(): void {
  setInterval(() => {
    const now = Date.now();
    for (const [key, timestamp] of processedRequests.entries()) {
      if (now - timestamp > CACHE_TTL) {
        processedRequests.delete(key);
      }
    }
  }, 60 * 1000); // Every minute
}

// Function to check if a request has been processed
export function isRequestProcessed(requestId: string): boolean {
  return processedRequests.has(requestId);
}

// Function to mark a request as processed
export function markRequestAsProcessed(requestId: string): void {
  processedRequests.set(requestId, Date.now());
}

// Initialize Supabase client
export function initSupabase() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Function to generate iCalendar format string for calendar events
export function generateICalendarString(eventDetails: EventDetails): string {
  // Format date to iCalendar format: YYYYMMDDTHHMMSSZ (UTC)
  const formatDateToICS = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/g, '');
  };
  
  const now = new Date();
  
  // Format dates in UTC to avoid timezone issues
  const startDate = formatDateToICS(eventDetails.start);
  const endDate = formatDateToICS(eventDetails.end);
  const createdDate = formatDateToICS(now);
  
  // Calendar fields
  const calendarLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//E2Rives//Reservation System//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    `X-WR-CALNAME:Rendez-vous E2Rives`,
  ];

  // Add event
  calendarLines.push(
    'BEGIN:VEVENT',
    `DTSTAMP:${createdDate}`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `UID:${eventDetails.uid}@e2rives.fr`,
    `CREATED:${createdDate}`,
    `DESCRIPTION:${eventDetails.description.replace(/\n/g, '\\n')}`,
    `LAST-MODIFIED:${createdDate}`,
    `LOCATION:${eventDetails.location}`,
    `SEQUENCE:0`,
    `STATUS:CONFIRMED`,
    `SUMMARY:${eventDetails.summary}`,
    `TRANSP:OPAQUE`,
  );

  // Add organizer (the user as the organizer)
  if (eventDetails.organizer) {
    calendarLines.push(
      `ORGANIZER;CN=${eventDetails.organizer.name}:mailto:${eventDetails.organizer.email}`
    );
  }

  // Add attendee (Centre E2Rives as the attendee)
  if (eventDetails.attendee) {
    calendarLines.push(
      `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=TRUE;CN=${eventDetails.attendee.name}:mailto:${eventDetails.attendee.email}`
    );
  }

  // Add alarm
  calendarLines.push(
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Rappel du rendez-vous',
    'TRIGGER:-PT15M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  );

  return calendarLines.join('\r\n');
}

// Function to create calendar buttons for email
export function generateCalendarButtons(
  icsContent: string, 
  eventSummary: string, 
  startDateTime: Date, 
  endDateTime: Date, 
  location: string, 
  description: string
): string {
  // Créer l'objet du lien Google Calendar
  const googleStartTime = startDateTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/g, '');
  const googleEndTime = endDateTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/g, '');
  
  // Encodage URL pour Google Calendar
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventSummary)}&dates=${googleStartTime}/${googleEndTime}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
  
  // Au lieu d'utiliser data:URI qui peut causer des problèmes, on explique comment télécharger
  // et importer le fichier .ics manuellement
  return `
    <div style="margin-top: 20px; margin-bottom: 20px; text-align: center;">
      <p style="margin-bottom: 10px; font-weight: bold;">Ajouter à votre calendrier :</p>
      
      <a href="${googleCalendarUrl}" target="_blank" style="background-color: #4285F4; color: white; padding: 10px 15px; text-align: center; text-decoration: none; display: inline-block; font-size: 14px; margin: 4px 2px; cursor: pointer; border-radius: 4px;">
        Google Calendar
      </a>
      
      <p style="margin-top: 15px; margin-bottom: 5px;">Le fichier calendrier est joint à cet email.</p>
      <p style="font-size: 13px; color: #666;">Ouvrez le fichier .ics attaché pour l'ajouter à Outlook, Apple Calendar ou autre application de calendrier.</p>
    </div>
  `;
}
