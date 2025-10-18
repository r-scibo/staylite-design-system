import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Button } from "./ui/button";
import { MapPin, AlertCircle } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";

// Mapbox token - in production, this should be stored securely
mapboxgl.accessToken = "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw";

interface MapLocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  city?: string;
  defaultCenter?: [number, number];
  defaultZoom?: number;
}

export const MapLocationPicker = ({ 
  onLocationSelect,
  city,
  defaultCenter = [9.19, 45.464], // Milan center
  defaultZoom = 12
}: MapLocationPickerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [manualAddress, setManualAddress] = useState("");
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  
  const isMilan = city?.toLowerCase().includes("milan") || city?.toLowerCase().includes("milano");
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!isMilan || !mapContainer.current || map.current) return;

    try {
      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: defaultCenter,
        zoom: defaultZoom,
      });
      
      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError(true);
      });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      "top-right"
    );

    // Add instructions
    const instructions = document.createElement("div");
    instructions.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
    instructions.style.cssText = "background: white; padding: 10px; margin: 10px; border-radius: 4px; max-width: 250px;";
    instructions.innerHTML = '<p style="margin: 0; font-size: 12px; color: #333;"><strong>Click on the map</strong> to select your property location</p>';
    map.current.getContainer().appendChild(instructions);

    // Handle map click
    map.current.on("click", async (e) => {
      const { lng, lat } = e.lngLat;
      
      // Reverse geocode to get address
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
        );
        const data = await response.json();
        const address = data.features[0]?.place_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        handleLocationSelect(lat, lng, address);
      } catch (error) {
        console.error("Geocoding error:", error);
        handleLocationSelect(lat, lng, `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
    });

    } catch (error) {
      console.error("Map initialization error:", error);
      setMapError(true);
    }

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [isMilan]);

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    // Remove existing marker
    if (marker.current) {
      marker.current.remove();
    }

    // Add new marker
    marker.current = new mapboxgl.Marker({ color: "hsl(210, 100%, 50%)", draggable: false })
      .setLngLat([lng, lat])
      .addTo(map.current!);

    setSelectedLocation({ lat, lng, address });
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    }
  };

  const handleManualSubmit = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    
    if (!manualAddress || isNaN(lat) || isNaN(lng)) {
      return;
    }
    
    onLocationSelect({ lat, lng, address: manualAddress });
  };

  // Show manual entry for non-Milan cities or if map fails
  if (!isMilan || mapError) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Interactive map is only available for Milan listings. Please manually enter the location details below.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4 p-4 border rounded-lg">
          <div>
            <Label htmlFor="address">Full Address *</Label>
            <Input
              id="address"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              placeholder="Via Roma 1, 20121 Milano MI, Italy"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude *</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                placeholder="45.464"
              />
            </div>
            
            <div>
              <Label htmlFor="longitude">Longitude *</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={manualLng}
                onChange={(e) => setManualLng(e.target.value)}
                placeholder="9.190"
              />
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Tip: You can find coordinates by searching your address on Google Maps and copying the coordinates from the URL or info panel.
          </p>
          
          <Button 
            onClick={handleManualSubmit}
            className="w-full"
            disabled={!manualAddress || !manualLat || !manualLng}
          >
            Confirm Location
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div 
        ref={mapContainer} 
        className="w-full h-[500px] rounded-lg shadow-large border-2 border-cyan/20"
      />
      {selectedLocation && (
        <div className="p-4 bg-card border rounded-lg space-y-3">
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Selected Location</p>
              <p className="text-xs text-muted-foreground mt-1">{selectedLocation.address}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Coordinates: {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}
              </p>
            </div>
          </div>
          <Button 
            onClick={handleConfirm}
            className="w-full"
          >
            Confirm Location
          </Button>
        </div>
      )}
    </div>
  );
};