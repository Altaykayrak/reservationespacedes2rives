
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Animation CSS qui sera injectée une seule fois dans le document
export function injectAnimationStyles() {
  // Vérifier si les styles existent déjà pour éviter les doublons
  if (!document.getElementById('lovable-animation-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'lovable-animation-styles';
    styleElement.textContent = `
      @keyframes clickPulse {
        0% { transform: scale(1); }
        50% { transform: scale(0.98); }
        100% { transform: scale(1); }
      }
      .clickable-item:active {
        animation: clickPulse 0.2s ease-in-out;
      }
    `;
    document.head.appendChild(styleElement);
  }
}
