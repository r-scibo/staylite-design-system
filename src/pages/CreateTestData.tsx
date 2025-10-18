import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const CreateTestData = () => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<string>("");

  const createGuestsAndReviews = async () => {
    setLoading(true);
    
    try {
      // Step 1: Create guest accounts
      setStep("Creating 9 test guest accounts...");
      
      const { data: functionData, error: functionError } = await supabase.functions.invoke('create-test-guests');
      
      if (functionError) {
        throw new Error(`Failed to create guests: ${functionError.message}`);
      }
      
      console.log("Guest creation result:", functionData);
      toast.success(`Created ${functionData.results.filter((r: any) => r.success).length} guest accounts`);
      
      // Step 2: Wait a moment for profiles to be created by trigger
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 3: Fetch all guest profiles
      setStep("Fetching guest profiles...");
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name')
        .neq('name', 'test_host');
      
      if (profilesError) throw profilesError;
      
      if (!profiles || profiles.length < 10) {
        throw new Error(`Only found ${profiles?.length || 0} profiles, need at least 10`);
      }
      
      // Step 4: Fetch all listings
      setStep("Fetching listings...");
      
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('id, title, rating_count');
      
      if (listingsError) throw listingsError;
      
      // Step 5: Create reviews for each listing
      setStep("Creating reviews...");
      
      const reviews = [];
      const comments = [
        "Amazing place! Highly recommend. Everything was perfect.",
        "Great location and very clean. Would definitely stay again.",
        "Beautiful property with excellent amenities. Loved it!",
        "Perfect for our stay. Host was very responsive.",
        "Exceeded expectations. The photos don't do it justice!",
        "Comfortable and well-equipped. Great value for money.",
        "Wonderful experience. The place felt like home.",
        "Fantastic stay! Everything we needed was there.",
        "Lovely property in a great neighborhood. Enjoyed every minute.",
        "Absolutely stunning! Can't wait to come back.",
        "Very nice place, exactly as described. No complaints.",
        "Cozy and welcoming. Perfect for our needs.",
        "Outstanding property! Five stars all the way.",
        "Charming and comfortable. Highly recommended!",
        "Excellent location with great transport links.",
        "Beautiful apartment with amazing views.",
        "Super clean and well maintained. Perfect!",
        "Ideal for families. Kids loved it!",
        "Stylish and modern. Everything worked perfectly.",
        "Great communication with host. Smooth check-in.",
        "Very spacious and comfortable. Loved the design!",
        "Perfect for a weekend getaway. Would return!"
      ];
      
      for (const listing of listings || []) {
        const numReviews = listing.rating_count || 0;
        
        for (let i = 0; i < numReviews; i++) {
          const profile = profiles[i % profiles.length];
          const rating = Math.random() > 0.3 ? 5 : (Math.random() > 0.5 ? 4 : 3);
          const comment = comments[Math.floor(Math.random() * comments.length)];
          
          reviews.push({
            listing_id: listing.id,
            guest_id: profile.id,
            rating,
            comment,
            created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      }
      
      // Insert reviews in batches
      const batchSize = 50;
      for (let i = 0; i < reviews.length; i += batchSize) {
        const batch = reviews.slice(i, i + batchSize);
        const { error } = await supabase.from('reviews').insert(batch);
        if (error) {
          console.error('Error inserting batch:', error);
        }
      }
      
      toast.success(`Created ${reviews.length} reviews across ${listings?.length} properties!`);
      setStep("Done!");
      
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create test data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Test Data</CardTitle>
          <CardDescription>
            This will create 9 guest accounts and populate reviews for all properties
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={createGuestsAndReviews}
            disabled={loading}
            className="w-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? step : "Create Guests & Reviews"}
          </Button>
          
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">This will:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Create 9 guest accounts (emails: marco.rossi@test.com, etc.)</li>
              <li>Password for all: TestGuest123!</li>
              <li>Create reviews matching each property's rating_count</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTestData;