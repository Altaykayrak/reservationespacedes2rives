
import React from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";

export const Layout = () => {
  return (
    <div className="min-h-screen">
      <ScrollRestoration />
      <Outlet />
    </div>
  );
};
