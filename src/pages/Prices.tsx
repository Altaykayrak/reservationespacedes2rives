
import { Navbar } from "@/components/ui/navbar";
import { PriceSimulator } from "@/components/prices/PriceSimulator";

const Prices = () => {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Simulation des tarifs</h1>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <p className="text-lg text-muted-foreground">
              Estimez les tarifs applicables en fonction de votre quotient familial.
            </p>
          </div>
          <PriceSimulator />
          
          <div className="mt-8 p-4 bg-muted rounded-lg text-sm">
            <h3 className="font-semibold mb-2">Plancher et plafond du quotient familial</h3>
            <p>
              Afin de garantir une tarification équitable et adaptée aux ressources de chaque famille, 
              notre simulateur de tarifs prend en compte un quotient familial (QF) encadré par un plancher et un plafond.
            </p>
            <div className="mt-3 space-y-3">
              <div>
                <span className="text-blue-600">🔹 Le Plancher (300 €) :</span> Si votre quotient familial est inférieur à 300 €, 
                le calcul des tarifs se fera sur cette base minimale. Cela signifie que même si votre QF est plus bas, 
                les prix seront calculés comme si votre quotient était de 300 €.
              </div>
              <div>
                <span className="text-blue-600">🔹 Le Plafond (2000 €) :</span> À l'inverse, si votre quotient familial dépasse 2000 €, 
                les tarifs seront calculés sur cette base maximale. Ainsi, au-delà de ce montant, 
                les prix n'augmenteront plus, même si votre QF est supérieur.
              </div>
            </div>
            <p className="mt-3">
              Ces limites permettent d'assurer une répartition équitable des tarifs tout en garantissant 
              un accès aux prestations pour toutes les familles.
            </p>
          </div>
          
          <div className="mt-4 p-4 bg-muted rounded-lg text-sm">
            <h3 className="font-semibold mb-2">Information importante</h3>
            <p>
              Les tarifs affichés sont donnés à titre indicatif et calculés sur la base 
              de pourcentages du quotient familial :
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Garderie du matin : 0.15% du QF</li>
              <li>Périscolaire du soir : 0.20% du QF</li>
              <li>Accueil de loisirs du mercredi : 0.70% du QF (avec repas) et 0.50% du QF (sans repas)</li>
              <li>Accueil de loisirs pendant les vacances : 0.80% du QF (avec repas) et 0.50% du QF (sans repas)</li>
              <li>Club Ado journée (sans repas) : 0.50% du QF</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prices;
