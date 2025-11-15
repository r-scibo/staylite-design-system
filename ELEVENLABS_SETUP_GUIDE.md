# ElevenLabs Voice Agent - StayLite Integration Guide

## Step 2: Custom Tools Setup (Complete)

### 🎯 Overview
Three backend API endpoints have been created to enable your ElevenLabs voice agent to search properties, get details, and initiate bookings in real-time.

---

## 📋 Tools Created

### 1. **search_apartments**
- **Purpose**: Search available properties by location, dates, guests, and filters
- **Endpoint**: `https://aqedotdjyvxwzhmpevtz.supabase.co/functions/v1/search-apartments`
- **When to use**: Customer asks to find/search properties
- **Example prompts**: 
  - "Find me a place in Milan"
  - "Show apartments in Rome for next week"
  - "What's available in Florence for 2 guests?"

### 2. **get_listing_details**
- **Purpose**: Get complete information about a specific property
- **Endpoint**: `https://aqedotdjyvxwzhmpevtz.supabase.co/functions/v1/get-listing-details`
- **When to use**: Customer wants more info, reviews, amenities, photos
- **Example prompts**:
  - "Tell me more about the Milan Duomo Loft"
  - "What amenities does that apartment have?"
  - "Show me reviews"

### 3. **initiate_booking**
- **Purpose**: Start booking process with pricing and availability validation
- **Endpoint**: `https://aqedotdjyvxwzhmpevtz.supabase.co/functions/v1/initiate-booking`
- **When to use**: Customer confirms they want to book
- **Example prompts**:
  - "I want to book this property"
  - "Yes, let's proceed"
  - "Book it for me"

---

## 🔧 Setup Instructions for ElevenLabs Dashboard

### Step 1: Navigate to Tools Section
1. Open your ElevenLabs Agent Dashboard
2. Click on the **Tools** or **Custom Tools** section
3. Click **Add Tool** or **Import Tools**

### Step 2: Import Tool Definitions
You have two options:

#### Option A: Import JSON File (Recommended)
1. Download the `elevenlabs-tools-config.json` file from your StayLite project
2. In ElevenLabs dashboard, click **Import from JSON**
3. Upload the `elevenlabs-tools-config.json` file
4. All three tools will be configured automatically

#### Option B: Manual Configuration
For each tool, add these details:

**Tool 1: search_apartments**
```json
{
  "name": "search_apartments",
  "description": "Use this tool to search the StayLite database for available apartments and properties. ALWAYS use this when a customer asks to find, search, or browse properties. Examples: 'Can you help me find a place in Milan?', 'Show me apartments in Rome for next week', 'What's available in Florence for 2 guests?'. Required parameters: location (city name). Optional: checkIn/checkOut dates (YYYY-MM-DD), guests (number), minPrice/maxPrice (EUR), propertyType (apartment/house/villa/studio/loft).",
  "endpoint": "https://aqedotdjyvxwzhmpevtz.supabase.co/functions/v1/search-apartments",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "parameters": {
    "type": "object",
    "properties": {
      "location": {"type": "string", "description": "City name to search in (e.g., Milan, Rome, Florence)"},
      "checkIn": {"type": "string", "description": "Check-in date in YYYY-MM-DD format"},
      "checkOut": {"type": "string", "description": "Check-out date in YYYY-MM-DD format"},
      "guests": {"type": "integer", "description": "Number of guests"},
      "minPrice": {"type": "number", "description": "Minimum price per night in EUR"},
      "maxPrice": {"type": "number", "description": "Maximum price per night in EUR"},
      "propertyType": {"type": "string", "enum": ["apartment", "house", "villa", "studio", "loft"], "description": "Type of property"}
    },
    "required": ["location"]
  }
}
```

**Tool 2: get_listing_details**
```json
{
  "name": "get_listing_details",
  "description": "Use this tool to get complete details about a specific property listing. Use this when a customer asks for more information about a property, wants to see reviews, amenities, photos, or check availability. You can search by listingId (UUID) or slug (URL-friendly name). Examples: 'Tell me more about the Milan Duomo Loft', 'What amenities does that apartment have?', 'Show me reviews for that property'. Either listingId OR slug is required. Optional: checkIn/checkOut to check availability.",
  "endpoint": "https://aqedotdjyvxwzhmpevtz.supabase.co/functions/v1/get-listing-details",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "parameters": {
    "type": "object",
    "properties": {
      "listingId": {"type": "string", "description": "UUID of the listing"},
      "slug": {"type": "string", "description": "URL slug of the listing (from search results)"},
      "checkIn": {"type": "string", "description": "Check-in date in YYYY-MM-DD format to check availability"},
      "checkOut": {"type": "string", "description": "Check-out date in YYYY-MM-DD format to check availability"}
    }
  }
}
```

