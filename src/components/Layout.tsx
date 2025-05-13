
import React, { useEffect } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import { toast } from "sonner";

export const Layout = () => {
  const location = useLocation();
  
  // Log chaque changement de location et intercepter les événements qui pourraient causer des rechargements
  useEffect(() => {
    console.log("[Layout] Navigation vers", location.pathname, "avec URL params:", location.search);
    
    // Liste des chemins où le beforeunload est nécessaire (pages de réservation uniquement)
    const pathsRequiringWarning = [
      '/holiday-reservations',
      '/teenholiday-reservations'
    ];
    
    // Vérifier si le chemin actuel nécessite une confirmation avant de quitter
    const shouldShowWarning = pathsRequiringWarning.some(path => 
      location.pathname.startsWith(path)
    );
    
    // Fonction pour intercepter et prévenir les soumissions de formulaire
    const preventFormSubmission = (e: SubmitEvent) => {
      console.log("[Layout] Interception d'une soumission de formulaire");
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    
    // Fonction pour empêcher les rechargements de page uniquement sur les pages spécifiques
    const preventUnload = (e: BeforeUnloadEvent) => {
      if (shouldShowWarning) {
        console.log("[Layout] Tentative de quitter la page, prévention");
        e.preventDefault();
        return (e.returnValue = '');
      }
    };
    
    // Fonction pour empêcher les clics qui déclenchent des soumissions
    const preventDefaultClicks = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isFormElement = target.closest('form');
      const isButton = target.tagName === 'BUTTON' || target.closest('button');
      
      if (isFormElement && isButton && !target.hasAttribute('data-safe-click')) {
        console.log("[Layout] Interception d'un clic potentiellement dangereux");
        const buttonType = (target as HTMLButtonElement).type || 
                          ((target.closest('button') as HTMLButtonElement)?.type);
        
        if (buttonType !== 'button') {
          console.log("[Layout] Bouton sans type='button' explicite intercepté");
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };
    
    // N'ajouter les écouteurs que si nous sommes sur une page qui les nécessite
    if (shouldShowWarning) {
      document.addEventListener('submit', preventFormSubmission, true);
      window.addEventListener('beforeunload', preventUnload);
      document.addEventListener('click', preventDefaultClicks, true);
      
      // Vérifier tous les formulaires existants
      const forms = document.querySelectorAll('form');
      if (forms.length > 0) {
        console.log(`[Layout] ${forms.length} formulaires trouvés, ajout de préventifs`);
        forms.forEach((form) => {
          form.setAttribute('data-controlled', 'true');
          form.addEventListener('submit', preventFormSubmission);
        });
      }
    }
    
    return () => {
      if (shouldShowWarning) {
        document.removeEventListener('submit', preventFormSubmission, true);
        window.removeEventListener('beforeunload', preventUnload);
        document.removeEventListener('click', preventDefaultClicks, true);
      }
    };
  }, [location]);

  return (
    <div className="min-h-screen">
      <ScrollRestoration />
      <Outlet />
    </div>
  );
};
