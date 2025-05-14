import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(input: Date | string): string {
  const date = new Date(input)
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`
}

export function injectAnimationStyles() {
  // Vérifier si les styles d'animation sont déjà injectés
  if (document.getElementById('lovable-animation-styles')) return;

  // Créer un élément style
  const styleEl = document.createElement('style');
  styleEl.id = 'lovable-animation-styles';
  
  // Définir les styles d'animation
  styleEl.innerHTML = `
    /* Animations de base */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    @keyframes ripple {
      0% { transform: scale(0); opacity: 0.4; }
      100% { transform: scale(1.5); opacity: 0; }
    }
    
    /* Classes d'animation réutilisables */
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    /* Styles interactifs pour les éléments de date */
    [role="button"]:not([aria-disabled="true"]) {
      position: relative;
      overflow: hidden;
    }
    [role="button"]:not([aria-disabled="true"]):after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 5px;
      height: 5px;
      background: rgba(59, 130, 246, 0.3);
      opacity: 0;
      border-radius: 100%;
      transform: scale(1, 1) translate(-50%, -50%);
      transform-origin: 50% 50%;
    }
    [role="button"]:not([aria-disabled="true"]):focus:not(:active)::after {
      animation: ripple 0.6s ease-out;
    }
    
    /* Amélioration visuelle de l'état sélectionné */
    [data-state="selected"] {
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }
  `;
  
  // Ajouter les styles au head
  document.head.appendChild(styleEl);
}

export function truncate(text: string, length: number) {
  if (text.length <= length) {
    return text
  }
  return text.substring(0, length) + "..."
}
