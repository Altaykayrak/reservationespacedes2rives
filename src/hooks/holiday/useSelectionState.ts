
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export const useSelectionState = () => {
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noSpotsDialog, setNoSpotsDialog] = useState({ isOpen: false, schoolClass: '', date: new Date() });
  const [minimumDaysDialog, setMinimumDaysDialog] = useState({ isOpen: false });
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialiser les sélections depuis l'URL au chargement initial
  useEffect(() => {
    const periodId = searchParams.get("periodId");
    if (periodId) {
      setSelectedPeriod(periodId);
    }
    
    const childId = searchParams.get("childId");
    if (childId) {
      setSelectedChild(childId);
    }
  }, []);
  
  // Mettre à jour l'URL lorsque les sélections changent
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    
    if (selectedPeriod) {
      newParams.set("periodId", selectedPeriod);
    } else {
      newParams.delete("periodId");
    }
    
    if (selectedChild) {
      newParams.set("childId", selectedChild);
    } else {
      newParams.delete("childId");
    }
    
    setSearchParams(newParams, { replace: true });
  }, [selectedChild, selectedPeriod, setSearchParams]);

  return {
    selectedChild,
    selectedPeriod,
    setSelectedChild,
    setSelectedPeriod,
    showSuccessDialog,
    setShowSuccessDialog,
    isSubmitting,
    setIsSubmitting,
    noSpotsDialog,
    setNoSpotsDialog,
    minimumDaysDialog,
    setMinimumDaysDialog,
    searchParams
  };
};
