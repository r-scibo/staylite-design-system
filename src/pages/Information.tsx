import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Shield, Heart, Home, Phone, Mail, MapPin } from "lucide-react";

const Information = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">Help Center</h1>
        <p className="text-lg text-muted">Everything you need to know about StayLite</p>
      </div>

      {/* Voice Assistant - Use the global widget */}
      <div className="mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Voice Assistant</CardTitle>
            <CardDescription>
              Get help using your voice with our AI assistant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Click the floating microphone button in the bottom-right corner to start talking with our AI assistant.
              The assistant can help you navigate the site, search for listings, and answer questions.
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">What you can say:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• "Take me to the search page"</li>
                <li>• "Show me listings in Milan"</li>
                <li>• "Open my profile"</li>
                <li>• "Scroll to destinations"</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

        {/* Policies Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-6">Our Policies</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent rounded-lg">
                    <Shield className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <CardTitle>Cancellation Policy</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-muted space-y-3">
                <p><strong>Flexible:</strong> Full refund up to 24 hours before check-in.</p>
                <p><strong>Moderate:</strong> Full refund up to 5 days before check-in.</p>
                <p><strong>Strict:</strong> Full refund up to 7 days before check-in, 50% refund up to 48 hours before.</p>
                <p className="text-sm">Cancel after that and you won't be refunded. Service fees are always non-refundable.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent rounded-lg">
                    <Home className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <CardTitle>House Rules</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-muted space-y-2">
                <p>• Check-in: After 3:00 PM</p>
                <p>• Check-out: Before 11:00 AM</p>
                <p>• No smoking inside properties</p>
                <p>• No parties or events without prior approval</p>
                <p>• Respect quiet hours (10 PM - 8 AM)</p>
                <p>• Maximum number of guests as listed</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent rounded-lg">
                  <Heart className="h-5 w-5 text-accent-foreground" />
                </div>
                <CardTitle>Guest Safety</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-muted space-y-3">
              <p>Your safety is our priority. All listings must meet our safety standards:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Working smoke detectors and carbon monoxide detectors</li>
                <li>Fire extinguisher accessible on property</li>
                <li>Clear emergency exit routes</li>
                <li>First aid kit available</li>
                <li>Emergency contact numbers provided</li>
              </ul>
              <p className="text-sm mt-4">Report any safety concerns immediately through our platform.</p>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-12" />

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="booking">
              <AccordionTrigger>How do I book a property?</AccordionTrigger>
              <AccordionContent className="text-muted">
                Search for your destination, select your dates and number of guests, then browse available properties. 
                Click on a listing to view details, check availability, and complete your booking. You'll need to create 
                an account and provide payment information to confirm your reservation.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="payment">
              <AccordionTrigger>When will I be charged?</AccordionTrigger>
              <AccordionContent className="text-muted">
                For instant book properties, you'll be charged immediately after booking. For properties requiring 
                host approval, payment is processed once the host accepts your reservation request. The total includes 
                nightly rate, cleaning fee, service fee (12%), and taxes (10%).
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="cancellation">
              <AccordionTrigger>What if I need to cancel?</AccordionTrigger>
              <AccordionContent className="text-muted">
                Cancellation policies vary by listing. Check the specific policy before booking. Generally, you can 
                cancel through your profile under "My Bookings". Refunds depend on the cancellation policy and timing. 
                Service fees are non-refundable.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="host-approval">
              <AccordionTrigger>What does "Host approval required" mean?</AccordionTrigger>
              <AccordionContent className="text-muted">
                Some hosts prefer to approve guests before confirming bookings. Your reservation will be in "Pending" 
                status until the host reviews and accepts your request. Hosts typically respond within 24 hours. 
                You won't be charged until the host approves.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="host-communication">
              <AccordionTrigger>How do I contact my host?</AccordionTrigger>
              <AccordionContent className="text-muted">
                After booking confirmation, you'll receive your host's contact information. For questions before booking, 
                use the inquiry system on the listing page. Always communicate through StayLite's platform for your 
                protection.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="checkin">
              <AccordionTrigger>What are the check-in procedures?</AccordionTrigger>
              <AccordionContent className="text-muted">
                Check-in details vary by property. Most hosts provide self check-in with lockbox or smart lock instructions. 
                You'll receive detailed check-in information from your host 1-2 days before arrival. Standard check-in 
                time is after 3:00 PM.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="issues">
              <AccordionTrigger>What if there's an issue with my stay?</AccordionTrigger>
              <AccordionContent className="text-muted">
                Contact your host first to resolve minor issues. For urgent problems or if the host is unresponsive, 
                contact StayLite support immediately through your booking details. We're available 24/7 for emergencies. 
                Document issues with photos if possible.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="hosting">
              <AccordionTrigger>How do I become a host?</AccordionTrigger>
              <AccordionContent className="text-muted">
                Create a host account, then use our listing wizard to add your property. You'll need to provide photos, 
                description, amenities, pricing, and availability. Set your house rules and cancellation policy. 
                Once published, your listing appears in search results immediately.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="fees">
              <AccordionTrigger>What fees does StayLite charge?</AccordionTrigger>
              <AccordionContent className="text-muted">
                Guests pay a 12% service fee on the booking subtotal, plus applicable taxes (10%). Hosts pay a 3% fee 
                on confirmed bookings. All fees are clearly displayed before booking confirmation. There are no hidden charges.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="reviews">
              <AccordionTrigger>How do reviews work?</AccordionTrigger>
              <AccordionContent className="text-muted">
                After check-out, both guests and hosts can leave reviews within 14 days. Reviews are published simultaneously 
                to ensure honesty. Ratings include overall score (1-5 stars) and written feedback. Reviews help maintain 
                quality and build trust in our community.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <Separator className="my-12" />

        {/* Company Information */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-6">About StayLite</h2>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-muted space-y-4">
              <p>
                StayLite was founded with a simple mission: to make finding the perfect place to stay effortless 
                and accessible for everyone. We believe that travel should be about creating memories, not stressing 
                over accommodations.
              </p>
              <p>
                We connect travelers with unique properties across Italy and beyond, from cozy apartments in historic 
                city centers to luxurious villas in the countryside. Every listing on our platform is verified to meet 
                our quality and safety standards.
              </p>
              <p>
                For hosts, we provide tools to manage properties efficiently, reach a global audience, and build a 
                sustainable hosting business. We're committed to supporting our community of hosts and guests with 
                responsive customer service and continuous platform improvements.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
              <CardDescription>We're here to help 24/7</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-accent mt-1" />
                <div>
                  <p className="font-medium text-foreground">Customer Support</p>
                  <p className="text-muted">+39 02 1234 5678</p>
                  <p className="text-sm text-muted">Available 24/7 for urgent issues</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-accent mt-1" />
                <div>
                  <p className="font-medium text-foreground">Email Support</p>
                  <p className="text-muted">support@staylite.com</p>
                  <p className="text-sm text-muted">Response within 24 hours</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-accent mt-1" />
                <div>
                  <p className="font-medium text-foreground">Headquarters</p>
                  <p className="text-muted">Via della Conciliazione 44</p>
                  <p className="text-muted">00193 Roma RM, Italy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Legal Footer */}
        <div className="text-center py-8 border-t border-border">
          <p className="text-sm text-muted mb-2">
            © 2025 StayLite. All rights reserved.
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <a href="#" className="text-muted hover:text-foreground transition-colors">Terms of Service</a>
            <span className="text-muted">•</span>
            <a href="#" className="text-muted hover:text-foreground transition-colors">Privacy Policy</a>
            <span className="text-muted">•</span>
            <a href="#" className="text-muted hover:text-foreground transition-colors">Cookie Policy</a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Information;
