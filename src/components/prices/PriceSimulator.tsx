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
}
const priceItems: PriceItem[] = [{
  name: "Garderie du matin",
  percentageOfQF: 0.15,
  color: "text-blue-600"
}, {
  name: "Périscolaire du soir",
  percentageOfQF: 0.20,
  color: "text-green-600"
}, {
  name: "Accueil de loisirs du mercredi (avec repas)",
  percentageOfQF: 0.70,
  color: "text-purple-600"
}, {
  name: "Accueil de loisirs du mercredi (sans repas)",
  percentageOfQF: 0.50,
  color: "text-indigo-600"
}, {
  name: "Accueil de loisirs vacances (avec repas)",
  percentageOfQF: 0.80,
  color: "text-orange-600"
}, {
  name: "Accueil de loisirs vacances (sans repas)",
  percentageOfQF: 0.50,
  color: "text-amber-600"
}, {
  name: "Club Ado journée (sans repas)",
  percentageOfQF: 0.50,
  color: "text-teal-600"
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
  return <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Simulateur de tarifs</CardTitle>
        <CardDescription>
          Saisissez votre quotient familial pour calculer les tarifs par enfant
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="qf">Quotient Familial (QF)</Label>
            <span className="text-sm font-semibold text-blue-600">
              Plancher {MIN_QF}€ Plafond {MAX_QF}€
            </span>
          </div>

          <div className="flex gap-4 items-center">
            <Input id="qf" type="number" min={MIN_QF} max={MAX_QF} value={qf} onChange={handleInputChange} className="w-28" />
            <span className="text-sm">€</span>
            <div className="flex-1">
              <Slider defaultValue={[qf]} min={MIN_QF} max={MAX_QF} step={10} value={[qf]} onValueChange={handleQfChange} className="my-2" />
            </div>
          </div>
        </div>

        <Button onClick={() => setShowResults(true)} className="w-full">
          Calculer les tarifs
        </Button>

        {showResults && <div className="rounded-md border mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[400px]">Prestation</TableHead>
                  <TableHead className="text-right">Prix par enfant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceItems.map(item => <TableRow key={item.name}>
                    <TableCell className="font-medium">
                      <span className={`font-bold ${item.color}`}>{item.name}</span>
                    </TableCell>
                    <TableCell className="text-right">{calculatePrice(item.percentageOfQF)} €</TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>
          </div>}
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        <p>Note: Ces tarifs sont calculés en fonction de votre quotient familial ({qf}€).</p>
      </CardFooter>
    </Card>;
}