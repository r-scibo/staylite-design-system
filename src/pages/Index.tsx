import { Navigation } from "@/components/Navigation";
import { SearchForm } from "@/components/SearchForm";
import { DestinationShowcase } from "@/components/DestinationShowcase";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Search Section */}
        <div id="search-section" className="flex items-center justify-center py-8">
          <SearchForm compact />
        </div>

        {/* Destination Showcase */}
        <div id="destinations-section" className="py-8">
          <DestinationShowcase />
        </div>

        {/* Host CTA */}
        <div id="host-cta-section" className="py-8">
          <div className="rounded-lg border border-border bg-surface p-8 shadow-medium text-center">
            <div className="mb-4 inline-flex rounded-full bg-accent/10 p-3">
              <Home className="h-8 w-8 text-accent" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">
              Share your space
            </h2>
            <p className="mb-6 text-muted max-w-md mx-auto">
              Earn extra income and welcome travelers from around the world by hosting on StayLite.
            </p>
            <Button
              onClick={() => navigate("/auth?next=/host")}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Host your place
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div id="features-section" className="grid gap-6 py-16 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Verified Listings",
              description: "Every property is verified for quality and safety.",
            },
            {
              title: "Best Prices",
              description: "Competitive rates with no hidden fees.",
            },
            {
              title: "24/7 Support",
              description: "We're here to help whenever you need us.",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="rounded-lg border border-border bg-surface p-6 shadow-soft transition-shadow hover:shadow-medium"
            >
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
