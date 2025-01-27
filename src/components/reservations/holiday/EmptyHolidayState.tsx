import { Calendar } from "lucide-react";

interface EmptyHolidayStateProps {
  message: string;
  subtitle: string;
}

export const EmptyHolidayState = ({ message, subtitle }: EmptyHolidayStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
      <Calendar className="h-12 w-12 text-muted-foreground" />
      <div>
        <h3 className="font-semibold">{message}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
};