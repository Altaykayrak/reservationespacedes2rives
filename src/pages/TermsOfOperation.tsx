
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const TermsOfOperation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleBack = () => {
    navigate(-1);
  };

  // Get previous path from state or referrer
  const previousPath = location.state?.from || document.referrer;
  const showBackButton = previousPath?.includes('/register');
  
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {showBackButton && (
          <Button onClick={handleBack} variant="outline" className="mb-6 flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Retour sur l'inscription
          </Button>
        )}

        <div className="mb-12 border p-6 rounded-lg bg-gray-50" id="reglement-fonctionnement">
          <h1 className="text-3xl font-bold mb-6 text-center">REGLEMENT DE FONCTIONNEMENT</h1>
          <h2 className="text-2xl font-bold mb-4 text-center">ACCUEILS DE LOISIRS MATERNELS ET ELEMENTAIRES</h2>
          
          <h3 className="text-xl font-bold mb-6 text-center">PITRES<br />LE MANOIR SUR SEINE<br />AMFREVILLE SOUS LES MONTS</h3>
          
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

          <h3 className="text-xl font-bold mb-4">TARIFICATION-INSCRIPTION</h3>
          
          <div className="space-y-4 mb-6">
            <p className="font-semibold">Concernant la pause méridienne : lundi, mardi, jeudi, vendredi</p>
            <p className="text-justify">La réservation et le coût du repas sont à régler en mairie. S'ajoute une cotisation obligatoire de 15 euros par enfant à régler uniquement à l'Espace des 2 rives à Pîtres.</p>
            
            <p className="font-semibold">Concernant le périscolaire : lundi, mardi, jeudi, vendredi de 7h30 à 8h30 et de 16h à 18h30</p>
            <p className="text-justify">L'accueil des enfants en périscolaire est soumis à un tarif calculé en fonction du quotient familial. La famille peut réserver la tranche horaire pour 4 matins et/ou 4 soirs par semaine. La réservation se fait entre deux périodes de vacances scolaires. Une dérogation peut être accordée sur présentation du planning d'un des deux parents.</p>
            
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
            
            <p className="text-justify">La facture périscolaire est à régler dans un délai de 8 jours à réception de celle-ci par mail. Toute facture non acquittée suspendra l'accueil de votre enfant sans délai de prévenance.</p>
            
            <p>Le goûter est fourni par l'association sans coût supplémentaire.</p>
            
            <p className="font-semibold mt-6">Concernant les mercredis :</p>
            <p className="text-justify">Les mercredis sont à réserver huit jours avant (au plus tard le mardi pour le mercredi de la semaine suivante). La réservation se fait à la journée (pas de réservation en demi-journée) avec ou sans repas. Le nombre de mercredis réservés est en fonction des besoins de la famille. L'inscription est validée uniquement après paiement de la facture.</p>
            
            <p>Le tarif est calculé en fonction du quotient familial.</p>
            
            <p>Le goûter est fourni par l'association sans coût supplémentaire.</p>
            
            <p className="text-justify">Il vous est demandé de prévenir avant le lundi 11h l'accueil de l'Espace des 2 rives si votre enfant est absent afin d'annuler le repas, d'éviter le gaspillage alimentaire et pour organiser l'équipe d'encadrement. Un avoir sera établi uniquement sur présentation d'un certificat médical.</p>
            
            <p className="font-semibold mt-6">Concernant les vacances scolaires :</p>
            <p className="text-justify">La réservation se fait sur trois jours minimum (exception faite d'un jour férié dans la semaine). Le règlement est à effectuer au moment de l'inscription. Il est possible de réserver jusqu'au mercredi pour la semaine suivante en fonction des places disponibles.</p>
            <p>Le tarif est calculé en fonction du quotient familial.</p>
            <p>Le goûter est fourni par l'association sans coût supplémentaire.</p>
            
            <p className="text-justify">Le remboursement n'est applicable que sur présentation d'un certificat médical pour une maladie supérieure à 3 jours (le délai de carence correspond au premier jour d'absence et aux 2 jours calendaires qui suivent).</p>
            
            <p className="font-semibold mt-6">Comment réserver et payer ?</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>En prenant un rendez-vous au 02 32 68 32 10 ou directement au secrétariat de l'Espace des 2 rives.</li>
              <li>Jours et horaires des rendez-vous : du lundi au vendredi de 9h à 12h et de 13h30 à 17h30.</li>
              <li>Les paiements se font uniquement en chèque ou carte bancaire et sont à régler uniquement à l'accueil avant 18h00. Possibilité d'opter pour le prélèvement automatique (en cas de rejet, pénalité de 10 euros qui correspond aux frais bancaires).</li>
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
              <li>L'utilisation d'un service de l'Espace des 2 rives donne lieu à une adhésion annuelle (année civile) obligatoire de 6 € par famille.</li>
            </ul>
            
            <p className="mt-4 text-justify">Nota : Les tarifs sont revus chaque année en janvier. Le gestionnaire utilisera CDAP (Consultation des Données Allocataires par les Partenaires) pour avoir connaissance des ressources et de la situation familiale et ainsi calculera la participation financière de la famille. A défaut de produire dans les délais précisés lors de la demande le numéro d'allocataire Caf ou un justificatif de ressources, la participation financière sera calculée sur la base du prix plafond, jusqu'à réception des documents, sans effet rétroactif.</p>
            
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
                <p className="font-semibold">Signature du vice-président de l'association</p>
                <p>M. Daniel Bayart</p>
              </div>
              <div>
                <p className="font-semibold">Signature de la directrice</p>
                <p>Mme. Sabine Caillet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfOperation;
