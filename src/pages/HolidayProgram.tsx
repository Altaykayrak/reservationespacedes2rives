import { Calendar, Mail, Facebook } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { EmptyHolidayState } from "@/components/reservations/holiday/EmptyHolidayState";
const HolidayProgram = () => {
  return <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <EmptyHolidayState message="Programme des vacances à venir" subtitle="Le programme des vacances n'est pas encore disponible. Vous serez informés par email ou sur notre page Facebook dès sa mise en ligne." icon="calendar" className="max-w-2xl mx-auto">
          
        </EmptyHolidayState>
      </div>
    </>;
};
export default HolidayProgram;