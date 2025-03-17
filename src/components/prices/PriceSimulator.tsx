
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MIN_QF, MAX_QF, priceItems } from "./utils/priceConstants";
import { QFInput } from "./components/QFInput";
import { PriceResultsTable } from "./components/PriceResultsTable";

export function PriceSimulator() {
  const [qf, setQf] = useState<number>(MIN_QF);
  const [inputValue, setInputValue] = useState<string>(MIN_QF.toString());
  const [showResults, setShowResults] = useState<boolean>(false);

  const handleQfChange = (value: number[]) => {
    const newQf = value[0];
    setQf(newQf);
    setInputValue(newQf.toString());
    setShowResults(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty input temporarily during typing
    setInputValue(value);
    
    // Only update QF if it's a valid number within range
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      if (numValue < MIN_QF) {
        setQf(MIN_QF);
      } else if (numValue > MAX_QF) {
        setQf(MAX_QF);
      } else {
        setQf(numValue);
      }
    }
    // Don't update QF if it's not a valid number
    
    setShowResults(false);
  };

  const handleInputBlur = () => {
    // When input loses focus, ensure the displayed value is valid
    if (inputValue === '' || isNaN(parseInt(inputValue))) {
      setInputValue(MIN_QF.toString());
      setQf(MIN_QF);
    } else {
      const numValue = parseInt(inputValue);
      if (numValue < MIN_QF) {
        setInputValue(MIN_QF.toString());
        setQf(MIN_QF);
      } else if (numValue > MAX_QF) {
        setInputValue(MAX_QF.toString());
        setQf(MAX_QF);
      } else {
        setInputValue(numValue.toString());
        setQf(numValue);
      }
    }
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

  const scrollToInfoImportanteSection = () => {
    const section = document.getElementById('info-importante-section');
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
        <QFInput 
          qf={qf}
          inputValue={inputValue}
          onQfChange={handleQfChange}
          onInputChange={handleInputChange}
          onInputBlur={handleInputBlur}
          scrollToObtenirQFSection={scrollToObtenirQFSection}
          scrollToPlafondSection={scrollToPlafondSection}
        />

        <Button onClick={() => setShowResults(true)} className="w-full">
          Calculer les tarifs
        </Button>

        <PriceResultsTable 
          priceItems={priceItems} 
          qf={qf} 
          showResults={showResults} 
        />
      </CardContent>
      <CardFooter className="text-xs md:text-sm text-muted-foreground flex flex-wrap">
        <p>
          Note: Ces tarifs sont calculés en fonction de votre quotient familial ({qf}€) et un taux d'effort. 
          <a 
            href="#info-importante-section" 
            onClick={(e) => {
              e.preventDefault();
              scrollToInfoImportanteSection();
            }}
            className="ml-1 text-blue-600 font-semibold underline hover:text-blue-800"
          >
            Voir détails
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}
