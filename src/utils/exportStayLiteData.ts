import { supabase } from "@/integrations/supabase/client";

export interface ExportedListing {
  title: string;
  slug: string;
  city: string;
  country: string;
  address: string;
  propertyType: string;
  maxGuests: number;
  basePrice: number;
  cleaningFee: number;
  description: string;
  rating: number;
  reviewCount: number;
  amenities: string[];
}

export interface ExportedData {
  listings: ExportedListing[];
  policies: {
    cancellation: string;
    houseRules: string;
    safety: string;
  };
  faq: Array<{ question: string; answer: string }>;
  companyInfo: {
    mission: string;
    contact: string;
  };
}

export async function exportAllData(): Promise<ExportedData> {
  // Fetch all listings with their amenities
  const { data: listings, error: listingsError } = await supabase
    .from("listings")
    .select(`
      id,
      title,
      slug,
      city,
      country,
      address,
      property_type,
      max_guests,
      base_price,
      cleaning_fee,
      description,
      rating_avg,
      rating_count,
      listing_amenities (
        amenities (
          name
        )
      )
    `);

  if (listingsError) throw listingsError;

  const exportedListings: ExportedListing[] = (listings || []).map((listing) => ({
    title: listing.title,
    slug: listing.slug,
    city: listing.city,
    country: listing.country,
    address: listing.address || "",
    propertyType: listing.property_type,
    maxGuests: listing.max_guests,
    basePrice: listing.base_price,
    cleaningFee: listing.cleaning_fee,
    description: listing.description || "",
    rating: listing.rating_avg || 0,
    reviewCount: listing.rating_count || 0,
    amenities: listing.listing_amenities?.map((la: any) => la.amenities.name) || [],
  }));

  // Static data from Information page
  const policies = {
    cancellation: `Free cancellation up to 48 hours before check-in. Cancellations made within 48 hours of check-in are eligible for a 50% refund. No refunds for cancellations made after check-in. Service fees are non-refundable in all cases.`,
    houseRules: `Check-in: 3:00 PM - 11:00 PM. Check-out: 11:00 AM. No smoking inside the property. No parties or events. Pets allowed with prior approval. Maximum occupancy must be respected. Respect quiet hours (10 PM - 8 AM).`,
    safety: `All properties have smoke detectors and carbon monoxide detectors. Fire extinguishers are available in each property. First aid kits are provided. Emergency contact numbers are displayed in each property. Properties meet local safety regulations.`,
  };

  const faq = [
    {
      question: "How do I book a property?",
      answer: "Search for your destination and dates, select a property, review the details and price breakdown, then click 'Reserve' to complete your booking.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, and digital payment methods through our secure payment system.",
    },
    {
      question: "Can I cancel my reservation?",
      answer: "Yes, you can cancel up to 48 hours before check-in for a full refund. Cancellations within 48 hours receive a 50% refund.",
    },
    {
      question: "How do I contact my host?",
      answer: "Once your booking is confirmed, you'll receive your host's contact information via email. You can also message them through your profile.",
    },
    {
      question: "What if I need to change my dates?",
      answer: "Contact your host directly to discuss date changes. Changes are subject to availability and may affect the total price.",
    },
    {
      question: "Are pets allowed?",
      answer: "Pet policies vary by property. Check the listing details or contact the host for their specific pet policy.",
    },
  ];

  const companyInfo = {
    mission:
      "StayLite connects travelers with unique accommodations across Italy and beyond. We believe in authentic experiences, local connections, and making travel accessible to everyone.",
    contact: "Email: support@staylite.com | Phone: +39 02 1234 5678 | Address: Via Example 123, Milan, Italy",
  };

  return {
    listings: exportedListings,
    policies,
    faq,
    companyInfo,
  };
}

export function formatDataAsText(data: ExportedData): string {
  let output = "# StayLite Knowledge Base\n\n";

  // Company Info
  output += "## Company Information\n\n";
  output += `Mission: ${data.companyInfo.mission}\n\n`;
  output += `Contact: ${data.companyInfo.contact}\n\n`;

  // Policies
  output += "## Policies\n\n";
  output += "### Cancellation Policy\n";
  output += `${data.policies.cancellation}\n\n`;
  output += "### House Rules\n";
  output += `${data.policies.houseRules}\n\n`;
  output += "### Safety & Security\n";
  output += `${data.policies.safety}\n\n`;

  // FAQ
  output += "## Frequently Asked Questions\n\n";
  data.faq.forEach((item) => {
    output += `### ${item.question}\n`;
    output += `${item.answer}\n\n`;
  });

  // Listings
  output += "## Available Properties\n\n";
  data.listings.forEach((listing) => {
    output += `### ${listing.title}\n`;
    output += `- Location: ${listing.city}, ${listing.country}\n`;
    output += `- Address: ${listing.address}\n`;
    output += `- Type: ${listing.propertyType}\n`;
    output += `- Max Guests: ${listing.maxGuests}\n`;
    output += `- Base Price: €${listing.basePrice}/night\n`;
    output += `- Cleaning Fee: €${listing.cleaningFee}\n`;
    output += `- Rating: ${listing.rating}/5 (${listing.reviewCount} reviews)\n`;
    output += `- Amenities: ${listing.amenities.join(", ")}\n`;
    output += `- Description: ${listing.description}\n`;
    output += `- URL Slug: /listing/${listing.slug}\n\n`;
  });

  return output;
}

export async function downloadKnowledgeBase() {
  try {
    const data = await exportAllData();
    const textContent = formatDataAsText(data);
    
    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "staylite-knowledge-base.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error("Error exporting data:", error);
    return false;
  }
}
