import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star, Heart } from "lucide-react";

interface Listing {
  id: string;
  title: string;
  slug: string;
  city: string;
  country: string;
  base_price: number;
  rating_avg: number | null;
  rating_count: number | null;
  first_photo_url: string | null;
}

interface DestinationGroup {
  title: string;
  listings: Listing[];
}

export function DestinationShowcase() {
  const [groups, setGroups] = useState<DestinationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDestinationGroups();
  }, []);

  const fetchDestinationGroups = async () => {
    try {
      // Fetch top-rated listings by destination
      const { data: milanListings } = await supabase
        .from("listing_summary_v")
        .select("*")
        .eq("city", "Milan")
        .order("rating_avg", { ascending: false })
        .limit(8);

      const { data: romeListings } = await supabase
        .from("listing_summary_v")
        .select("*")
        .eq("city", "Rome")
        .order("rating_avg", { ascending: false })
        .limit(8);

      const { data: florenceListings } = await supabase
        .from("listing_summary_v")
        .select("*")
        .eq("city", "Florence")
        .order("rating_avg", { ascending: false })
        .limit(8);

      const destinationGroups: DestinationGroup[] = [];

      if (milanListings && milanListings.length > 0) {
        destinationGroups.push({
          title: "Milan: Popular Stays",
          listings: milanListings,
        });
      }

      if (romeListings && romeListings.length > 0) {
        destinationGroups.push({
          title: "Rome: Top Rated",
          listings: romeListings,
        });
      }

      if (florenceListings && florenceListings.length > 0) {
        destinationGroups.push({
          title: "Florence: Trending Now",
          listings: florenceListings,
        });
      }

      setGroups(destinationGroups);
    } catch (error) {
      console.error("Error fetching destination groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollContainer = (containerId: string, direction: "left" | "right") => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const scrollAmount = 400;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (loading || groups.length === 0) return null;

  return (
    <div className="space-y-12">
      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">{group.title}</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scrollContainer(`scroll-${groupIndex}`, "left")}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scrollContainer(`scroll-${groupIndex}`, "right")}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div
            id={`scroll-${groupIndex}`}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {group.listings.map((listing) => (
              <Card
                key={listing.id}
                className="flex-shrink-0 w-[280px] cursor-pointer overflow-hidden transition-transform hover:scale-[1.02] group"
                onClick={() => navigate(`/listing/${listing.slug}`)}
              >
                <div className="relative aspect-square">
                  <img
                    src={listing.first_photo_url || "/placeholder.svg"}
                    alt={listing.title}
                    className="h-full w-full object-cover"
                  />
                  <button
                    className="absolute top-3 right-3 rounded-full bg-white/90 p-2 transition-colors hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Add to favorites functionality
                    }}
                  >
                    <Heart className="h-4 w-4 text-foreground" />
                  </button>
                </div>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="line-clamp-1 font-semibold text-foreground">
                      {listing.title}
                    </h3>
                    {listing.rating_avg && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3 w-3 fill-accent text-accent" />
                        <span className="font-medium">{listing.rating_avg.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <p className="mb-3 text-sm text-muted line-clamp-1">
                    {listing.city}, {listing.country}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-foreground">
                      €{listing.base_price}
                    </span>
                    <span className="text-sm text-muted">/ night</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
