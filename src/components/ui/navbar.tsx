import React from "react";
import { Link } from "react-router-dom";
import { useGlobalSettings } from "@/hooks/useGlobalSettings";
import { useUserSettings } from "@/hooks/useUserSettings";

export function Navbar() {
  const { globalSettings, loading: gLoad } = useGlobalSettings();
  const { userSettings, loading: uLoad } = useUserSettings();
  const loading = gLoad || uLoad;

  const hideWed =
    globalSettings.hide_wednesday_reservations ||
    userSettings.hide_wednesday_reservations;
  const hideRdv = globalSettings.hide_rdv_page || userSettings.hide_rdv_page;

  return (
    <nav className="flex space-x-4 p-4">
      <Link to="/">Accueil</Link>
      {!loading && !hideWed && (
        <Link to="/wednesday-reservations">Mercredis</Link>
      )}
      <Link to="/holiday-reservations">Vacances</Link>
      {!loading && !hideRdv && <Link to="/rdv">Rdv</Link>}
    </nav>
  );
}
