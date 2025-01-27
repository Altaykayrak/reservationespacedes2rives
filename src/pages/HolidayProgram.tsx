import { BookOpen, Calendar } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { DaySchedule } from "@/components/holiday/DaySchedule";

const HolidayProgram = () => {
  const week1Activities = {
    Lundi: {
      maternelle: {
        morning: "Atelier créatif (peinture printanière)",
        afternoon: "Jeux moteurs en intérieur (parcours de motricité)"
      },
      primaire: {
        morning: "Atelier scientifique (fabriquer un volcan)",
        afternoon: "Tournoi de jeux de société"
      },
      adolescents: {
        morning: "Escape game au centre",
        afternoon: "Atelier DIY (customisation de t-shirts)"
      }
    },
    Mardi: {
      maternelle: {
        morning: "Comptines et danse",
        afternoon: "Sortie au parc animalier"
      },
      primaire: {
        morning: "Atelier robotique (initiation)",
        afternoon: "Sortie au parc animalier"
      },
      adolescents: {
        morning: "Débat et atelier cinéma (écrire un court métrage)",
        afternoon: "Tournoi de sports collectifs (football, basket)"
      }
    },
    Mercredi: {
      maternelle: {
        morning: "Atelier pâte à modeler (créations florales)",
        afternoon: "Spectacle de marionnettes (créé par les animateurs)"
      },
      primaire: {
        morning: "Atelier d'écriture créative (poèmes sur le printemps)",
        afternoon: "Course d'orientation au centre"
      },
      adolescents: {
        morning: "Tournoi de jeux vidéo en réseau",
        afternoon: "Atelier photo (initiation à la photographie)"
      }
    },
    Jeudi: {
      maternelle: {
        morning: "Ateliers sensoriels (exploration des sons et textures)",
        afternoon: "Atelier jardinage (planter des fleurs)"
      },
      primaire: {
        morning: "Construction de cabanes en extérieur",
        afternoon: "Jeux d'eau (selon la météo)"
      },
      adolescents: {
        fullDay: "Journée complète : Sortie au parc d'aventure (accrobranche, tyrolienne)"
      }
    },
    Vendredi: {
      maternelle: {
        morning: "Histoires interactives avec peluches et accessoires",
        afternoon: "Fête des couleurs (peinture collective)"
      },
      primaire: {
        morning: "Atelier cuisine (gâteaux aux fruits de saison)",
        afternoon: "Grand jeu de piste au centre"
      },
      adolescents: {
        morning: "Concours de talents (chant, danse, humour)",
        afternoon: "Soirée cinéma avec popcorn"
      }
    }
  };

  const week2Activities = {
    Lundi: {
      maternelle: {
        morning: "Ateliers coloriage et origami",
        afternoon: "Jeux musicaux et dansants"
      },
      primaire: {
        morning: "Expériences scientifiques (bulles géantes)",
        afternoon: "Concours d'arts plastiques"
      },
      adolescents: {
        morning: "Création de podcast",
        afternoon: "Sports de raquettes (badminton, ping-pong)"
      }
    },
    Mardi: {
      maternelle: {
        morning: "Histoires autour des animaux",
        afternoon: "Sortie au cinéma (film d'animation)"
      },
      primaire: {
        morning: "Atelier jeux d'échecs",
        afternoon: "Sortie au cinéma (film adapté)"
      },
      adolescents: {
        morning: "Création d'un jeu de rôle grandeur nature",
        afternoon: "Match sportif contre une autre structure"
      }
    },
    Mercredi: {
      maternelle: {
        morning: "Parcours de psychomotricité",
        afternoon: "Atelier de collage (fleurs et papillons)"
      },
      primaire: {
        morning: "Atelier BD (création d'une courte histoire)",
        afternoon: "Atelier théâtre (improvisations)"
      },
      adolescents: {
        morning: "Atelier design (initiation au graphisme)",
        afternoon: "Escape game géant au centre"
      }
    },
    Jeudi: {
      maternelle: {
        morning: "Jeux d'eau (bassines, arrosoirs, etc.)",
        afternoon: "Création d'animaux en pâte à sel"
      },
      primaire: {
        morning: "Jeux de coopération en extérieur",
        afternoon: "Atelier sciences naturelles (explorer la faune locale)"
      },
      adolescents: {
        fullDay: "Journée complète : Sortie à la plage ou au lac (activités nautiques)"
      }
    },
    Vendredi: {
      maternelle: {
        morning: "Atelier peinture avec les mains",
        afternoon: "Mini-kermesse avec stands ludiques"
      },
      primaire: {
        morning: "Grand quiz de culture générale",
        afternoon: "Kermesse avec remise des prix des activités"
      },
      adolescents: {
        morning: "Réalisation d'un reportage vidéo (souvenirs des vacances)",
        afternoon: "Barbecue festif et soirée dansante"
      }
    }
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
            <h2 className="text-2xl font-semibold">
              Semaine 1 : Lundi 07 avril 2025 - Vendredi 11 avril 2025
            </h2>
          </div>
          {Object.entries(week1Activities).map(([day, activities]) => (
            <DaySchedule key={day} day={day} activities={activities} />
          ))}
        </div>

        {/* Semaine 2 */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="h-5 w-5" />
            <h2 className="text-2xl font-semibold">
              Semaine 2 : Lundi 14 avril 2025 - Vendredi 18 avril 2025
            </h2>
          </div>
          {Object.entries(week2Activities).map(([day, activities]) => (
            <DaySchedule key={`semaine2-${day}`} day={day} activities={activities} />
          ))}
        </div>
      </div>
    </>
  );
};

export default HolidayProgram;
