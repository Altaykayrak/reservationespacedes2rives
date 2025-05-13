
import React from "react";
import { Outlet } from "react-router-dom";

export const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50" id="app-layout">
      <Outlet />
    </div>
  );
};
