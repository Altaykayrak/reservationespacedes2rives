
import React from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";

export const Layout = () => {
  return (
    <div className="min-h-screen">
      <ScrollRestoration 
        getKey={(location) => {
          // Utiliser uniquement le chemin de base pour la restauration du défilement,
          // en ignorant les paramètres de requête pour éviter des problèmes de rechargement
          return location.pathname;
        }} 
      />
      <Outlet />
    </div>
  );
};
