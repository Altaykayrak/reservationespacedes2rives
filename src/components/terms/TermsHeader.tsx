
import React from "react";
import logoCaf from "@/assets/logo-caf.jpg.asset.json";
import logoEspace from "@/assets/logo-espace-2-rives.jpg.asset.json";

export const TermsHeader = () => {
  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-8 mb-8">
        <img
          src={logoCaf.url}
          alt="Logo CAF - Allocations Familiales"
          className="h-24 w-auto object-contain"
        />
        <img
          src={logoEspace.url}
          alt="Logo Espace des 2 rives"
          className="h-24 w-auto object-contain"
        />
      </div>
      <h1 className="text-3xl font-bold mb-6 text-center">REGLEMENT DE FONCTIONNEMENT</h1>
      <h2 className="text-2xl font-bold mb-4 text-center">ACCUEILS DE LOISIRS MATERNELS ET ELEMENTAIRES</h2>
      <h3 className="text-xl font-bold mb-6 text-center">PITRES<br />LE MANOIR SUR SEINE<br />AMFREVILLE SOUS LES MONTS</h3>
    </>
  );
};
