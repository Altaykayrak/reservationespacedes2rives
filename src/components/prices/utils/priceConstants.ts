
export const MIN_QF = 300;
export const MAX_QF = 2000;

export interface PriceItem {
  name: string;
  percentageOfQF: number;
  description?: string;
  color: string;
  priceUnit: string;
}

export const priceItems: PriceItem[] = [{
  name: "Garderie du matin",
  percentageOfQF: 0.15,
  color: "text-blue-600",
  priceUnit: "par séance"
}, {
  name: "Périscolaire du soir",
  percentageOfQF: 0.20,
  color: "text-green-600",
  priceUnit: "par séance"
}, {
  name: "Accueil de loisirs du mercredi (avec repas)",
  percentageOfQF: 0.70,
  color: "text-purple-600",
  priceUnit: "par journée"
}, {
  name: "Accueil de loisirs du mercredi (sans repas)",
  percentageOfQF: 0.50,
  color: "text-indigo-600",
  priceUnit: "par journée"
}, {
  name: "Accueil de loisirs vacances (avec repas)",
  percentageOfQF: 0.80,
  color: "text-orange-600",
  priceUnit: "par journée"
}, {
  name: "Accueil de loisirs vacances (sans repas)",
  percentageOfQF: 0.50,
  color: "text-amber-600",
  priceUnit: "par journée"
}, {
  name: "Club Ado journée (sans repas)",
  percentageOfQF: 0.50,
  color: "text-teal-600",
  priceUnit: "par journée"
}];

export const calculatePrice = (qf: number, percentageOfQF: number) => {
  return (qf * percentageOfQF / 100).toFixed(2);
};
