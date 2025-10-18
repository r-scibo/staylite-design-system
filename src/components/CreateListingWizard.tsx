import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Upload, X } from "lucide-react";
import { addDays, format } from "date-fns";

const listingSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(1000),
  city: z.string().min(2),
  country: z.string().default("Italy"),
  property_type: z.string(),
  max_guests: z.number().min(1).max(20),
  base_price: z.number().min(1),
  cleaning_fee: z.number().min(0),
});

type ListingFormData = z.infer<typeof listingSchema>;

interface CreateListingWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const CreateListingWizard = ({ onComplete, onCancel }: CreateListingWizardProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState<"details" | "amenities" | "photos" | "availability">("details");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [amenitiesList, setAmenitiesList] = useState<Array<{ id: string; name: string }>>([]);
  const [listingId, setListingId] = useState<string | null>(null);
  const [availabilityDates, setAvailabilityDates] = useState<Date[]>([]);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      country: "Italy",
      cleaning_fee: 0,
    }
  });

  // Fetch amenities
  useState(() => {
    supabase.from("amenities").select("id, name").then(({ data }) => {
      if (data) setAmenitiesList(data);
    });
  });

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos(prev => [...prev, ...files].slice(0, 10));
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const createListing = async (data: ListingFormData) => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      const { data: listing, error } = await supabase
        .from("listings")
        .insert({
          host_id: profile.id,
          title: data.title,
          slug: `${slug}-${Date.now()}`,
          description: data.description,
          city: data.city,
          country: data.country,
          property_type: data.property_type,
          max_guests: data.max_guests,
          base_price: data.base_price,
          cleaning_fee: data.cleaning_fee,
          host_approval_required: true,
        })
        .select()
        .single();

      if (error) throw error;

      setListingId(listing.id);
      setStep("amenities");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const saveAmenities = async () => {
    if (!listingId) return;

    try {
      if (selectedAmenities.length > 0) {
        await supabase.from("listing_amenities").insert(
          selectedAmenities.map(amenityId => ({
            listing_id: listingId,
            amenity_id: amenityId,
          }))
        );
      }
      setStep("photos");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const uploadPhotos = async () => {
    if (!listingId || photos.length < 3) {
      toast.error("Please upload at least 3 photos");
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = photos.map(async (photo, index) => {
        const fileExt = photo.name.split(".").pop();
        const fileName = `${listingId}/${Date.now()}-${index}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("listing-photos")
          .upload(fileName, photo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("listing-photos")
          .getPublicUrl(fileName);

        return { listing_id: listingId, url: publicUrl, sort_order: index };
      });

      const photoRecords = await Promise.all(uploadPromises);

      const { error } = await supabase
        .from("listing_photos")
        .insert(photoRecords);

      if (error) throw error;

      // Generate 7-10 available dates
      const startDate = new Date();
      const numDates = Math.floor(Math.random() * 4) + 7; // 7-10 dates
      const dates = Array.from({ length: numDates }, (_, i) => addDays(startDate, i + 1));
      setAvailabilityDates(dates);
      setStep("availability");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const saveAvailability = async () => {
    if (!listingId) return;

    try {
      await supabase.from("availability").insert(
        availabilityDates.map(date => ({
          listing_id: listingId,
          date: format(date, "yyyy-MM-dd"),
          status: "OPEN" as const,
        }))
      );

      toast.success("Listing created successfully!");
      onComplete();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      {step === "details" && (
        <form onSubmit={handleSubmit(createListing)} className="space-y-4">
          <h3 className="text-xl font-semibold">Listing Details</h3>
          
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} rows={4} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register("city")} placeholder="Milan" />
              {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" {...register("country")} />
            </div>
          </div>

          <div>
            <Label htmlFor="property_type">Property Type</Label>
            <Select onValueChange={(val) => setValue("property_type", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Apartment">Apartment</SelectItem>
                <SelectItem value="House">House</SelectItem>
                <SelectItem value="Villa">Villa</SelectItem>
                <SelectItem value="Loft">Loft</SelectItem>
              </SelectContent>
            </Select>
            {errors.property_type && <p className="text-sm text-destructive">{errors.property_type.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="max_guests">Max Guests</Label>
              <Input
                id="max_guests"
                type="number"
                {...register("max_guests", { valueAsNumber: true })}
              />
              {errors.max_guests && <p className="text-sm text-destructive">{errors.max_guests.message}</p>}
            </div>

            <div>
              <Label htmlFor="base_price">Base Price (€/night)</Label>
              <Input
                id="base_price"
                type="number"
                step="0.01"
                {...register("base_price", { valueAsNumber: true })}
              />
              {errors.base_price && <p className="text-sm text-destructive">{errors.base_price.message}</p>}
            </div>

            <div>
              <Label htmlFor="cleaning_fee">Cleaning Fee (€)</Label>
              <Input
                id="cleaning_fee"
                type="number"
                step="0.01"
                {...register("cleaning_fee", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit">Next: Amenities</Button>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      )}

      {step === "amenities" && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Select Amenities</h3>
          <div className="grid grid-cols-2 gap-4">
            {amenitiesList.map(amenity => (
              <div key={amenity.id} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity.id}
                  checked={selectedAmenities.includes(amenity.id)}
                  onCheckedChange={(checked) => {
                    setSelectedAmenities(prev =>
                      checked
                        ? [...prev, amenity.id]
                        : prev.filter(id => id !== amenity.id)
                    );
                  }}
                />
                <Label htmlFor={amenity.id}>{amenity.name}</Label>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={saveAmenities}>Next: Photos</Button>
            <Button variant="outline" onClick={() => setStep("details")}>Back</Button>
          </div>
        </div>
      )}

      {step === "photos" && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Upload Photos (minimum 3)</h3>
          
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoSelect}
              className="hidden"
              id="photo-upload"
            />
            <label htmlFor="photo-upload" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-muted" />
              <p className="mt-2 text-sm text-muted">Click to upload photos</p>
            </label>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={() => removePhoto(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted">
            {photos.length} photo(s) selected {photos.length < 3 && `(${3 - photos.length} more required)`}
          </p>

          <div className="flex gap-2">
            <Button onClick={uploadPhotos} disabled={photos.length < 3 || uploading}>
              {uploading ? "Uploading..." : "Next: Availability"}
            </Button>
            <Button variant="outline" onClick={() => setStep("amenities")}>Back</Button>
          </div>
        </div>
      )}

      {step === "availability" && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Initial Availability</h3>
          <p className="text-sm text-muted">
            We've pre-selected {availabilityDates.length} dates for your listing. You can manage availability later in the Calendar tab.
          </p>
          
          <div className="border rounded-lg p-4">
            <p className="font-medium mb-2">Available Dates:</p>
            <ul className="space-y-1">
              {availabilityDates.map((date, i) => (
                <li key={i} className="text-sm">{format(date, "dd MMM yyyy")}</li>
              ))}
            </ul>
          </div>

          <div className="flex gap-2">
            <Button onClick={saveAvailability}>Complete & Publish</Button>
            <Button variant="outline" onClick={() => setStep("photos")}>Back</Button>
          </div>
        </div>
      )}
    </div>
  );
};