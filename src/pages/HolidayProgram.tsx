import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  Baby, 
  User, 
  Users, 
  Calendar, 
  Paintbrush, 
  Gamepad, 
  Music, 
  Tree, 
  Theater, 
  Robot, 
  Camera, 
  Mountain, 
  Waves,
  Trophy,
  Film,
  Podcast,
  Dices
} from "lucide-react";
import { Navbar } from "@/components/ui/navbar";

const HolidayProgram = () => {
  const getActivityIcon = (activity: string) => {
    if (activity.toLowerCase().includes('peinture')) return <Paintbrush className="h-4 w-4 inline-block mr-1" />;
    if (activity.toLowerCase().includes('jeux')) return <Gamepad className="h-4 w-4 inline-block mr-1" />;
    if (activity.toLowerCase().includes('danse') || activity.toLowerCase().includes('musica')) return <Music className="h-4 w-4 inline-block mr-1" />;
    if (activity.toLowerCase().includes('jardin')) return <Tree className="h-4 w-4 inline-block mr-1" />;
    if (activity.toLowerCase().includes('marionnettes') || activity.toLowerCase().includes('spectacle') || activity.toLowerCase().includes('théâtre')) return <Theater className="h-4 w-4 inline-block mr-1" />;
    if (activity.toLowerCase().includes('robot')) return <Robot className="h-4 w-4 inline-block mr-1" />;
    if (activity.toLowerCase().includes('photo')) return <Camera className="h-4 w-4 inline-block mr-1" />;
    if (activity.toLowerCase().includes('accrobranche')) return <Mountain className="h-4 w-4 inline-block mr-1" />;
    if (activity.toLowerCase().includes("d'eau") || activity.toLowerCase().includes('plage')) return <Waves className="h-4 w-4 inline-block mr-1" />;
    if (activity.toLowerCase().includes('concours') || activity.toLowerCase().includes('tournoi')) return <Trophy className="h-4 w-4 inline-block mr-1" />;
    if (activity.toLowerCase().includes('cinéma')) return <Film className="h-4 w-4 inline-block mr-1" />;
    if (activity.toLowerCase().includes('podcast')) return <Podcast className="h-4 w-4 inline-block mr-1" />;
    if (activity.toLowerCase().includes('jeu de rôle')) return <Dices className="h-4 w-4 inline-block mr-1" />;
    return <BookOpen className="h-4 w-4 inline-block mr-1" />; // default icon
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-2 mb-8">
          <BookOpen className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Programme Vacances</h1>
        </div>

        {/* Semaine 1 */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="h-5 w-5" />
            <h2 className="text-2xl font-semibold">Semaine 1 : Lundi 07 avril 2025 - Vendredi 11 avril 2025</h2>
          </div>

          {/* Jours de la semaine */}
          {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"].map((jour) => (
            <Card key={jour} className="mb-6">
              <CardHeader>
                <CardTitle>{jour}</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-6">
                {/* Maternelle */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Baby className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold">Maternelle</h3>
                  </div>
                  <div className="space-y-2">
                    {jour === "Lundi" && (
                      <>
                        <p>{getActivityIcon("peinture")}<span className="font-medium">Matin :</span> Atelier créatif (peinture printanière)</p>
                        <p>{getActivityIcon("jeux")}<span className="font-medium">Après-midi :</span> Jeux moteurs en intérieur (parcours de motricité)</p>
                      </>
                    )}
                    {jour === "Mardi" && (
                      <>
                        <p><span className="font-medium">Matin :</span> Comptines et danse</p>
                        <p><span className="font-medium">Après-midi :</span> Sortie au parc animalier</p>
                      </>
                    )}
                    {jour === "Mercredi" && (
                      <>
                        <p><span className="font-medium">Matin :</span> Atelier pâte à modeler (créations florales)</p>
                        <p><span className="font-medium">Après-midi :</span> Spectacle de marionnettes (créé par les animateurs)</p>
                      </>
                    )}
                    {jour === "Jeudi" && (
                      <>
                        <p><span className="font-medium">Matin :</span> Ateliers sensoriels (exploration des sons et textures)</p>
                        <p><span className="font-medium">Après-midi :</span> Atelier jardinage (planter des fleurs)</p>
                      </>
                    )}
                    {jour === "Vendredi" && (
                      <>
                        <p><span className="font-medium">Matin :</span> Histoires interactives avec peluches et accessoires</p>
                        <p><span className="font-medium">Après-midi :</span> Fête des couleurs (peinture collective)</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Primaire */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold">Primaire</h3>
                  </div>
                  <div className="space-y-2">
                    {jour === "Lundi" && (
                      <>
                        <p>{getActivityIcon("scientifique")}<span className="font-medium">Matin :</span> Atelier scientifique (fabriquer un volcan)</p>
                        <p>{getActivityIcon("jeux")}<span className="font-medium">Après-midi :</span> Tournoi de jeux de société</p>
                      </>
                    )}
                    {jour === "Mardi" && (
                      <>
                        <p><span className="font-medium">Matin :</span> Atelier robotique (initiation)</p>
                        <p><span className="font-medium">Après-midi :</span> Sortie au parc animalier</p>
                      </>
                    )}
                    {jour === "Mercredi" && (
                      <>
                        <p><span className="font-medium">Matin :</span> Atelier d'écriture créative (poèmes sur le printemps)</p>
                        <p><span className="font-medium">Après-midi :</span> Course d'orientation au centre</p>
                      </>
                    )}
                    {jour === "Jeudi" && (
                      <>
                        <p><span className="font-medium">Matin :</span> Construction de cabanes en extérieur</p>
                        <p><span className="font-medium">Après-midi :</span> Jeux d'eau (selon la météo)</p>
                      </>
                    )}
                    {jour === "Vendredi" && (
                      <>
                        <p><span className="font-medium">Matin :</span> Atelier cuisine (gâteaux aux fruits de saison)</p>
                        <p><span className="font-medium">Après-midi :</span> Grand jeu de piste au centre</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Adolescents */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-5 w-5 text-purple-500" />
                    <h3 className="font-semibold">Adolescents</h3>
                  </div>
                  <div className="space-y-2">
                    {jour === "Lundi" && (
                      <>
                        <p>{getActivityIcon("escape")}<span className="font-medium">Matin :</span> Escape game au centre</p>
                        <p>{getActivityIcon("peinture")}<span className="font-medium">Après-midi :</span> Atelier DIY (customisation de t-shirts)</p>
                      </>
                    )}
                    {jour === "Mardi" && (
                      <>
                        <p><span className="font-medium">Matin :</span> Débat et atelier cinéma (écrire un court métrage)</p>
                        <p><span className="font-medium">Après-midi :</span> Tournoi de sports collectifs (football, basket)</p>
                      </>
                    )}
                    {jour === "Mercredi" && (
                      <>
                        <p><span className="font-medium">Matin :</span> Tournoi de jeux vidéo en réseau</p>
                        <p><span className="font-medium">Après-midi :</span> Atelier photo (initiation à la photographie)</p>
                      </>
                    )}
                    {jour === "Jeudi" && (
                      <p><span className="font-medium">Journée complète :</span> Sortie au parc d'aventure (accrobranche, tyrolienne)</p>
                    )}
                    {jour === "Vendredi" && (
                      <>
                        <p><span className="font-medium">Matin :</span> Concours de talents (chant, danse, humour)</p>
                        <p><span className="font-medium">Après-midi :</span> Soirée cinéma avec popcorn</p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Semaine 2 */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="h-5 w-5" />
            <h2 className="text-2xl font-semibold">Semaine 2 : Lundi 14 avril 2025 - Vendredi 18 avril 2025</h2>
          </div>

          {/* Jours de la semaine */}
          {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"].map((jour) => (
            <Card key={`semaine2-${jour}`} className="mb-6">
              <CardHeader>
                <CardTitle>{jour}</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-6">
                {/* Maternelle */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Baby className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold">Maternelle</h3>
                  </div>
                  <div className="space-y-2">
                    {jour === "Lundi" && (
                      <>
                        <p><span className="font-medium">Matin :</span> Ateliers coloriage et origami</p>
                        <p><span className="font-medium">Après-midi :</span> Jeux musicaux et dansants</p>
                      </>
                    )}
                    {jour === "Mardi" && (
                      <>
                        <p><span className="font-medium">Matin :</span> Histoires autour des animaux</p>
                        <p><span className="font-medium">Après-midi :</span> Sortie au cinéma (film d'animation)</p>
                      </>
                    )}
                    {jour === "Mercredi" && (
                      <>
                        <p><span className="font-medium">Matin :</span> Parcours de psychomotricité</p>
                        <p><span className="font-medium">Après-midi :</span> Atelier de collage (fleurs et papillons)</p>
                      </>
                    )}
                    {jour === "Jeudi" && (
                      <>
                        <p><span className="font-medium">Matin :</span> Jeux d'eau (bassines, arrosoirs, etc.)</p>
                        <p><span className="font-medium">Après-midi :</span> Création d'animaux en pâte à sel</p>
                      </>
                    )}
                    {jour === "Vendredi" && (
                      <>
                        <p><span className="font-medium">Matin :</span> Atelier peinture avec les mains</p>
                        <p><span className="font-medium">Après-midi :</span> Mini-kermesse avec stands ludiques</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Primaire */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold">Primaire</h3>
                  </div>
                  <div className="space-y-2">
                    {jour === "Lundi" && (
                      <>
                        <p><span className="font-medium">Matin :</span> Expériences scientifiques (bulles géantes)</p>
                        <p><span className="font-medium">Après-midi :</span> Concours d'arts plastiques</p>
                      </>
                    )}
                    {jour === "Mardi" && (
                      <>
                        <p><span className="font-medium">Matin :</span> Atelier jeux d'échecs</p>
                        <p><span className="font-medium">Après-midi :</span> Sortie au cinéma (film adapté)</p>
                      </>
                    )}
                    {jour === "Mercredi" && (
                      <>
                        <p><span className="font-medium">Matin :</span> Atelier BD (création d'une courte histoire)</p>
                        <p><span className="font-medium">Après-midi :</span> Atelier théâtre (improvisations)</p>
                      </>
                    )}
                    {jour === "Jeudi" && (
                      <>
                        <p><span className="font-medium">Matin :</span> Jeux de coopération en extérieur</p>
                        <p><span className="font-medium">Après-midi :</span> Atelier sciences naturelles (explorer la faune locale)</p>
                      </>
                    )}
                    {jour === "Vendredi" && (
                      <>
                        <p><span className="font-medium">Matin :</span> Grand quiz de culture générale</p>
                        <p><span className="font-medium">Après-midi :</span> Kermesse avec remise des prix des activités</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Adolescents */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-5 w-5 text-purple-500" />
                    <h3 className="font-semibold">Adolescents</h3>
                  </div>
                  <div className="space-y-2">
                    {jour === "Lundi" && (
                      <>
                        <p><span className="font-medium">Matin :</span> Création de podcast</p>
                        <p><span className="font-medium">Après-midi :</span> Sports de raquettes (badminton, ping-pong)</p>
                      </>
                    )}
                    {jour === "Mardi" && (
                      <>
                        <p><span className="font-medium">Matin :</span> Création d'un jeu de rôle grandeur nature</p>
                        <p><span className="font-medium">Après-midi :</span> Match sportif contre une autre structure</p>
                      </>
                    )}
                    {jour === "Mercredi" && (
                      <>
                        <p><span className="font-medium">Matin :</span> Atelier design (initiation au graphisme)</p>
                        <p><span className="font-medium">Après-midi :</span> Escape game géant au centre</p>
                      </>
                    )}
                    {jour === "Jeudi" && (
                      <p><span className="font-medium">Journée complète :</span> Sortie à la plage ou au lac (activités nautiques)</p>
                    )}
                    {jour === "Vendredi" && (
                      <>
                        <p><span className="font-medium">Matin :</span> Réalisation d'un reportage vidéo (souvenirs des vacances)</p>
                        <p><span className="font-medium">Après-midi :</span> Barbecue festif et soirée dansante</p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default HolidayProgram;
