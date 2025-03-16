import { Navbar } from "@/components/ui/navbar";
import { PriceSimulator } from "@/components/prices/PriceSimulator";

const Prices = () => {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8 text-center">Simulation des tarifs</h1>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 md:mb-8 text-center">
            <p className="text-base md:text-lg text-muted-foreground">
              Estimez les tarifs applicables en fonction de votre quotient familial.
            </p>
          </div>
          <PriceSimulator />
          
          <div id="obtenir-qf-section" className="mt-6 md:mt-8 p-3 md:p-4 bg-muted rounded-lg text-sm">
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="font-semibold text-blue-600">Comment obtenir votre Quotient Familial :</p>
              <p className="mt-1">
                Vous pouvez obtenir votre QF sur l'application ou le site internet de la CAF, menu "Mon Compte".
              </p>
            </div>
            
            <h3 className="font-semibold mt-4 mb-2 text-blue-600">Formule de calcul du Quotient Familial</h3>
            
            <div className="mt-3 flex justify-center">
              <div className="bg-white p-3 rounded-lg text-center">
                <div className="text-lg font-medium">QF = <div className="border-t border-black mt-1 mb-1"></div></div>
                <div className="text-sm">Revenus mensuels du foyer</div>
                <div className="text-sm">Nombre de parts fiscales</div>
              </div>
            </div>
            
            <p className="mt-4 font-semibold text-blue-600">Explication des éléments :</p>
            <div className="mt-2 space-y-3">
              <div>
                <span className="text-blue-600 font-semibold">🔹 Revenus mensuels du foyer :</span> Il s'agit du revenu imposable annuel du foyer divisé par 12 mois. 
                Il peut inclure les salaires, allocations et autres revenus.
              </div>
              <div>
                <span className="text-blue-600 font-semibold">🔹 Nombre de parts fiscales :</span> Il correspond à la composition de votre foyer, définie selon la grille suivante :
                <ul className="list-disc pl-8 mt-1 space-y-1">
                  <li>1 part pour un parent isolé</li>
                  <li>2 parts pour un couple</li>
                  <li>+ 0.5 part par enfant à charge jusqu'au deuxième</li>
                  <li>+ 1 part à partir du troisième enfant</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 bg-blue-50 p-3 rounded-lg">
              <p className="font-semibold text-blue-600">Exemple de calcul :</p>
              <p className="mt-1">Une famille avec 2 enfants et un revenu imposable annuel de 36 000 € :</p>
              <ul className="list-disc pl-8 mt-2 space-y-1">
                <li>Revenus mensuels : 36 000 € ÷ 12 = 3 000 €</li>
                <li>Nombre de parts fiscales : 2 + 0.5 + 0.5 = 3 parts</li>
                <li>Quotient familial : 3 000 € ÷ 3 = 1 000 €</li>
              </ul>
            </div>
          </div>
          
          <div id="plafond-plancher-section" className="mt-4 p-3 md:p-4 bg-muted rounded-lg text-sm">
            <h3 className="font-semibold mb-2 text-blue-600">Plancher et Plafond du Quotient Familial</h3>
            <p>
              Afin de garantir une tarification équitable et adaptée aux ressources de chaque famille, 
              notre simulateur de tarifs prend en compte un quotient familial (QF) encadré par un plancher et un plafond.
            </p>
            <div className="mt-3 space-y-3">
              <div>
                <span className="text-blue-600 font-semibold">🔹 Le Plancher (300 €) :</span> Si votre quotient familial est inférieur à 300 €, 
                le calcul des tarifs se fera sur cette base minimale. Cela signifie que même si votre QF est plus bas, 
                les prix seront calculés comme si votre quotient était de 300 €.
              </div>
              <div>
                <span className="text-blue-600 font-semibold">🔹 Le Plafond (2000 €) :</span> À l'inverse, si votre quotient familial dépasse 2000 €, 
                les tarifs seront calculés sur cette base maximale. Ainsi, au-delà de ce montant, 
                les prix n'augmenteront plus, même si votre QF est supérieur.
              </div>
            </div>
            <p className="mt-3">
              Ces limites permettent d'assurer une répartition équitable des tarifs tout en garantissant 
              un accès aux prestations pour toutes les familles.
            </p>
          </div>
          
          <div id="info-importante-section" className="mt-4 p-3 md:p-4 bg-muted rounded-lg text-sm">
            <h3 className="font-semibold mb-2 text-blue-600">INFORMATION IMPORTANTE</h3>
            <p>
              Les tarifs affichés sont donnés à titre indicatif et calculés sur la base 
              de pourcentages du quotient familial :
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><span className="font-bold text-blue-600">Garderie du matin :</span> 0.15% du QF</li>
              <li><span className="font-bold text-green-600">Périscolaire du soir :</span> 0.20% du QF</li>
              <li><span className="font-bold text-purple-600">Accueil de loisirs du mercredi (avec repas) :</span> 0.70% du QF</li>
              <li><span className="font-bold text-indigo-600">Accueil de loisirs du mercredi (sans repas) :</span> 0.50% du QF</li>
              <li><span className="font-bold text-orange-600">Accueil de loisirs vacances (avec repas) :</span> 0.80% du QF</li>
              <li><span className="font-bold text-amber-600">Accueil de loisirs vacances (sans repas) :</span> 0.50% du QF</li>
              <li><span className="font-bold text-teal-600">Club Ado journée (sans repas) :</span> 0.50% du QF</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prices;
