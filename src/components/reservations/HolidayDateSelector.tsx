
--- a/src/components/reservations/HolidayDateSelector.tsx
+++ b/src/components/reservations/HolidayDateSelector.tsx
@@
-interface HolidayDateSelectorProps {
+interface HolidayDateSelectorProps {
   selectedDates: DateOption[];
   handleDateToggle: (date: Date) => void;
   handleOptionChange: (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => void;
   isDateAlreadyReserved: (date: Date) => boolean;
   periodId: string;
-  selectedChild: string;
-  setSelectedDates: (dates: DateOption[]) => void;
+  selectedChild: string;
+  setSelectedDates: (dates: DateOption[]) => void;
+  /** true quand on est dans la page Club Ado */
+  isTeenPage: boolean;
 }
 
 export const HolidayDateSelector = ({
   selectedDates,
   handleDateToggle,
   handleOptionChange,
   isDateAlreadyReserved,
   periodId,
-  selectedChild,
-  setSelectedDates
+  selectedChild,
+  setSelectedDates,
+  isTeenPage
 }: HolidayDateSelectorProps) => {
   const { data: holidayPeriod } = useQuery({ … });
 
   const { childInfo, isTeenClass } = useHolidayClassification(selectedChild);
@@
-      {(window.location.pathname === "/teenholiday-reservations" || 
-        … ) && isTeenClass ? (
+      {isTeenPage && isTeenClass ? (
         <TeenClassDateSelector
@@
       ) : (
         <WorkdayDateSelector
           selectedDates={selectedDates}
           handleDateToggle={handleDateToggle}
           handleOptionChange={handleOptionChange}
           isDateAlreadyReserved={isDateAlreadyReserved}
           periodId={periodId}
         />
       )}
