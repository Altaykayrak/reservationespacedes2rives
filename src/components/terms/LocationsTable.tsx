
import React from "react";

export const LocationsTable = () => {
  return (
    <div className="overflow-x-auto mb-6">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">ALSH PITRES</th>
            <th className="border border-gray-300 p-2">ALSH MANOIR SUR SEINE</th>
            <th className="border border-gray-300 p-2">ALSH AMFREVILLE SOUS LES MONTS</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 p-2 align-top">
              <strong>Adresse</strong><br />
              4, place de la Fraternité<br />
              27590 Pitres
            </td>
            <td className="border border-gray-300 p-2 align-top">
              <strong>Adresse</strong><br />
              7, boulevard de la Seine<br />
              27460 Le Manoir sur Seine<br /><br />
              « Le petit monde de Casimir »<br />
              4, rue Ile de France<br />
              27460 Le manoir sur Seine
            </td>
            <td className="border border-gray-300 p-2 align-top">
              <strong>Adresse</strong><br />
              Ecole maternelle<br />
              1, place René Raban<br />
              27380 Amfreville sous les Monts
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2">
              <strong>Téléphone</strong><br />
              02.32.68.32.10
            </td>
            <td className="border border-gray-300 p-2">
              <strong>Téléphone</strong><br />
              02.32.68.20.80<br />
              02.32.49.91.17
            </td>
            <td className="border border-gray-300 p-2">
              <strong>Téléphone</strong><br />
              02.32.68.32.10
            </td>
          </tr>
          <tr>
            <td colSpan={3} className="border border-gray-300 p-2 text-center">
              <strong>Mail</strong><br />
              direction@e2rives.fr<br />
              accueil@e2rives.fr
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2 align-top">
              <strong>Hors vacances scolaires</strong><br />
              Lundi, mardi, jeudi, vendredi<br />
              7h30/8h30  11h45/13h30  16h15/18h30<br /><br />
              Mercredi 7h30/18h30
            </td>
            <td className="border border-gray-300 p-2 align-top">
              <strong>Hors vacances scolaires</strong><br />
              Lundi, mardi, jeudi, vendredi<br />
              7h30/8h30 11h30/13h30 16h30/18h30<br /><br />
              Mercredi 7h30/18h30
            </td>
            <td className="border border-gray-300 p-2 align-top">
              <strong>Hors vacances scolaires</strong><br />
              Lundi, mardi, jeudi, vendredi<br />
              7h30/8h30 -16h/18h30
            </td>
          </tr>
          <tr>
            <td colSpan={2} className="border border-gray-300 p-2 align-top">
              <strong>Pendant les vacances scolaires</strong><br />
              Du lundi au vendredi de 7h30 à 18h30<br /><br />
              Les maternels sont accueillis à Pitres et les élémentaires au Manoir sur Seine
            </td>
            <td className="border border-gray-300 p-2"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
