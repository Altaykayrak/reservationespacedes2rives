
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";

export const useSelectionState = () => {
  // États locaux avec références pour éviter les références circulaires
  const [selectedChild, setSelectedChildState] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriodState] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noSpotsDialog, setNoSpotsDialog] = useState({ isOpen: false, schoolClass: '', date: new Date() });
  const [minimumDaysDialog, setMinimumDaysDialog] = useState({ isOpen: false });
  
  // Utilisation des paramètres d'URL avec une référence pour éviter les mises à jour en boucle
  const [searchParams, setSearchParams] = useSearchParams();
  const isUpdatingParams = useRef(false);

  // Initialisation depuis l'URL au chargement initial
  useEffect(() => {
    if (isUpdatingParams.current) return;

    const periodId = searchParams.get("periodId");
    const childId = searchParams.get("childId");
    
    // Utiliser batch updates pour minimiser les rendus
    const updates = {};
    
    if (periodId && periodId !== selectedPeriod) {
      updates["selectedPeriod"] = periodId;
    }
    
    if (childId && childId !== selectedChild) {
      updates["selectedChild"] = childId;
    }
    
    // N'appliquer les mises à jour que s'il y a des changements
    if (Object.keys(updates).length > 0) {
      if (updates["selectedPeriod"]) setSelectedPeriodState(updates["selectedPeriod"]);
      if (updates["selectedChild"]) setSelectedChildState(updates["selectedChild"]);
    }
  }, [searchParams]);
  
  // Fonction pour mettre à jour l'enfant sélectionné de manière sécurisée
  const setSelectedChild = useCallback((childId: string) => {
    if (childId === selectedChild) return; // Éviter les mises à jour inutiles
    
    // Mettre à jour l'état local
    setSelectedChildState(childId);
    
    // Éviter les boucles de mise à jour
    isUpdatingParams.current = true;
    
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
    
    // Réinitialiser le drapeau après un court délai
    setTimeout(() => {
      isUpdatingParams.current = false;
    }, 0);
  }, [selectedChild, searchParams, setSearchParams]);
  
  // Fonction pour mettre à jour la période sélectionnée de manière sécurisée
  const setSelectedPeriod = useCallback((periodId: string) => {
    if (periodId === selectedPeriod) return; // Éviter les mises à jour inutiles
    
    // Mettre à jour l'état local
    setSelectedPeriodState(periodId);
    
    // Éviter les boucles de mise à jour
    isUpdatingParams.current = true;
    
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
      state: { preventReload: true, updateSource: 'internal' }
    });
    
    // Réinitialiser le drapeau après un court délai
    setTimeout(() => {
      isUpdatingParams.current = false;
    }, 0);
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
