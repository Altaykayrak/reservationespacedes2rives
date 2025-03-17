
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PriceItem, calculatePrice } from "../utils/priceConstants";

interface PriceResultsTableProps {
  priceItems: PriceItem[];
  qf: number;
  showResults: boolean;
}

export function PriceResultsTable({ priceItems, qf, showResults }: PriceResultsTableProps) {
  if (!showResults) {
    return null;
  }

  return (
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
                {calculatePrice(qf, item.percentageOfQF)} € 
                <span className="text-xs text-muted-foreground ml-1">{item.priceUnit}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
