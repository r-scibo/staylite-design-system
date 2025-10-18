import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  isSameMonth,
  isSameDay,
  isAfter,
  isBefore,
  startOfDay,
  addDays,
  isWithinInterval,
} from "date-fns";
import { it } from "date-fns/locale";

interface AirbnbStyleCalendarProps {
  mode?: "single" | "range" | "multiple";
  selected?: Date | Date[] | { from: Date; to?: Date };
  onSelect?: (date: Date | Date[] | { from: Date; to?: Date } | undefined) => void;
  disabled?: (date: Date) => boolean;
  modifiers?: {
    [key: string]: (date: Date) => boolean;
  };
  modifiersClassNames?: {
    [key: string]: string;
  };
  minDate?: Date;
  numberOfMonths?: number;
}

export function AirbnbStyleCalendar({
  mode = "single",
  selected,
  onSelect,
  disabled,
  modifiers = {},
  modifiersClassNames = {},
  minDate = new Date(),
  numberOfMonths = 2,
}: AirbnbStyleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));

  const months = Array.from({ length: numberOfMonths }, (_, i) =>
    addMonths(currentMonth, i)
  );

  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];

  const isDateDisabled = (date: Date) => {
    if (isBefore(startOfDay(date), startOfDay(minDate))) return true;
    if (disabled) return disabled(date);
    return false;
  };

  const isDateSelected = (date: Date) => {
    if (!selected) return false;

    if (mode === "single") {
      return isSameDay(date, selected as Date);
    }

    if (mode === "multiple") {
      return (selected as Date[]).some((d) => isSameDay(d, date));
    }

    if (mode === "range") {
      const range = selected as { from: Date; to?: Date };
      if (!range.from) return false;
      if (!range.to) return isSameDay(date, range.from);
      return isWithinInterval(date, { start: range.from, end: range.to });
    }

    return false;
  };

  const isRangeStart = (date: Date) => {
    if (mode !== "range" || !selected) return false;
    const range = selected as { from: Date; to?: Date };
    return range.from && isSameDay(date, range.from);
  };

  const isRangeEnd = (date: Date) => {
    if (mode !== "range" || !selected) return false;
    const range = selected as { from: Date; to?: Date };
    return range.to && isSameDay(date, range.to);
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;

    if (mode === "single") {
      onSelect?.(date);
    } else if (mode === "multiple") {
      const currentDates = (selected as Date[]) || [];
      const isAlreadySelected = currentDates.some((d) => isSameDay(d, date));
      
      if (isAlreadySelected) {
        onSelect?.(currentDates.filter((d) => !isSameDay(d, date)));
      } else {
        onSelect?.([...currentDates, date]);
      }
    } else if (mode === "range") {
      const range = (selected as { from: Date; to?: Date }) || { from: date };
      
      if (!range.from || (range.from && range.to)) {
        onSelect?.({ from: date, to: undefined });
      } else if (isBefore(date, range.from)) {
        onSelect?.({ from: date, to: range.from });
      } else {
        onSelect?.({ from: range.from, to: date });
      }
    }
  };

  const getDateClassNames = (date: Date) => {
    const classes = [
      "h-10 w-10 flex items-center justify-center rounded-full text-sm cursor-pointer transition-all",
    ];

    if (isDateDisabled(date)) {
      classes.push("text-muted-foreground/30 cursor-not-allowed line-through");
    } else if (isDateSelected(date)) {
      if (mode === "range") {
        if (isRangeStart(date) || isRangeEnd(date)) {
          classes.push("bg-foreground text-background font-semibold");
        } else {
          classes.push("bg-muted text-foreground");
        }
      } else {
        classes.push("bg-foreground text-background font-semibold");
      }
    } else {
      classes.push("hover:bg-muted");
    }

    // Apply custom modifiers
    Object.entries(modifiers).forEach(([key, checkFn]) => {
      if (checkFn(date) && modifiersClassNames[key]) {
        classes.push(modifiersClassNames[key]);
      }
    });

    return classes.join(" ");
  };

  return (
    <div className="w-full">
      {/* Navigation */}
      <div className={cn(
        "flex items-center justify-between mb-6",
        numberOfMonths === 1 && "justify-center gap-12"
      )}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
          className="h-10 w-10 rounded-full"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className={cn(
          "flex gap-12",
          numberOfMonths === 1 && "justify-center"
        )}>
          {months.map((month) => (
            <h3 key={month.toISOString()} className="text-lg font-semibold min-w-[140px] text-center">
              {format(month, "MMMM yyyy", { locale: it })}
            </h3>
          ))}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="h-10 w-10 rounded-full"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className={cn(
        "flex gap-8",
        numberOfMonths === 1 && "justify-center"
      )}>
        {months.map((month) => {
          const daysInMonth = eachDayOfInterval({
            start: startOfMonth(month),
            end: endOfMonth(month),
          });

          const firstDayOfMonth = startOfMonth(month).getDay();
          const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

          return (
            <div key={month.toISOString()} className="flex-1 min-w-[280px]">
              {/* Week days header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day, idx) => (
                  <div
                    key={`weekday-${idx}`}
                    className="h-10 flex items-center justify-center text-xs font-medium text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for offset */}
                {Array.from({ length: offset }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-10" />
                ))}

                {/* Day cells */}
                {daysInMonth.map((date) => (
                  <button
                    key={date.toISOString()}
                    onClick={() => handleDateClick(date)}
                    disabled={isDateDisabled(date)}
                    className={getDateClassNames(date)}
                    type="button"
                  >
                    {format(date, "d")}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
