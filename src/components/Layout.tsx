
import React from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";

export const Layout = () => {
  return (
    <div className="min-h-screen">
      <ScrollRestoration getKey={(location) => {
        // Utiliser le chemin de base pour la restauration du défilement
        // sans inclure les paramètres de requête
        return location.pathname;
      }} />
      <Outlet />
    </div>
  );
};
