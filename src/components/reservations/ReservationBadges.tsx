interface ReservationBadgesProps {
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

export const ReservationBadges = ({ withoutMeal, earlyDropoff }: ReservationBadgesProps) => {
  return (
    <div className="flex flex-wrap gap-3 mt-2">
      {withoutMeal && (
        <div className="px-3 py-1.5 rounded-full bg-red-100 text-red-700">
          <span className="text-sm">Sans repas</span>
        </div>
      )}
      {earlyDropoff && (
        <div className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-700">
          <span className="text-sm">Accueil avant 8h30</span>
        </div>
      )}
    </div>
  );
};