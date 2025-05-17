
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { ProfileData } from "@/types/profile";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdminProfilesActionsProps {
  profiles: ProfileData[];
  bulkActionLoading: boolean;
  handleBulkWaitingChange: (value: boolean) => Promise<void>;
  handleBulkClosedChange: (value: boolean) => Promise<void>;
}

export const AdminProfilesActions: React.FC<AdminProfilesActionsProps> = ({
  profiles,
  bulkActionLoading,
  handleBulkWaitingChange,
  handleBulkClosedChange,
}) => {
  const [globalSettingsLoading, setGlobalSettingsLoading] = React.useState(false);
  const [hideWednesdayReservations, setHideWednesdayReservations] = React.useState(false);
  const [hideRdvPage, setHideRdvPage] = React.useState(false);
  
  // Charger les paramètres globaux au chargement du composant
  React.useEffect(() => {
    const fetchGlobalSettings = async () => {
      try {
        const { data: settings, error } = await supabase
          .from("global_settings")
          .select("hide_wednesday_reservations, hide_rdv_page")
          .single();
          
        if (error && error.code !== "PGRST116") { // PGRST116 est "no rows returned"
          console.error("Erreur lors du chargement des paramètres globaux:", error);
          toast.error("Erreur lors du chargement des paramètres globaux");
          return;
        }
        
        if (settings) {
          setHideWednesdayReservations(settings.hide_wednesday_reservations);
          setHideRdvPage(settings.hide_rdv_page);
        } else {
          // Créer les paramètres globaux s'ils n'existent pas
          await supabase
            .from("global_settings")
            .insert([{ hide_wednesday_reservations: false, hide_rdv_page: false }]);
        }
      } catch (err) {
        console.error("Exception lors du chargement des paramètres globaux:", err);
        toast.error("Erreur lors du chargement des paramètres globaux");
      }
    };
    
    fetchGlobalSettings();
  }, []);
  
  // Mettre à jour les paramètres globaux
  const updateGlobalSettings = async (settings: { 
    hide_wednesday_reservations?: boolean; 
    hide_rdv_page?: boolean; 
  }) => {
    setGlobalSettingsLoading(true);
    try {
      const { error } = await supabase
        .from("global_settings")
        .update(settings)
        .eq("id", "00000000-0000-0000-0000-000000000000")
        .not("id", "is", null);
        
      if (error) {
        console.error("Erreur lors de la mise à jour des paramètres globaux:", error);
        toast.error("Erreur lors de la mise à jour des paramètres globaux");
        return;
      }
      
      toast.success("Paramètres globaux mis à jour avec succès");
    } catch (err) {
      console.error("Exception lors de la mise à jour des paramètres globaux:", err);
      toast.error("Erreur lors de la mise à jour des paramètres globaux");
    } finally {
      setGlobalSettingsLoading(false);
    }
  };
  
  const handleWednesdayVisibilityChange = (isVisible: boolean) => {
    setHideWednesdayReservations(!isVisible);
    updateGlobalSettings({ hide_wednesday_reservations: !isVisible });
  };
  
  const handleRdvVisibilityChange = (isVisible: boolean) => {
    setHideRdvPage(!isVisible);
    updateGlobalSettings({ hide_rdv_page: !isVisible });
  };

  return (
    <div className="space-y-4 mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Paramètres globaux de visibilité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="global-wednesday-visibility" className="flex flex-col space-y-1">
              <span>Page Mercredis</span>
              <span className="text-sm text-muted-foreground">Activer/désactiver l'accès pour tous les utilisateurs</span>
            </Label>
            <Switch 
              id="global-wednesday-visibility" 
              checked={!hideWednesdayReservations}
              onCheckedChange={handleWednesdayVisibilityChange}
              disabled={globalSettingsLoading}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <Label htmlFor="global-rdv-visibility" className="flex flex-col space-y-1">
              <span>Page RDV</span>
              <span className="text-sm text-muted-foreground">Activer/désactiver l'accès pour tous les utilisateurs</span>
            </Label>
            <Switch 
              id="global-rdv-visibility" 
              checked={!hideRdvPage}
              onCheckedChange={handleRdvVisibilityChange}
              disabled={globalSettingsLoading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions de masse</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Mettre tous en attente</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Mettre tous les profils en attente</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action va mettre tous les profils ({profiles.length}) en attente. Êtes-vous sûr ?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => handleBulkWaitingChange(true)} 
                  disabled={bulkActionLoading}
                >
                  Confirmer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Enlever tous de l'attente</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Enlever tous les profils de l'attente</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action va enlever tous les profils ({profiles.length}) de l'attente. Êtes-vous sûr ?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => handleBulkWaitingChange(false)} 
                  disabled={bulkActionLoading}
                >
                  Confirmer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Fermer tous</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Fermer tous les profils</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action va fermer tous les profils ({profiles.length}). Êtes-vous sûr ?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => handleBulkClosedChange(true)} 
                  disabled={bulkActionLoading}
                >
                  Confirmer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Ouvrir tous</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Ouvrir tous les profils</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action va ouvrir tous les profils ({profiles.length}). Êtes-vous sûr ?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => handleBulkClosedChange(false)} 
                  disabled={bulkActionLoading}
                >
                  Confirmer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};
