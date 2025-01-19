import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ParticipantsInputsProps {
  maxParticipantsKindergarten: string;
  maxParticipantsPrimary: string;
  maxParticipantsTeen: string;
  setMaxParticipantsKindergarten: (value: string) => void;
  setMaxParticipantsPrimary: (value: string) => void;
  setMaxParticipantsTeen: (value: string) => void;
}

const ParticipantsInputs = ({
  maxParticipantsKindergarten,
  maxParticipantsPrimary,
  maxParticipantsTeen,
  setMaxParticipantsKindergarten,
  setMaxParticipantsPrimary,
  setMaxParticipantsTeen,
}: ParticipantsInputsProps) => {
  return (
    <>
      <div>
        <Label htmlFor="maxParticipantsKindergarten">
          Nombre maximum de participants (Maternelle)
        </Label>
        <Input
          id="maxParticipantsKindergarten"
          type="number"
          value={maxParticipantsKindergarten}
          onChange={(e) => setMaxParticipantsKindergarten(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="maxParticipantsPrimary">
          Nombre maximum de participants (Primaire)
        </Label>
        <Input
          id="maxParticipantsPrimary"
          type="number"
          value={maxParticipantsPrimary}
          onChange={(e) => setMaxParticipantsPrimary(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="maxParticipantsTeen">
          Nombre maximum de participants (Adolescent)
        </Label>
        <Input
          id="maxParticipantsTeen"
          type="number"
          value={maxParticipantsTeen}
          onChange={(e) => setMaxParticipantsTeen(e.target.value)}
        />
      </div>
    </>
  );
};

export default ParticipantsInputs;