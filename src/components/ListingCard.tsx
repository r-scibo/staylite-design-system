import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface ListingCardProps {
  id: string;
  slug: string;
  title: string;
  city: string;
  country: string;
  basePrice: number;
  ratingAvg: number | null;
  ratingCount: number | null;
  photoUrl: string;
  propertyType: string;
}

export function ListingCard({
  id,
  slug,
  title,
  city,
  country,
  basePrice,
  ratingAvg,
  ratingCount,
  photoUrl,
  propertyType,
}: ListingCardProps) {
  const [searchParams] = useSearchParams();
  
  // Preserve search parameters in the listing link
  const listingUrl = `/listing/${slug}?${searchParams.toString()}`;
  
  return (
    <Link to={listingUrl}>
      <Card className="overflow-hidden hover:shadow-cyan hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
        <div className="aspect-[4/3] overflow-hidden bg-muted relative">
          {photoUrl ? (
            <>
              <img
                src={photoUrl}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
        </div>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{title}</h3>
              <p className="text-sm text-muted-foreground">
                {city}, {country}
              </p>
            </div>
            {ratingAvg !== null && ratingCount !== null && ratingCount > 0 && (
              <div className="flex items-center gap-1 text-sm font-medium shrink-0">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{Number(ratingAvg).toFixed(1)}</span>
                <span className="text-muted-foreground">({ratingCount})</span>
              </div>
            )}
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xl font-bold text-primary">€{Number(basePrice).toFixed(0)}</span>
              <span className="text-sm text-muted-foreground"> / night</span>
            </div>
            <Badge className="text-xs capitalize bg-cyan text-cyan-foreground border-none">
              {propertyType}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
