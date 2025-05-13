
import { useState, useEffect, useCallback, useRef } from "react";
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
  const isUpdatingParams = useRef(false);
  const initialLoadDone = useRef(false);

  // Initialisation depuis l'URL au chargement initial
  useEffect(() => {
    if (isUpdatingParams.current || initialLoadDone.current) return;

    const periodId = searchParams.get("periodId");
    const childId = searchParams.get("childId");
    
    // N'appliquer les mises à jour que s'il y a des valeurs
    if (periodId) setSelectedPeriodState(periodId);
    if (childId) setSelectedChildState(childId);
    
    initialLoadDone.current = true;
  }, [searchParams]);
  
  // Fonction pour mettre à jour l'enfant sélectionné sans recharger la page
  const setSelectedChild = useCallback((childId: string) => {
    // Éviter les mises à jour inutiles
    if (childId === selectedChild) return;
    
    // Mettre à jour l'état local
    setSelectedChildState(childId);
    
    // Éviter les boucles de mise à jour
    isUpdatingParams.current = true;
    
    // Mettre à jour les paramètres d'URL
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
    
    // Utiliser la méthode replace pour ne pas ajouter d'entrée à l'historique
    setSearchParams(newParams, { 
      replace: true 
    });
    
    // Réinitialiser le drapeau après un délai
    setTimeout(() => {
      isUpdatingParams.current = false;
    }, 50);
  }, [selectedChild, searchParams, setSearchParams]);
  
  // Fonction pour mettre à jour la période sélectionnée sans recharger la page
  const setSelectedPeriod = useCallback((periodId: string) => {
    // Éviter les mises à jour inutiles
    if (periodId === selectedPeriod) return;
    
    // Mettre à jour l'état local
    setSelectedPeriodState(periodId);
    
    // Éviter les boucles de mise à jour
    isUpdatingParams.current = true;
    
    // Mettre à jour les paramètres d'URL
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
    
    // Utiliser la méthode replace pour ne pas ajouter d'entrée à l'historique
    setSearchParams(newParams, { 
      replace: true
    });
    
    // Réinitialiser le drapeau après un délai
    setTimeout(() => {
      isUpdatingParams.current = false;
    }, 50);
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
