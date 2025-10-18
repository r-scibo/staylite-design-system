import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { AirbnbStyleCalendar } from "./AirbnbStyleCalendar";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Minus, Plus, Search, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const MAJOR_CITIES = [
  "Milan",
  "Rome",
  "Florence",
  "Venice",
  "Naples",
  "Turin",
  "Bologna",
  "Verona",
  "Genoa",
  "Palermo",
];

interface SearchFormProps {
  defaultLocation?: string;
  defaultCheckIn?: Date;
  defaultCheckOut?: Date;
  defaultGuests?: number;
  compact?: boolean;
}

export function SearchForm({
  defaultLocation = "",
  defaultCheckIn,
  defaultCheckOut,
  defaultGuests = 2,
  compact = false,
}: SearchFormProps) {
  const navigate = useNavigate();
  const [location, setLocation] = useState(defaultLocation);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [checkIn, setCheckIn] = useState<Date | undefined>(defaultCheckIn);
  const [checkOut, setCheckOut] = useState<Date | undefined>(defaultCheckOut);
  const [guests, setGuests] = useState(defaultGuests);

  const filteredCities = MAJOR_CITIES.filter((city) =>
    city.toLowerCase().includes(location.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (location) params.set("city", location);
    if (checkIn) params.set("checkIn", format(checkIn, "yyyy-MM-dd"));
    if (checkOut) params.set("checkOut", format(checkOut, "yyyy-MM-dd"));
    params.set("guests", guests.toString());

    navigate(`/search?${params.toString()}`);
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2 w-full max-w-6xl bg-surface rounded-full shadow-lg px-4 py-3">
        <div className="relative flex-1 min-w-[180px]">
          <Input
            placeholder="Where?"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {showSuggestions && filteredCities.length > 0 && (
            <div className="absolute z-50 mt-1 w-full bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredCities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setLocation(city);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-sm"
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-l h-8 border-border/50" />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="flex-1 min-w-[160px] justify-start font-normal border-0 hover:bg-transparent">
              {checkIn && checkOut
                ? `${format(checkIn, "dd MMM")} - ${format(checkOut, "dd MMM")}`
                : "Add dates"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-4">
              <AirbnbStyleCalendar
                mode="range"
                selected={{ from: checkIn || new Date(), to: checkOut }}
                onSelect={(range) => {
                  if (range && typeof range === "object" && "from" in range) {
                    setCheckIn(range.from);
                    setCheckOut(range.to);
                  }
                }}
                numberOfMonths={2}
              />
            </div>
          </PopoverContent>
        </Popover>

        <div className="border-l h-8 border-border/50" />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="min-w-[120px] justify-start font-normal border-0 hover:bg-transparent">
              {guests} {guests === 1 ? "guest" : "guests"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="start">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setGuests(Math.max(1, guests - 1))}
                className="h-8 w-8 p-0 rounded-full"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 min-w-[60px] justify-center">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{guests}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setGuests(Math.min(20, guests + 1))}
                className="h-8 w-8 p-0 rounded-full"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Button type="submit" size="icon" className="h-12 w-12 rounded-full shrink-0">
          <Search className="h-5 w-5" />
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl">
      <div className="grid gap-4 md:grid-cols-2 bg-surface rounded-lg p-4 shadow-lg">
        {/* Location */}
        <div className="space-y-2 relative">
          <Label htmlFor="location">Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="location"
              placeholder="Where are you going?"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-9"
            />
            {showSuggestions && filteredCities.length > 0 && (
              <div className="absolute z-50 mt-1 w-full bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredCities.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      setLocation(city);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-muted transition-colors"
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-2">
          <Label>Dates</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  (!checkIn || !checkOut) && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkIn && checkOut
                  ? `${format(checkIn, "dd MMM")} - ${format(checkOut, "dd MMM")}`
                  : "Select dates"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-4">
                <AirbnbStyleCalendar
                  mode="range"
                  selected={{ from: checkIn || new Date(), to: checkOut }}
                  onSelect={(range) => {
                    if (range && typeof range === "object" && "from" in range) {
                      setCheckIn(range.from);
                      setCheckOut(range.to);
                    }
                  }}
                  numberOfMonths={2}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Guests */}
        <div className="space-y-2">
          <Label>Guests</Label>
          <div className="flex items-center gap-2 border rounded-md h-10 px-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setGuests(Math.max(1, guests - 1))}
              className="h-6 w-6 p-0"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <div className="flex items-center gap-2 flex-1 justify-center">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{guests}</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setGuests(Math.min(20, guests + 1))}
              className="h-6 w-6 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Search Button */}
        <div className="md:col-span-2">
          <Button type="submit" size="lg" className="w-full mt-2">
            <Search className="mr-2 h-4 w-4" />
            Search Properties
          </Button>
        </div>
      </div>
    </form>
  );
}
