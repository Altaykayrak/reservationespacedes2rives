import React from "react";

export const RegistrationInfoSection = () => {
  return (
    <div className="space-y-4 mb-6">
      <p className="font-semibold mt-6">Comment réserver et payer ?</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>En prenant un rendez-vous au 02 32 68 32 10 (nouveau dossier) ou directement sur l'application de réservation.</li>
        <li>Jours et horaires des rendez-vous : du lundi au vendredi de 9h à 12h et de 13h30 à 17h30.</li>
        <li>Les paiements se font uniquement en chèque ou carte bancaire et sont à régler uniquement à l'accueil avant 18h00. Possibilité d'opter pour le prélèvement automatique (en cas de rejet, pénalité de 11.50 euros qui correspond aux frais bancaires).</li>
      </ul>
      
      <p className="font-semibold">Documents à fournir lors de l'inscription :</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>N°allocataire Caf</li>
        <li>Carnet de santé</li>
        <li>Livret de Famille</li>
        <li>Avis d'imposition</li>
        <li>Justificatif de domicile</li>
        <li>Un exemplaire du PAI</li>
        <li>Un exemplaire du jugement du tribunal en cas de séparation</li>
      </ul>
      
      <p className="mt-4">L'utilisation d'un service de l'Espace des 2 rives donne lieu à une adhésion annuelle (année civile) obligatoire de 6 € par famille.</p>
      
      <p className="mt-4 text-justify">Nota : Les tarifs sont revus chaque année en janvier. Le gestionnaire utilisera CDAP (Consultation des Données Allocataires par les Partenaires) pour avoir connaissance des ressources et de la situation familiale et ainsi calculera la participation financière de la famille. A défaut de produire dans les délais précisés lors de la demande le numéro d'allocataire Caf ou un justificatif de ressources, la participation financière sera calculée sur la base du prix plafond, jusqu'à réception des documents, sans effet rétroactif.</p>
      
      <p className="text-justify text-red-600 font-bold">Il appartient aux familles de signaler tout changement de situation.</p>
      
      <p className="font-semibold mt-6">Absences :</p>
      <p>Les éventuelles déductions appliquées sont limitées à :</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>La fermeture de la structure.</li>
        <li>L'hospitalisation de l'enfant (sur présentation d'un justificatif).</li>
        <li>Pour les mercredis : sur présentation d'un certificat médical</li>
        <li>Une maladie supérieure à 3 jours (le délai de carence correspond au premier jour d'absence et les 2 jours calendaires qui suivent).</li>
      </ul>
      <p className="text-justify">Par ailleurs, la directrice du centre social s'autorise la possibilité de fermer la structure pour des raisons exceptionnelles.</p>
      
      <div className="flex justify-between mt-8">
        <div>
          <p className="font-semibold">Présidente de l'Espace des 2 rives</p>
          <p>Mme L. Ebro</p>
        </div>
        <div>
          <p className="font-semibold">Directrice Générale</p>
          <p>Mme. Sabine Caillet</p>
        </div>
      </div>
    </div>
  );
};
