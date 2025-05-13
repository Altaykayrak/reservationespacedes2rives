
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
  }, []);
  
  // Fonction pour mettre à jour l'enfant sélectionné
  const setSelectedChild = useCallback((childId: string) => {
    if (childId === selectedChild) return; // Éviter les mises à jour inutiles
    
    // Mettre à jour l'état local
    setSelectedChildState(childId);
    
    // Mettre à jour les paramètres d'URL de façon sécurisée sans recharger la page
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
    
    // Utiliser replace: true ET l'option state pour éviter de recharger la page
    setSearchParams(newParams, { 
      replace: true,
      state: { preventReload: true }
    });
  }, [selectedChild, searchParams, setSearchParams]);
  
  // Fonction pour mettre à jour la période sélectionnée
  const setSelectedPeriod = useCallback((periodId: string) => {
    if (periodId === selectedPeriod) return; // Éviter les mises à jour inutiles
    
    // Mettre à jour l'état local
    setSelectedPeriodState(periodId);
    
    // Mettre à jour les paramètres d'URL de façon sécurisée sans recharger la page
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
    
    // Utiliser replace: true ET l'option state pour éviter de recharger la page
    setSearchParams(newParams, { 
      replace: true,
      state: { preventReload: true }
    });
  }, [selectedPeriod, searchParams, setSearchParams]);

  // Synchroniser les états locaux avec les paramètres d'URL lorsqu'ils changent
  useEffect(() => {
    const periodId = searchParams.get("periodId");
    const childId = searchParams.get("childId");
    
    // Synchroniser uniquement si les valeurs diffèrent pour éviter des cycles
    if (periodId && periodId !== selectedPeriod) {
      setSelectedPeriodState(periodId);
    }
    
    if (childId && childId !== selectedChild) {
      setSelectedChildState(childId);
    }
  }, [searchParams]);

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
