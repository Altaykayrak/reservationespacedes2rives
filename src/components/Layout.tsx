
import React, { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";

export const Layout = () => {
  const location = useLocation();
  const lastLocationRef = useRef(location.pathname + location.search);
  
  // Surveiller les changements de location pour détecter les reloads non désirés
  useEffect(() => {
    const currentLocation = location.pathname + location.search;
    
    console.log(`[Layout] Location changed: ${lastLocationRef.current} -> ${currentLocation}`);
    
    // Mettre à jour la référence
    lastLocationRef.current = currentLocation;
  }, [location]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50" id="app-layout">
      <Outlet />
    </div>
  );
};
