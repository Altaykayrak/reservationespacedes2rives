
import React, { useEffect } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";

export const Layout = () => {
  const location = useLocation();
  
  // Log chaque changement de location (important pour débogage)
  useEffect(() => {
    console.log("[Layout] Navigation vers", location.pathname, "avec URL params:", location.search);
    
    // Vérifier si le document contient des formulaires non contrôlés
    const forms = document.querySelectorAll('form');
    if (forms.length > 0) {
      forms.forEach((form, index) => {
        // Empêcher toute soumission de formulaire non intentionnelle
        if (!form.hasAttribute('data-controlled')) {
          console.log(`[Layout] Formulaire ${index} trouvé sans contrôle explicite, ajout d'un préventif`);
          form.setAttribute('data-controlled', 'true');
          form.addEventListener('submit', (e) => {
            console.log(`[Layout] Soumission de formulaire bloquée:`, e.target);
            e.preventDefault();
          });
        }
      });
    }
  }, [location]);

  return (
    <div className="min-h-screen">
      <ScrollRestoration />
      <Outlet />
    </div>
  );
};
