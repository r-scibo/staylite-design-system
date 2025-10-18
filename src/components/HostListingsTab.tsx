import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import { CreateListingWizard } from "./CreateListingWizard";
import { toast } from "sonner";
import { LoadingSpinner } from "./LoadingSpinner";

interface Listing {
  id: string;
  title: string;
  city: string;
  base_price: number;
  max_guests: number;
  listing_photos: Array<{ url: string }>;
}

export const HostListingsTab = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  const fetchListings = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from("listings")
        .select(`
          id,
          title,
          city,
          base_price,
          max_guests,
          listing_photos (url)
        `)
        .eq("host_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    try {
      const { error } = await supabase.from("listings").delete().eq("id", id);
      if (error) throw error;
      toast.success("Listing deleted");
      fetchListings();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (showWizard) {
    return (
      <CreateListingWizard
        onComplete={() => {
          setShowWizard(false);
          fetchListings();
        }}
        onCancel={() => setShowWizard(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Listings</h2>
        <Button onClick={() => setShowWizard(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Listing
        </Button>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted mb-4">No listings yet</p>
            <Button onClick={() => setShowWizard(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Listing
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {listings.map((listing) => (
            <Card key={listing.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {listing.listing_photos[0] && (
                    <img
                      src={listing.listing_photos[0].url}
                      alt={listing.title}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{listing.title}</h3>
                    <p className="text-sm text-muted">{listing.city}</p>
                    <p className="text-sm mt-2">
                      €{listing.base_price}/night • Up to {listing.max_guests} guests
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDelete(listing.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};