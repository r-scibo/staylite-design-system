import { Link } from "react-router-dom";
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
  return (
    <Link to={`/listing/${slug}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
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
              <span className="text-lg font-bold">€{Number(basePrice).toFixed(0)}</span>
              <span className="text-sm text-muted-foreground"> / night</span>
            </div>
            <Badge variant="secondary" className="text-xs capitalize">
              {propertyType}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
