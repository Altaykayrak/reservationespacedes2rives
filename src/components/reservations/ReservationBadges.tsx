interface ReservationBadgesProps {
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

export const ReservationBadges = ({ withoutMeal, earlyDropoff }: ReservationBadgesProps) => {
  console.log('ReservationBadges props:', { withoutMeal, earlyDropoff });
  
  return (
    <div className="flex flex-wrap gap-2">
      {withoutMeal && (
        <div className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
          Sans repas
        </div>
      )}
      {earlyDropoff && (
        <div className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
          Accueil avant 8h30
        </div>
      )}
    </div>
  );
};