**Tool 3: initiate_booking**
```json
{
  "name": "initiate_booking",
  "description": "Use this tool to start the booking process for a property. ONLY use this after the customer has confirmed they want to book. This validates availability, calculates pricing, and generates a booking URL for the customer to complete. Examples: 'I want to book this property', 'Yes, let's proceed with the booking', 'Book it for me'. Required: listingId or slug, checkIn, checkOut, guests. Returns a booking URL that the customer must visit to sign in and complete payment.",
  "endpoint": "https://aqedotdjyvxwzhmpevtz.supabase.co/functions/v1/initiate-booking",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "parameters": {
    "type": "object",
    "properties": {
      "listingId": {"type": "string", "description": "UUID of the listing to book"},
      "slug": {"type": "string", "description": "URL slug of the listing to book"},
      "checkIn": {"type": "string", "description": "Check-in date in YYYY-MM-DD format"},
      "checkOut": {"type": "string", "description": "Check-out date in YYYY-MM-DD format"},
      "guests": {"type": "integer", "description": "Number of guests"}
    },
    "required": ["checkIn", "checkOut", "guests"]
  }
}
```

### Step 3: No Authentication Required
These endpoints are **public** and do not require API keys. The edge functions use CORS headers to accept requests from any origin, including ElevenLabs.

---

## 🧪 Testing Your Tools

### Test in ElevenLabs Dashboard
1. Go to your agent's Test/Preview mode
2. Try these example conversations:

**Test Search:**
- "Find me apartments in Milan"
- Expected: Agent calls `search_apartments`, returns list of properties

**Test Details:**
- "Tell me more about the Milan Duomo Loft"
- Expected: Agent calls `get_listing_details`, returns full property info

**Test Booking:**
- After getting details: "I want to book this for December 20-25 for 2 guests"
- Expected: Agent calls `initiate_booking`, returns pricing and booking URL

### Verify Tool Calls
- Check the ElevenLabs dashboard logs to see tool execution
- Verify responses contain expected data (listings, prices, URLs)
- Test edge cases (no results, invalid dates, too many guests)

---

## 📊 Expected Response Formats

### search_apartments Response:
```json
{
  "success": true,
  "count": 3,
  "listings": [
    {
      "id": "uuid",
      "title": "Milan Duomo Loft",
      "slug": "milan-duomo-loft",
      "city": "Milan",
      "pricePerNight": 150,
      "rating": 4.8,
      "detailsUrl": "https://staylite.lovable.app/listing/milan-duomo-loft"
    }
  ],
  "message": "Found 3 available properties"
}
```

### get_listing_details Response:
```json
{
  "success": true,
  "listing": {
    "title": "Milan Duomo Loft",
    "description": "...",
    "amenities": [...],
    "recentReviews": [...],
    "availability": {
      "isAvailable": true,
      "message": "Available for 2024-12-20 to 2024-12-25"
    },
    "bookingUrl": "https://staylite.lovable.app/listing/milan-duomo-loft?checkIn=..."
  }
}
```

### initiate_booking Response:
```json
{
  "success": true,
  "canProceed": true,
  "booking": {
    "checkIn": "2024-12-20",
    "checkOut": "2024-12-25",
    "nights": 5,
    "pricing": {
      "pricePerNight": 150,
      "subtotal": 750,
      "cleaningFee": 50,
      "serviceFee": 90,
      "taxes": 75,
      "total": 965
    }
  },
  "bookingUrl": "https://staylite.lovable.app/listing/milan-duomo-loft?checkIn=2024-12-20&checkOut=2024-12-25&guests=2",
  "message": "Perfect! I'll direct you to complete your booking at: [URL]",
  "nextStep": "Please visit the booking URL to sign in/register and complete your payment."
}
```

---

## 🎤 Suggested Agent Prompts

Add these to your ElevenLabs agent's system prompt:

```
You are a helpful StayLite booking assistant. When customers want to:

1. SEARCH properties:
   - Always use the search_apartments tool
   - Ask for location if not provided
   - Offer to filter by dates, guests, price, or property type
   - Present results conversationally (e.g., "I found 3 great options in Milan...")

2. GET DETAILS:
   - Use get_listing_details when they want more info
   - Highlight key features: amenities, reviews, location
   - Check availability if dates are known
   - Provide the detailsUrl for them to view photos

3. BOOK:
   - Only use initiate_booking AFTER they confirm booking intent
   - Validate all required info: dates, guests
   - Clearly explain the total pricing breakdown
   - Direct them to the bookingUrl to complete payment
   - Explain they'll need to sign in/register on the website

Always be friendly, helpful, and speak in EUR (€) for prices.
```

---

## ✅ Checklist

- [ ] Import `elevenlabs-tools-config.json` to ElevenLabs dashboard
- [ ] Verify all 3 tools appear in Tools section
- [ ] Test search_apartments with "Find me a place in Milan"
- [ ] Test get_listing_details with a property from search results
- [ ] Test initiate_booking with confirmed booking intent
- [ ] Update agent system prompt with suggested guidelines
- [ ] Test full conversation flow: search → details → booking

---

## 🚀 Next Steps

Once tools are configured and tested:
1. **Deploy your agent** in ElevenLabs
2. **Test end-to-end** with real voice interactions
3. **Monitor logs** for any tool calling issues
4. **Iterate prompts** to improve agent behavior

---

## 📞 Need Help?

If you encounter issues:
- Check ElevenLabs dashboard logs for tool execution errors
- Verify endpoint URLs are correct (project ID: aqedotdjyvxwzhmpevtz)
- Test endpoints directly using curl/Postman to verify they work
- Ensure agent descriptions are clear about when to use each tool
