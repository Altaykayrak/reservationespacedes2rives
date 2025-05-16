
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export interface GlobalSettings {
  hide_wednesday_reservations: boolean;
  hide_rdv_page: boolean;
}

export const GlobalMenuSettings = () => {
  const [settings, setSettings] = useState<GlobalSettings>({
    hide_wednesday_reservations: false,
    hide_rdv_page: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("global_settings")
        .select("*")
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "no rows returned" error, which is fine for first run
        console.error("Error loading settings:", error);
        toast.error("Erreur lors du chargement des paramètres");
      } else if (data) {
        setSettings({
          hide_wednesday_reservations: data.hide_wednesday_reservations || false,
          hide_rdv_page: data.hide_rdv_page || false,
        });
      }
    } catch (error) {
      console.error("Exception loading settings:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof GlobalSettings, value: boolean) => {
    setSaving(true);
    
    try {
      // First check if we need to insert or update
      const { data: existing } = await supabase
        .from("global_settings")
        .select("id")
        .limit(1);
      
      let error;
      
      if (existing && existing.length > 0) {
        // Update existing record
        const { error: updateError } = await supabase
          .from("global_settings")
          .update({ [key]: value })
          .eq("id", existing[0].id);
        
        error = updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from("global_settings")
          .insert([{ [key]: value }]);
        
        error = insertError;
      }

      if (error) {
        console.error("Error updating setting:", error);
        toast.error(`Erreur lors de la mise à jour: ${error.message}`);
        return;
      }

      // Update local state
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));
      
      toast.success("Paramètre mis à jour avec succès");
    } catch (error) {
      console.error("Exception updating setting:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Paramètres Globaux</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Paramètres Globaux
          <Badge variant="outline" className="ml-2 text-xs font-normal">
            Affecte tous les utilisateurs
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="hide-wednesday" className="font-medium">
                Masquer les réservations mercredis
              </Label>
              <p className="text-sm text-muted-foreground">
                Masque la page "/wednesday-reservations" dans les menus pour tous les utilisateurs
              </p>
            </div>
            <Switch
              id="hide-wednesday"
              checked={settings.hide_wednesday_reservations}
              onCheckedChange={(checked) => updateSetting("hide_wednesday_reservations", checked)}
              disabled={saving}
            />
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="hide-rdv" className="font-medium">
                Masquer la page RDV Inscription
              </Label>
              <p className="text-sm text-muted-foreground">
                Masque la page "/rdv" dans les menus pour tous les utilisateurs
              </p>
            </div>
            <Switch
              id="hide-rdv"
              checked={settings.hide_rdv_page}
              onCheckedChange={(checked) => updateSetting("hide_rdv_page", checked)}
              disabled={saving}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
