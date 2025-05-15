--- a/src/components/reservations/holiday/WorkdayDateSelector.tsx
+++ b/src/components/reservations/holiday/WorkdayDateSelector.tsx
@@
-import { ScrollArea } from "@/components/ui/scroll-area";
+import { ScrollArea } from "@/components/ui/scroll-area";
 import { DateItem } from "./DateItem";
 import { useHolidayPeriodContext } from "./HolidayPeriodContext";
 import { format } from "date-fns";
+import HolidaySpotsBadge from "@/components/reservations/HolidaySpotsBadge";

@@ {periodDates.map(date => { … })}
-          return (
-            <DateItem 
-              key={dateStr} 
-              date={date} 
-              isSelected={isSelected} 
-              isReserved={isDateAlreadyReserved(date)} 
-              withoutMeal={selectedDate?.withoutMeal || false} 
-              earlyDropoff={selectedDate?.earlyDropoff || false} 
-              onDateToggle={() => handleDateToggle(date)} 
-              onOptionChange={(option, value) => handleOptionChange(date, option, value)} 
-              isTeenClass={false} 
-              periodId={periodId} 
-              childSchoolClass={childInfo?.school_class || ''}
-            />
-          );
+          return (
+            <div
+              key={dateStr}
+              className="flex items-center justify-between px-2 py-1 hover:bg-gray-50 rounded"
+            >
+              <DateItem
+                date={date}
+                isSelected={isSelected}
+                isReserved={isDateAlreadyReserved(date)}
+                withoutMeal={selectedDate?.withoutMeal || false}
+                earlyDropoff={selectedDate?.earlyDropoff || false}
+                onDateToggle={() => handleDateToggle(date)}
+                onOptionChange={(option, value) =>
+                  handleOptionChange(date, option, value)
+                }
+                isTeenClass={false}
+                periodId={periodId}
+                childSchoolClass={childInfo?.school_class || ""}
+              />
+              <HolidaySpotsBadge
+                periodId={periodId}
+                date={dateStr}
+                childSchoolClass={childInfo?.school_class || ""}
+              />
+            </div>
+          );
