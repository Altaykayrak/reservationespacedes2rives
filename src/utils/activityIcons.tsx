import { 
  BookOpen, 
  Paintbrush, 
  Gamepad, 
  Music, 
  TreePine, 
  Theater, 
  Bot, 
  Camera, 
  Mountain, 
  Waves,
  Trophy,
  Film,
  Podcast,
  Dices
} from "lucide-react";

export const getActivityIcon = (activity: string) => {
  if (activity.toLowerCase().includes('peinture')) return <Paintbrush className="h-4 w-4 inline-block mr-1" />;
  if (activity.toLowerCase().includes('jeux')) return <Gamepad className="h-4 w-4 inline-block mr-1" />;
  if (activity.toLowerCase().includes('danse') || activity.toLowerCase().includes('musica')) return <Music className="h-4 w-4 inline-block mr-1" />;
  if (activity.toLowerCase().includes('jardin')) return <TreePine className="h-4 w-4 inline-block mr-1" />;
  if (activity.toLowerCase().includes('marionnettes') || activity.toLowerCase().includes('spectacle') || activity.toLowerCase().includes('théâtre')) return <Theater className="h-4 w-4 inline-block mr-1" />;
  if (activity.toLowerCase().includes('robot')) return <Bot className="h-4 w-4 inline-block mr-1" />;
  if (activity.toLowerCase().includes('photo')) return <Camera className="h-4 w-4 inline-block mr-1" />;
  if (activity.toLowerCase().includes('accrobranche')) return <Mountain className="h-4 w-4 inline-block mr-1" />;
  if (activity.toLowerCase().includes("d'eau") || activity.toLowerCase().includes('plage')) return <Waves className="h-4 w-4 inline-block mr-1" />;
  if (activity.toLowerCase().includes('concours') || activity.toLowerCase().includes('tournoi')) return <Trophy className="h-4 w-4 inline-block mr-1" />;
  if (activity.toLowerCase().includes('cinéma')) return <Film className="h-4 w-4 inline-block mr-1" />;
  if (activity.toLowerCase().includes('podcast')) return <Podcast className="h-4 w-4 inline-block mr-1" />;
  if (activity.toLowerCase().includes('jeu de rôle')) return <Dices className="h-4 w-4 inline-block mr-1" />;
  return <BookOpen className="h-4 w-4 inline-block mr-1" />; // default icon
};