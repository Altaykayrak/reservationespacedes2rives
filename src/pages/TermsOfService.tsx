import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useEffect, useRef } from "react";
const TermsOfService = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const reglement = useRef<HTMLDivElement>(null);
  const cgu = useRef<HTMLDivElement>(null);
  const handleBack = () => {
    navigate(-1);
  };
  useEffect(() => {
    // Scroll to the anchored element if hash exists in URL
    if (location.hash) {
      setTimeout(() => {
        const hash = location.hash.replace('#', '');
        if (hash === 'reglement-fonctionnement' && reglement.current) {
          reglement.current.scrollIntoView({
            behavior: 'smooth'
          });
        } else if (hash === 'cgu' && cgu.current) {
          cgu.current.scrollIntoView({
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [location]);
  return <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button onClick={handleBack} variant="outline" className="mb-6 flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          Retour sur l'inscription
        </Button>

        <div ref={reglement} className="mb-12 border p-6 rounded-lg bg-gray-50" id="reglement-fonctionnement">
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
          
          <hr className="my-8 border-gray-300" />
        </div>

        <div ref={cgu} className="mb-12 border p-6 rounded-lg bg-gray-50" id="cgu">
          <h1 className="text-3xl font-bold mb-6 text-center">CONDITIONS GÉNÉRALES D'UTILISATION</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">1. Présentation du service</h2>
              <p className="text-gray-700 text-justify">
                L'association L'Espace des 2 rives met à disposition un guichet en ligne (le Service) destiné à simplifier les démarches de réservation pour les usagers. Ce Service est offert gratuitement (à l'exception des frais de connexion) et <strong>son utilisation est facultative</strong>. L'usager détermine librement les services auxquels il souhaite accéder. L'accès au Service implique la lecture et l'acceptation intégrale des présentes CGU.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">2. Définitions</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>L'association : l'Espace des 2 rives.</li>
                <li>Le service : l'application web dédiée à la réservation en ligne.</li>
                <li>CGU : Conditions Générales d'Utilisation.</li>
                <li>L'usager : Toute personne (particulier) qui utilise le service.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">3. Acceptation et opposabilité des CGU</h2>
              <p className="text-gray-700 text-justify">En utilisant le service, l'usager accepte les présentes CGU et s'engage à les respecter. L'association se réserve le droit de modifier ces conditions à tout moment et informera les usagers des mises à jour. L'usager peut décider de cesser l'utilisation du service à tout moment. De même, l'association pourra modifier, suspendre ou interrompre le service pour des raisons de maintenance ou d'évolution, sans que cela n'entraîne aucune indemnisation. Le service est accessible en continu, 24h/24 et 7j/7, sauf en cas d'interruption programmée pour maintenance.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">4. Fonctionnalités du Service</h2>
              <p className="text-gray-700 mb-4">Le Service offre les fonctionnalités suivantes :</p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Compte usager sécurisé : Permet d'effectuer des réservations en ligne en toute confiance.</li>
                <li>Suivi simplifié : L'usager peut consulter facilement les dates réservées pour chacun de ses enfants.</li>
                <li>Informations personnalisées : Offre l'accès aux horaires, localisations, tarifs, programmes, etc.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">5. Inscription et sécurité du compte</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>L'usager doit fournir une adresse e-mail valide lors de son inscription.</li>
                <li>Il choisit un nom d'utilisateur ainsi qu'un mot de passe (minimum 8 caractères, incluant au moins une lettre et un chiffre).</li>
                <li>L'usager est responsable de la confidentialité de ses identifiants et doit signaler immédiatement toute utilisation non autorisée.</li>
                <li>En cas d'usage frauduleux ou de non-respect des CGU, l'association se réserve le droit de suspendre ou de résilier le compte.</li>
                <li>Le service requiert une connexion Internet et un navigateur compatible (Firefox, Chrome, Safari, Edge).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">6. Protection des données personnelles, engagements et responsabilité</h2>
              <p className="text-gray-700 mb-4">L'association collecte et traite les données personnelles des usagers dans le cadre de sa mission d'intérêt public, sans nécessiter de consentement, et en conformité avec le Règlement Général sur la Protection des Données (RGPD). L'association s'engage à prendre toutes les mesures nécessaires pour garantir la sécurité et la confidentialité des informations fournies par l'Usager.</p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Les données sont conservées pendant 3 ans après la dernière activité sur le compte.</li>
                <li>Aucune donnée n'est transférée hors de l'Union européenne.</li>
                <li>L'usager peut exercer ses droits (accès, rectification, suppression) en contactant le délégué à la protection des données :</li>
                
                <li>Par courrier : Espace des 2 rives, 4 place de la Fraternité, 27590 Pîtres.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">7. Références légales</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Loi n°78-17 du 6 janvier 1978 relative à l'informatique et aux libertés.</li>
                
                <li>Règlement (UE) 2016/679 (RGPD) relatif à la protection des données personnelles.</li>
              </ul>
            </section>
          </div>
          
          <div className="flex justify-between mt-8">
            <div>
              
              
            </div>
            <div>
              
              
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default TermsOfService;