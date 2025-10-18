import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">Your Profile</h1>
        <Card>
          <CardHeader>
            <CardTitle>Your Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No bookings yet. Start exploring properties to book your first stay!
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
