
import React from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";

export const Layout = () => {
  const location = useLocation();
  
  // Log chaque changement de location
  React.useEffect(() => {
    console.log("[Layout] Navigation vers", location.pathname, "avec URL params:", location.search);
  }, [location]);

  return (
    <div className="min-h-screen">
      <ScrollRestoration />
      <Outlet />
    </div>
  );
};
