import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const TermsOfService = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleBack = () => {
    // If we have a stored "from" path in the location state, navigate to it
    if (location.state?.from && location.state.from.includes('/register')) {
      navigate(location.state.from);
    } else {
      // Otherwise, just go back in history
      navigate(-1);
    }
  };

  // Check if we came from registration page
  const showBackButton = location.state?.from?.includes('/register');
  
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

        <div className="mb-12 border p-6 rounded-lg bg-gray-50" id="cgu">
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
              <p className="text-gray-700 mb-4 text-justify">L'association collecte et traite les données personnelles des usagers dans le cadre de sa mission d'intérêt public, sans nécessiter de consentement, et en conformité avec le Règlement Général sur la Protection des Données (RGPD). L'association s'engage à prendre toutes les mesures nécessaires pour garantir la sécurité et la confidentialité des informations fournies par l'Usager.</p>
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
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
