import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface HolidayNameInputProps {
  name: string;
  currentYear: number;
  setName: (name: string) => void;
}

const HolidayNameInput = ({ name, currentYear, setName }: HolidayNameInputProps) => {
  return (
    <div>
      <Label htmlFor="name">Nom de la période</Label>
      <Input
        id="name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Exemple: vacances-hiver"
      />
      <p className="text-sm text-gray-500 mt-1">
        Le nom final sera: {currentYear}-{name}
      </p>
    </div>
  );
};

export default HolidayNameInput;