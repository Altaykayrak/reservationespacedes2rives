
import React from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { MIN_QF, MAX_QF } from "../utils/priceConstants";

interface QFInputProps {
  qf: number;
  inputValue: string;
  onQfChange: (value: number[]) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInputBlur: () => void;
  scrollToObtenirQFSection: () => void;
  scrollToPlafondSection: () => void;
}

export function QFInput({
  qf,
  inputValue,
  onQfChange,
  onInputChange,
  onInputBlur,
  scrollToObtenirQFSection,
  scrollToPlafondSection
}: QFInputProps) {
  return (
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
            value={inputValue} 
            onChange={onInputChange}
            onBlur={onInputBlur}
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
            onValueChange={onQfChange} 
            className="my-2" 
          />
        </div>
      </div>
    </div>
  );
}
