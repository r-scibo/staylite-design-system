import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { SearchForm } from "@/components/SearchForm";
import { SearchFilters } from "@/components/SearchFilters";
import { ListingCard } from "@/components/ListingCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Listing {
  id: string;
  title: string;
  slug: string;
  city: string;
  country: string;
  base_price: number;
  rating_avg: number | null;
  rating_count: number | null;
  first_photo_url: string;
  property_type: string;
  max_guests: number;
}

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Parse search params
  const city = searchParams.get("city") || "";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = parseInt(searchParams.get("guests") || "2");
  
  // Parse filter params
  const minPrice = parseInt(searchParams.get("minPrice") || "0");
  const maxPrice = parseInt(searchParams.get("maxPrice") || "1000");
  const propertyType = searchParams.get("propertyType") || "all";
  const amenitiesParam = searchParams.get("amenities") || "";
  const amenities = amenitiesParam ? amenitiesParam.split(",") : [];
  const minGuests = parseInt(searchParams.get("minGuests") || "1");

  useEffect(() => {
    fetchListings();
  }, [searchParams]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("listing_summary_v")
        .select("*", { count: "exact" });

      // Apply city filter
      if (city) {
        query = query.ilike("city", `%${city}%`);
      }

      // Apply price filters
      query = query
        .gte("base_price", minPrice)
        .lte("base_price", maxPrice);

      // Apply property type filter
      if (propertyType !== "all") {
        query = query.eq("property_type", propertyType);
      }

      // Apply guests filter
      query = query.gte("max_guests", minGuests);

      // Apply amenities filter if any selected
      if (amenities.length > 0) {
        const { data: listingsWithAmenities } = await supabase
          .from("listing_amenities")
          .select("listing_id")
          .in("amenity_id", amenities);

        if (listingsWithAmenities) {
          const listingIds = listingsWithAmenities.map((la) => la.listing_id);
          if (listingIds.length > 0) {
            query = query.in("id", listingIds);
          } else {
            // No listings match the amenity filter
            setListings([]);
            setTotalCount(0);
            setLoading(false);
            return;
          }
        }
      }

      // Order by rating and price
      query = query.order("rating_avg", { ascending: false, nullsFirst: false });

      const { data, error, count } = await query;

      if (error) throw error;

      setListings(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching listings:", error);
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (filters: {
    minPrice: number;
    maxPrice: number;
    propertyType: string;
    amenities: string[];
    minGuests: number;
  }) => {
    const params = new URLSearchParams(searchParams);
    
    if (city) params.set("city", city);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    params.set("guests", guests.toString());
    
    params.set("minPrice", filters.minPrice.toString());
    params.set("maxPrice", filters.maxPrice.toString());
    params.set("propertyType", filters.propertyType);
    params.set("minGuests", filters.minGuests.toString());
    
    if (filters.amenities.length > 0) {
      params.set("amenities", filters.amenities.join(","));
    } else {
      params.delete("amenities");
    }

    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Sticky Search Bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <SearchForm
            defaultLocation={city}
            defaultCheckIn={checkIn ? new Date(checkIn) : undefined}
            defaultCheckOut={checkOut ? new Date(checkOut) : undefined}
            defaultGuests={guests}
            compact
          />
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Results Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {city ? `Properties in ${city}` : "All Properties"}
          </h1>
          <p className="text-muted-foreground">
            {loading ? "Searching..." : `${totalCount} properties available`}
          </p>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block">
            <SearchFilters
              minPrice={minPrice}
              maxPrice={maxPrice}
              propertyType={propertyType}
              amenities={amenities}
              minGuests={minGuests}
              onFiltersChange={handleFiltersChange}
            />
          </aside>

          {/* Results Grid */}
          <div>
            {loading ? (
              <LoadingSpinner />
            ) : listings.length === 0 ? (
              <EmptyState
                title="No properties found"
                description="Try adjusting your search or filters to find more properties."
              />
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
                {listings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    id={listing.id}
                    slug={listing.slug}
                    title={listing.title}
                    city={listing.city}
                    country={listing.country}
                    basePrice={listing.base_price}
                    ratingAvg={listing.rating_avg}
                    ratingCount={listing.rating_count}
                    photoUrl={listing.first_photo_url}
                    propertyType={listing.property_type}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Search;
