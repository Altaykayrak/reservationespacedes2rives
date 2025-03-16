
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
