
import { BookOpen, Calendar, Info } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";

const HolidayProgram = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-2 mb-8">
          <BookOpen className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Programme Vacances</h1>
        </div>

        <div className="p-8 border rounded-lg bg-blue-50 shadow-sm">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Info className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Le programme sera disponible dans quelques semaines.
            </h2>
            <p className="text-gray-600 max-w-2xl">
              Vous serez notifiée de sa mise en ligne par e-mail et via notre page Facebook.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default HolidayProgram;
