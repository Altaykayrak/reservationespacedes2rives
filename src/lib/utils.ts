
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalise une date en supprimant les heures, minutes, secondes et millisecondes
 * pour permettre des comparaisons cohérentes entre dates
 */
export function normalizeDate(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

/**
 * Compare deux dates en ignorant les heures, minutes, secondes et millisecondes
 * Retourne true si les dates sont identiques (même jour)
 */
export function areDatesEqual(date1: Date, date2: Date): boolean {
  if (!(date1 instanceof Date) || !(date2 instanceof Date)) return false;
  
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  
  return d1.getTime() === d2.getTime();
}
