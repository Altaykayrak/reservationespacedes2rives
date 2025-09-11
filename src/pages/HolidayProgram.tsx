import { Calendar, Mail, Facebook } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { EmptyHolidayState } from "@/components/reservations/holiday/EmptyHolidayState";

const HolidayProgram = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <EmptyHolidayState
          message="Programme des vacances à venir"
          subtitle="Le programme des vacances n'est pas encore disponible. Vous serez informés par email ou sur notre page Facebook dès sa mise en ligne."
          icon="calendar"
          className="max-w-2xl mx-auto"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>Notification par email</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Facebook className="h-4 w-4" />
              <span>Suivez-nous sur Facebook</span>
            </div>
          </div>
        </EmptyHolidayState>
      </div>
    </>
  );
};

export default HolidayProgram;