import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SearchFiltersProps {
  minPrice: number;
  maxPrice: number;
  propertyType: string;
  amenities: string[];
  onFiltersChange: (filters: {
    minPrice: number;
    maxPrice: number;
    propertyType: string;
    amenities: string[];
  }) => void;
}

interface Amenity {
  id: string;
  name: string;
  icon: string | null;
}

const PROPERTY_TYPES = ["apartment", "house", "villa", "studio", "loft", "cottage"];

export function SearchFilters({
  minPrice,
  maxPrice,
  propertyType,
  amenities: selectedAmenities,
  onFiltersChange,
}: SearchFiltersProps) {
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const [availableAmenities, setAvailableAmenities] = useState<Amenity[]>([]);

  useEffect(() => {
    const fetchAmenities = async () => {
      const { data } = await supabase
        .from("amenities")
        .select("id, name, icon")
        .order("name");
      
      if (data) setAvailableAmenities(data);
    };
    
    fetchAmenities();
  }, []);

  const handlePriceChange = (values: number[]) => {
    setLocalMinPrice(values[0]);
    setLocalMaxPrice(values[1]);
  };

  const handleAmenityToggle = (amenityId: string) => {
    const newAmenities = selectedAmenities.includes(amenityId)
      ? selectedAmenities.filter((id) => id !== amenityId)
      : [...selectedAmenities, amenityId];
    
    onFiltersChange({
      minPrice: localMinPrice,
      maxPrice: localMaxPrice,
      propertyType,
      amenities: newAmenities,
    });
  };

  const handleReset = () => {
    setLocalMinPrice(0);
    setLocalMaxPrice(1000);
    onFiltersChange({
      minPrice: 0,
      maxPrice: 1000,
      propertyType: "all",
      amenities: [],
    });
  };

  const activeFiltersCount = 
    (propertyType !== "all" ? 1 : 0) +
    (selectedAmenities.length > 0 ? 1 : 0) +
    (localMinPrice > 0 || localMaxPrice < 1000 ? 1 : 0);

  return (
    <Card className="sticky top-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Filters</CardTitle>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear ({activeFiltersCount})
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Range */}
        <div className="space-y-3">
          <Label>Price Range</Label>
          <div className="px-2">
            <Slider
              min={0}
              max={1000}
              step={10}
              value={[localMinPrice, localMaxPrice]}
              onValueChange={handlePriceChange}
              onValueCommit={(values) =>
                onFiltersChange({
                  minPrice: values[0],
                  maxPrice: values[1],
                  propertyType,
                  amenities: selectedAmenities,
                })
              }
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>€{localMinPrice}</span>
            <span>€{localMaxPrice}</span>
          </div>
        </div>

        {/* Property Type */}
        <div className="space-y-2">
          <Label>Property Type</Label>
          <Select
            value={propertyType}
            onValueChange={(value) =>
              onFiltersChange({
                minPrice: localMinPrice,
                maxPrice: localMaxPrice,
                propertyType: value,
                amenities: selectedAmenities,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {PROPERTY_TYPES.map((type) => (
                <SelectItem key={type} value={type} className="capitalize">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Amenities */}
        {availableAmenities.length > 0 && (
          <div className="space-y-3">
            <Label>Amenities</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableAmenities.map((amenity) => (
                <div key={amenity.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity.id}
                    checked={selectedAmenities.includes(amenity.id)}
                    onCheckedChange={() => handleAmenityToggle(amenity.id)}
                  />
                  <Label
                    htmlFor={amenity.id}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {amenity.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
