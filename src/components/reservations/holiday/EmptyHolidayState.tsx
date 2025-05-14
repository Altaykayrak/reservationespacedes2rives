
import { Calendar, Info, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface EmptyHolidayStateProps {
  message: string;
  subtitle: string;
  icon?: "calendar" | "info" | "error";
  className?: string;
  children?: ReactNode;
}

export const EmptyHolidayState = ({ 
  message, 
  subtitle, 
  icon = "calendar",
  className,
  children
}: EmptyHolidayStateProps) => {
  return (
    <div className={cn("p-8 border rounded-lg bg-blue-50 shadow-sm", className)}>
      <div className="flex flex-col items-center text-center gap-4">
        <div className="p-3 bg-blue-100 rounded-full">
          {icon === "calendar" ? (
            <Calendar className="h-8 w-8 text-blue-600" />
          ) : icon === "error" ? (
            <AlertCircle className="h-8 w-8 text-red-600" />
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
        {children}
      </div>
    </div>
  );
};
