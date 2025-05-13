
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export const useSelectionState = () => {
  // États locaux
  const [selectedChild, setSelectedChildState] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriodState] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noSpotsDialog, setNoSpotsDialog] = useState({ isOpen: false, schoolClass: '', date: new Date() });
  const [minimumDaysDialog, setMinimumDaysDialog] = useState({ isOpen: false });
  
  // Utilisation des paramètres d'URL
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialisation depuis l'URL au chargement initial
  useEffect(() => {
    const periodId = searchParams.get("periodId");
    const childId = searchParams.get("childId");
    
    if (periodId && periodId !== selectedPeriod) {
      setSelectedPeriodState(periodId);
    }
    
    if (childId && childId !== selectedChild) {
      setSelectedChildState(childId);
    }
  }, [searchParams]);
  
  // Fonction pour mettre à jour l'enfant sélectionné
  const setSelectedChild = useCallback((childId: string) => {
    if (childId === selectedChild) return; // Éviter les mises à jour inutiles
    
    // Mettre à jour l'état local
    setSelectedChildState(childId);
    
    // Mettre à jour les paramètres d'URL de façon sécurisée
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
    
    // Utiliser replace: true pour éviter d'ajouter une entrée à l'historique
    setSearchParams(newParams, { replace: true });
  }, [selectedChild, searchParams, setSearchParams]);
  
  // Fonction pour mettre à jour la période sélectionnée
  const setSelectedPeriod = useCallback((periodId: string) => {
    if (periodId === selectedPeriod) return; // Éviter les mises à jour inutiles
    
    // Mettre à jour l'état local
    setSelectedPeriodState(periodId);
    
    // Mettre à jour les paramètres d'URL de façon sécurisée
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
    
    // Utiliser replace: true pour éviter d'ajouter une entrée à l'historique
    setSearchParams(newParams, { replace: true });
  }, [selectedPeriod, searchParams, setSearchParams]);

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
