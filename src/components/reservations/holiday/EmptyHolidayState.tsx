
import { Calendar, Info } from "lucide-react";

interface EmptyHolidayStateProps {
  message: string;
  subtitle: string;
  icon?: "calendar" | "info";
}

export const EmptyHolidayState = ({ 
  message, 
  subtitle, 
  icon = "calendar" 
}: EmptyHolidayStateProps) => {
  return (
    <div className="p-8 border rounded-lg bg-blue-50 shadow-sm">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="p-3 bg-blue-100 rounded-full">
          {icon === "calendar" ? (
            <Calendar className="h-8 w-8 text-blue-600" />
          ) : (
            <Info className="h-8 w-8 text-blue-600" />
          )}
        </div>
        <h2 className="text-xl font-semibold text-gray-800">
          {message}
        </h2>
        <p className="text-gray-600 max-w-2xl">
          {subtitle}
        </p>
      </div>
    </div>
  );
};
