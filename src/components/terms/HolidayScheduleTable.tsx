
import React from "react";

export const HolidayScheduleTable = () => {
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th></th>
            <th className="border border-gray-300 p-2">ALSH PITRES</th>
            <th className="border border-gray-300 p-2">ALSH MANOIR SUR SEINE</th>
            <th className="border border-gray-300 p-2">ALSH AMFREVILLE SOUS LES MONTS</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 p-2 font-semibold">1ère tranche</td>
            <td className="border border-gray-300 p-2">7h30/8h30</td>
            <td className="border border-gray-300 p-2">7h30/8h30</td>
            <td className="border border-gray-300 p-2">7h30/8h30</td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2 font-semibold">2ème tranche</td>
            <td className="border border-gray-300 p-2">16h15/18h30</td>
            <td className="border border-gray-300 p-2">16h30/18h30</td>
            <td className="border border-gray-300 p-2">16h/18h30</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
