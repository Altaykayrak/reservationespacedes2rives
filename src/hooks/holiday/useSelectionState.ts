
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

  // Initialisation depuis l'URL au chargement initial uniquement
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
  
  // Fonction personnalisée pour mettre à jour l'enfant sélectionné
  const updateSelectedChild = (childId: string) => {
    setSelectedChild(childId);
    
    // Mise à jour synchrone des paramètres d'URL sans rechargement
    const newParams = new URLSearchParams(searchParams);
    if (childId) {
      newParams.set("childId", childId);
    } else {
      newParams.delete("childId");
    }
    
    // Conserver periodId s'il existe
    const currentPeriodId = searchParams.get("periodId");
    if (currentPeriodId) {
      newParams.set("periodId", currentPeriodId);
    }
    
    setSearchParams(newParams, { replace: true });
  };
  
  // Fonction personnalisée pour mettre à jour la période sélectionnée
  const updateSelectedPeriod = (periodId: string) => {
    setSelectedPeriod(periodId);
    
    // Mise à jour synchrone des paramètres d'URL sans rechargement
    const newParams = new URLSearchParams(searchParams);
    if (periodId) {
      newParams.set("periodId", periodId);
    } else {
      newParams.delete("periodId");
    }
    
    // Conserver childId s'il existe
    const currentChildId = searchParams.get("childId");
    if (currentChildId) {
      newParams.set("childId", currentChildId);
    }
    
    setSearchParams(newParams, { replace: true });
  };

  return {
    selectedChild,
    selectedPeriod,
    setSelectedChild: updateSelectedChild,
    setSelectedPeriod: updateSelectedPeriod,
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
