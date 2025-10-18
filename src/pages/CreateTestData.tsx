import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createTestGuestsAndReviews } from "@/utils/createTestReviews";

const CreateTestData = () => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<string>("");

  const handleCreate = async () => {
    setLoading(true);
    setStep("Creating test data...");
    
    try {
      const result = await createTestGuestsAndReviews();
      toast.success(`Success! Created ${result.reviewsCreated} reviews for ${result.listingsUpdated} properties`);
      setStep("Done!");
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create test data');
      setStep("Failed");
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
            onClick={handleCreate}
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