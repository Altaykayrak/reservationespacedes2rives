
import React from "react";
import { Outlet } from "react-router-dom";

export const Layout = () => {
  return <div className="min-h-screen"><Outlet /></div>;
};
