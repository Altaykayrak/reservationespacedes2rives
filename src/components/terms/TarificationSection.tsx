import React from "react";
import { HolidayScheduleTable } from "./HolidayScheduleTable";
export const TarificationSection = () => {
  return <div className="space-y-4 mb-6">
      <h3 className="text-xl font-bold mb-4">TARIFICATION-INSCRIPTION</h3>
      
      <p className="font-semibold">Concernant la pause méridienne : lundi, mardi, jeudi, vendredi</p>
      <p className="text-justify">La réservation et le coût du repas sont à régler en mairie. S'ajoute une cotisation obligatoire de 15 euros par enfant à régler uniquement à l'Espace des 2 rives à Pîtres.</p>
      
      <p className="font-semibold">Concernant le périscolaire : lundi, mardi, jeudi, vendredi de 7h30 à 8h30 et de 16h à 18h30</p>
      <p className="text-justify">L'accueil des enfants en périscolaire est soumis à un tarif calculé en fonction du quotient familial. La famille réserve la tranche horaire pour 4 matins et/ou 4 soirs par semaine avec une facturation forfaitaire. Une dérogation peut être accordée sur présentation du planning d'un des deux parents. La réservation se fait sur l'année scolaire.</p>
      
      <HolidayScheduleTable />
      
      <p className="text-justify">La facture périscolaire est à régler dans un délai de 8 jours à réception de celle-ci par mail. Toute facture non acquittée suspendra l'accueil de votre enfant sans délai de prévenance.</p>
      
      <p>Le goûter est fourni par l'association sans coût supplémentaire.</p>
      
      <p className="font-semibold mt-6">Concernant les mercredis :</p>
      <p className="text-justify">Les mercredis doivent être réservés au plus tard deux semaines à l'avance (jusqu'au mardi soir). La réservation se fait à la journée complète, avec ou sans repas (pas de demi-journée possible). Le nombre de mercredis réservés dépend des besoins de chaque famille. L'inscription est <strong>validée uniquement après le règlement de la facture</strong>.
En cas d'absence de votre enfant, merci de prévenir au moins huit jours à l'avance (avant le mardi 18h) auprès de l'accueil de l'Espace des 2 rives. Cela permet d'annuler le repas, d'éviter le gaspillage alimentaire et d'organiser au mieux l'équipe d'encadrement. Passé ce délai, la journée restera facturée.</p>
      
      <p>Le tarif est calculé en fonction du quotient familial.</p>
      
      
      
      
      
      <p className="font-semibold mt-6">Concernant les vacances scolaires :</p>
      <p className="text-justify">La directrice se réserve le droit de refuser l'accueil de votre enfant si les absences sont répétées et non signalées dans les délais.
Le tarif est calculé en fonction du quotient familial. Le goûter est fourni par l'association sans coût supplémentaire.</p>
      
      
      
      
    </div>;
};
