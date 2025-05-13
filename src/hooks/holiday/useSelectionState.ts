
import { useState, useRef, useCallback } from "react";
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
  const isUpdatingRef = useRef(false);
  const initialLoadDone = useRef(false);
  
  // Fonction pour mettre à jour l'enfant sélectionné sans recharger la page
  const setSelectedChild = useCallback((childId: string) => {
    // Éviter les mises à jour inutiles
    if (childId === selectedChild || isUpdatingRef.current) return;
    
    // Mettre à jour l'état local
    setSelectedChildState(childId);
    
    // Mettre à jour les paramètres d'URL sans recharger la page
    if (typeof window !== 'undefined') {
      isUpdatingRef.current = true;
      
      // On utilise le URLSearchParams actuel pour maintenir les autres paramètres
      const params = new URLSearchParams(searchParams);
      
      if (childId) {
        params.set("childId", childId);
      } else {
        params.delete("childId");
      }
      
      // Utiliser la méthode replace pour ne pas ajouter d'entrée à l'historique
      setSearchParams(params, { replace: true });
      
      // Réinitialiser le flag après un délai
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
    }
  }, [selectedChild, searchParams, setSearchParams]);
  
  // Fonction pour mettre à jour la période sélectionnée sans recharger la page
  const setSelectedPeriod = useCallback((periodId: string) => {
    // Éviter les mises à jour inutiles
    if (periodId === selectedPeriod || isUpdatingRef.current) return;
    
    // Mettre à jour l'état local
    setSelectedPeriodState(periodId);
    
    // Mettre à jour les paramètres d'URL sans recharger la page
    if (typeof window !== 'undefined') {
      isUpdatingRef.current = true;
      
      // On utilise le URLSearchParams actuel pour maintenir les autres paramètres
      const params = new URLSearchParams(searchParams);
      
      if (periodId) {
        params.set("periodId", periodId);
      } else {
        params.delete("periodId");
      }
      
      // Utiliser la méthode replace pour ne pas ajouter d'entrée à l'historique
      setSearchParams(params, { replace: true });
      
      // Réinitialiser le flag après un délai
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
    }
  }, [selectedPeriod, searchParams, setSearchParams]);

  // Récupérer les paramètres de l'URL au chargement initial
  if (!initialLoadDone.current && !isUpdatingRef.current && typeof window !== 'undefined') {
    const periodId = searchParams.get("periodId");
    const childId = searchParams.get("childId");
    
    if (periodId && periodId !== selectedPeriod) {
      setSelectedPeriodState(periodId);
    }
    
    if (childId && childId !== selectedChild) {
      setSelectedChildState(childId);
    }
    
    initialLoadDone.current = true;
  }

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
    setMinimumDaysDialog
  };
};
