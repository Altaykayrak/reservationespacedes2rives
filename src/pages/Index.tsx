
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useGlobalSettings } from "@/hooks/useGlobalSettings";
import { Navbar } from "@/components/ui/navbar";
import { Link } from "react-router-dom";
import { CalendarDays, BookUser, School, Info } from "lucide-react";

// Default export function
export default function Index() {
  const { globalSettings, loading } = useGlobalSettings();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar />
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6 tracking-tight">Bienvenue dans votre espace</h1>
        <p className="mb-8 text-lg text-muted-foreground">Accédez à vos services et gérez vos réservations facilement.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xl">
                <CalendarDays className="h-5 w-5 text-primary" />
                Réservations Vacances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Réservez les périodes de vacances pour vos enfants.</p>
              <Button asChild className="w-full">
                <Link to="/holiday-reservations">Accéder</Link>
              </Button>
            </CardContent>
          </Card>

          {!loading && !globalSettings.hide_wednesday_reservations && (
            <Card className="hover:shadow-lg transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  Réservations Mercredis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Gérez les réservations pour les mercredis.</p>
                <Button asChild className="w-full">
                  <Link to="/wednesday-reservations">Accéder</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {!loading && !globalSettings.hide_rdv_page && (
            <Card className="hover:shadow-lg transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BookUser className="h-5 w-5 text-primary" />
                  Rendez-vous
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Prenez rendez-vous avec notre équipe.</p>
                <Button asChild className="w-full">
                  <Link to="/rdv">Accéder</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="hover:shadow-lg transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xl">
                <School className="h-5 w-5 text-primary" />
                Vos Enfants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Gérez les informations de vos enfants.</p>
              <Button asChild className="w-full">
                <Link to="/children">Accéder</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Info className="h-5 w-5 text-primary" />
                Tarifs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Consultez nos grilles tarifaires.</p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/prices">Voir les tarifs</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
