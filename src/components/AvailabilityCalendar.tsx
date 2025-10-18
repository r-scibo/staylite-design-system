import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, parseISO, isBefore, startOfDay } from "date-fns";

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
  const [selectingCheckOut, setSelectingCheckOut] = useState(false);

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

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    if (!selectingCheckOut) {
      // Selecting check-in
      onCheckInChange(date);
      onCheckOutChange(undefined);
      setSelectingCheckOut(true);
    } else {
      // Selecting check-out
      if (checkIn && date > checkIn) {
        onCheckOutChange(date);
        setSelectingCheckOut(false);
      } else {
        // If selected date is before check-in, start over
        onCheckInChange(date);
        onCheckOutChange(undefined);
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted">
        {!checkIn && "Select check-in date"}
        {checkIn && !checkOut && "Now select check-out date"}
        {checkIn && checkOut && "Dates selected"}
      </div>
      
      <Calendar
        mode="single"
        selected={selectingCheckOut ? checkOut : checkIn}
        onSelect={handleDateSelect}
        disabled={isDateDisabled}
        initialFocus
        numberOfMonths={1}
        className={cn("pointer-events-auto rounded-md border")}
      />

      {checkIn && checkOut && (
        <div className="rounded-md bg-accent/10 p-3 text-sm">
          <p className="font-semibold text-foreground">
            {format(checkIn, "dd MMM")} → {format(checkOut, "dd MMM")}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-muted" />
          <span className="text-muted">Unavailable</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-muted">Available</span>
        </div>
      </div>
    </div>
  );
}
