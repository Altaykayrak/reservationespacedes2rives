
import React from "react";
import { TermsHeader } from "./TermsHeader";
import { LocationsTable } from "./LocationsTable";
import { TarificationSection } from "./TarificationSection";
import { RegistrationInfoSection } from "./RegistrationInfoSection";

export const TermsContent = () => {
  return (
    <div className="mb-12 border p-6 rounded-lg bg-gray-50" id="reglement-fonctionnement">
      <TermsHeader />
      <LocationsTable />
      <TarificationSection />
      <RegistrationInfoSection />
    </div>
  );
};
