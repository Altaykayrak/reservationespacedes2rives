
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const MIN_QF = 300;
const MAX_QF = 2000;

interface PriceItem {
  name: string;
  percentageOfQF: number;
  description?: string;
  color: string;
  priceUnit: string;
}

const priceItems: PriceItem[] = [{
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

export function PriceSimulator() {
  const [qf, setQf] = useState<number>(MIN_QF);
  const [showResults, setShowResults] = useState<boolean>(false);

  const handleQfChange = (value: number[]) => {
    setQf(value[0]);
    setShowResults(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      if (value < MIN_QF) {
        setQf(MIN_QF);
      } else if (value > MAX_QF) {
        setQf(MAX_QF);
      } else {
        setQf(value);
      }
    } else {
      setQf(MIN_QF);
    }
    setShowResults(false);
  };

  const calculatePrice = (percentageOfQF: number) => {
    return (qf * percentageOfQF / 100).toFixed(2);
  };

  const scrollToPlafondSection = () => {
    const section = document.getElementById('plafond-plancher-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const scrollToObtenirQFSection = () => {
    const section = document.getElementById('obtenir-qf-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="pb-3 md:pb-6">
        <CardTitle className="text-xl md:text-2xl">Simulateur de tarifs</CardTitle>
        <CardDescription className="text-sm md:text-base">
          Saisissez votre quotient familial pour calculer les tarifs par enfant
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6">
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <a
              href="#obtenir-qf-section"
              onClick={(e) => {
                e.preventDefault();
                scrollToObtenirQFSection();
              }}
              className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 underline"
            >
              Quotient Familial (QF)
            </a>
            <a 
              href="#plafond-plancher-section" 
              onClick={(e) => {
                e.preventDefault();
                scrollToPlafondSection();
              }}
              className="text-xs sm:text-sm font-semibold text-blue-600 mt-1 sm:mt-0 underline hover:text-blue-800"
            >
              Plancher {MIN_QF}€ Plafond {MAX_QF}€
            </a>
          </div>

          <div className="flex flex-col sm:flex-row sm:gap-4 sm:items-center">
            <div className="flex items-center mb-2 sm:mb-0">
              <Input 
                id="qf" 
                type="number" 
                min={MIN_QF} 
                max={MAX_QF} 
                value={qf} 
                onChange={handleInputChange} 
                className="w-24 sm:w-28" 
              />
              <span className="text-sm ml-2">€</span>
            </div>
            <div className="flex-1">
              <Slider 
                defaultValue={[qf]} 
                min={MIN_QF} 
                max={MAX_QF} 
                step={10} 
                value={[qf]} 
                onValueChange={handleQfChange} 
                className="my-2" 
              />
            </div>
          </div>
        </div>

        <Button onClick={() => setShowResults(true)} className="w-full">
          Calculer les tarifs
        </Button>

        {showResults && (
          <div className="rounded-md border mt-4 md:mt-6 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60%] md:w-[400px]">Prestation</TableHead>
                  <TableHead className="text-right">Prix par enfant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceItems.map(item => (
                  <TableRow key={item.name}>
                    <TableCell className="font-medium py-2 md:py-4">
                      <span className={`font-bold ${item.color} text-xs sm:text-sm`}>{item.name}</span>
                    </TableCell>
                    <TableCell className="text-right py-2 md:py-4">
                      {calculatePrice(item.percentageOfQF)} € 
                      <span className="text-xs text-muted-foreground ml-1">{item.priceUnit}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs md:text-sm text-muted-foreground flex flex-wrap">
        <p>Note: Ces tarifs sont calculés en fonction de votre quotient familial ({qf}€) et un taux d'effort.</p>
      </CardFooter>
    </Card>
  );
}
