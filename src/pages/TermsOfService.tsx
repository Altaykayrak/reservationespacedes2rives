
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const TermsOfService = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Utilise l'historique du navigateur pour revenir en arrière
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button 
          onClick={handleBack}
          variant="outline"
          className="mb-6 flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour sur l'inscription
        </Button>

        <h1 className="text-3xl font-bold mb-8">CONDITIONS GÉNÉRALES D'UTILISATION</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Présentation du service</h2>
            <p className="text-gray-700 text-justify">
              L'association L'Espace des 2 rives met à disposition un guichet en ligne (le Service) destiné à simplifier les démarches de réservation pour les usagers. Ce Service est offert gratuitement (à l'exception des frais de connexion) et son utilisation est facultative. L'usager détermine librement les services auxquels il souhaite accéder ainsi que les informations à conserver dans son compte utilisateur. L'accès au Service implique la lecture et l'acceptation intégrale des présentes CGU.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Définitions</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 text-justify">
              <li>L'association : L'Espace des 2 rives.</li>
              <li>Le Service : L'application web dédiée à la réservation en ligne.</li>
              <li>CGU : Conditions Générales d'Utilisation.</li>
              <li>L'Usager : Toute personne (particulier) qui utilise le Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. Acceptation et opposabilité des CGU</h2>
            <p className="text-gray-700 text-justify">
              En utilisant le Service, l'Usager accepte les présentes CGU et s'engage à les respecter. L'association se réserve le droit de modifier ces conditions à tout moment et informera les usagers des mises à jour. L'Usager peut décider de cesser l'utilisation du Service à tout moment. De même, l'association pourra modifier, suspendre ou interrompre le Service pour des raisons de maintenance ou d'évolution, sans que cela n'entraîne aucune indemnisation. Le Service est accessible en continu, 24h/24 et 7j/7, sauf en cas d'interruption programmée pour maintenance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Fonctionnalités du Service</h2>
            <p className="text-gray-700 mb-4 text-justify">Le Service offre les fonctionnalités suivantes :</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 text-justify">
              <li>Compte usager sécurisé : Permet d'effectuer des réservations en ligne en toute confiance.</li>
              <li>Suivi simplifié : L'Usager peut consulter facilement les dates réservées pour chacun de ses enfants.</li>
              <li>Informations personnalisées : Offre l'accès aux horaires, localisations, tarifs, programmes, etc.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Inscription et sécurité du compte</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 text-justify">
              <li>L'Usager doit fournir une adresse e-mail valide lors de son inscription.</li>
              <li>Il choisit un nom d'utilisateur ainsi qu'un mot de passe (minimum 8 caractères, incluant au moins une lettre et un chiffre).</li>
              <li>L'Usager est responsable de la confidentialité de ses identifiants et doit signaler immédiatement toute utilisation non autorisée.</li>
              <li>En cas d'usage frauduleux ou de non-respect des CGU, l'association se réserve le droit de suspendre ou de résilier le compte.</li>
              <li>Le Service requiert une connexion Internet et un navigateur compatible (Firefox, Chrome, Safari, Edge).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Protection des données personnelles, engagements et responsabilité</h2>
            <p className="text-gray-700 mb-4 text-justify">
              L'association collecte et traite les données personnelles des usagers dans le cadre de sa mission d'intérêt public, sans nécessiter de consentement, et en conformité avec le Règlement Général sur la Protection des Données (RGPD). L'association s'engage à prendre toutes les mesures nécessaires pour garantir la sécurité et la confidentialité des informations fournies par l'Usager.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 text-justify">
              <li>Les données sont conservées pendant 3 ans après la dernière activité sur le compte.</li>
              <li>Aucune donnée n'est transférée hors de l'Union européenne.</li>
              <li>L'Usager peut exercer ses droits (accès, rectification, suppression) en contactant le délégué à la protection des données :</li>
              <li>Par e-mail : rgpd@e2rives.fr</li>
              <li>Par courrier : L'Espace des 2 rives, 4 place de la Fraternité, Tel : 02 32 68 32 10</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. Références légales</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 text-justify">
              <li>Loi n°78-17 du 6 janvier 1978 relative à l'informatique et aux libertés.</li>
              <li>Ordonnance n°2005-1516 du 8 décembre 2005 concernant les échanges électroniques avec l'administration.</li>
              <li>Règlement (UE) 2016/679 (RGPD) relatif à la protection des données personnelles.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
