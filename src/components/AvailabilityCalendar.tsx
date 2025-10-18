import { useState } from "react";
import { AirbnbStyleCalendar } from "./AirbnbStyleCalendar";
import { format, isBefore, startOfDay } from "date-fns";

interface AvailabilityDate {
  date: string;
  status: string;
  price_override: number | null;
}

interface AvailabilityCalendarProps {
  availability: AvailabilityDate[];
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  onCheckInChange: (date: Date | undefined) => void;
  onCheckOutChange: (date: Date | undefined) => void;
}

export function AvailabilityCalendar({
  availability,
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
}: AvailabilityCalendarProps) {
  const [dateRange, setDateRange] = useState<{ from: Date; to?: Date }>({
    from: checkIn || new Date(),
    to: checkOut,
  });

  const isDateDisabled = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const avail = availability.find((a) => a.date === dateStr);
    
    // Disable if blocked or booked
    if (avail && (avail.status === "BLOCKED" || avail.status === "BOOKED")) {
      return true;
    }
    
    // Disable past dates
    if (isBefore(date, startOfDay(new Date()))) {
      return true;
    }
    
    return false;
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {!dateRange.from && "Select check-in date"}
        {dateRange.from && !dateRange.to && "Now select check-out date"}
        {dateRange.from && dateRange.to && (
          <span className="font-semibold text-foreground">
            {format(dateRange.from, "dd MMM")} → {format(dateRange.to, "dd MMM")}
          </span>
        )}
      </div>
      
      <div className="border rounded-lg p-4 bg-background">
        <AirbnbStyleCalendar
          mode="range"
          selected={dateRange}
          onSelect={(range) => {
            if (range && typeof range === "object" && "from" in range) {
              setDateRange(range);
              onCheckInChange(range.from);
              onCheckOutChange(range.to);
            }
          }}
          disabled={isDateDisabled}
          numberOfMonths={1}
        />
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-muted" />
          <span className="text-muted-foreground">Unavailable</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-foreground" />
          <span className="text-muted-foreground">Available</span>
        </div>
      </div>
    </div>
  );
}
