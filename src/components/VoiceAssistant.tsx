import { useConversation } from "@11labs/react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Phone } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const AGENT_ID = "agent_4901ka3wrqzgedvr4f03bdt1924f";

export const VoiceAssistant = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  
  const clientTools = {
    navigateToPage: (parameters: { page: string }) => {
      const pageMap: Record<string, string> = {
        home: '/',
        search: '/search',
        profile: '/profile',
        host: '/host',
        info: '/info'
      };
      
      const path = pageMap[parameters.page];
      if (path) {
        navigate(path);
        return `Navigated to ${parameters.page} page`;
      }
      return `Unknown page: ${parameters.page}`;
    },

    searchListings: (parameters: {
      city?: string;
      checkIn?: string;
      checkOut?: string;
      guests?: number;
      minPrice?: number;
      maxPrice?: number;
      propertyType?: string;
    }) => {
      const searchParams = new URLSearchParams();
      
      if (parameters.city) searchParams.set('city', parameters.city);
      if (parameters.checkIn) searchParams.set('checkIn', parameters.checkIn);
      if (parameters.checkOut) searchParams.set('checkOut', parameters.checkOut);
      if (parameters.guests) searchParams.set('guests', parameters.guests.toString());
      if (parameters.minPrice) searchParams.set('minPrice', parameters.minPrice.toString());
      if (parameters.maxPrice) searchParams.set('maxPrice', parameters.maxPrice.toString());
      if (parameters.propertyType) searchParams.set('propertyType', parameters.propertyType);
      
      navigate(`/search?${searchParams.toString()}`);
      return `Searching for listings with your criteria`;
    },

    openListing: (parameters: { slug: string }) => {
      navigate(`/listing/${parameters.slug}`);
      return `Opening listing: ${parameters.slug}`;
    },

    scrollToSection: (parameters: { section: string }) => {
      const sectionMap: Record<string, string> = {
        search: 'search-section',
        destinations: 'destinations-section',
        'host-cta': 'host-cta-section',
        features: 'features-section'
      };
      
      const elementId = sectionMap[parameters.section];
      if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return `Scrolled to ${parameters.section} section`;
        }
        return `Section ${parameters.section} not found on current page`;
      }
      return `Unknown section: ${parameters.section}`;
    },

    showMessage: (parameters: { message: string; type?: string }) => {
      const typeMap: Record<string, 'default' | 'destructive'> = {
        error: 'destructive',
        warning: 'destructive',
        success: 'default',
        info: 'default'
      };
      
      toast({
        title: parameters.type === 'error' ? 'Error' : 
               parameters.type === 'warning' ? 'Warning' :
               parameters.type === 'success' ? 'Success' : 'Information',
        description: parameters.message,
        variant: typeMap[parameters.type || 'info'] || 'default'
      });
      
      return 'Message displayed';
    }
  };
  
  const conversation = useConversation({
    clientTools,
    onConnect: () => {
      toast({
        title: "Voice assistant connected",
        description: "You can now speak with our AI assistant",
      });
    },
    onDisconnect: () => {
      toast({
        title: "Voice assistant disconnected",
        description: "Conversation ended",
      });
      setIsActive(false);
    },
    onError: (error) => {
      console.error("Voice assistant error:", error);
      toast({
        title: "Connection error",
        description: "Failed to connect to voice assistant",
        variant: "destructive",
      });
      setIsActive(false);
    },
  });

  const handleStart = async () => {
    try {
      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Get signed URL from our edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-elevenlabs-signed-url`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get signed URL');
      }

      const { signedUrl } = await response.json();
      
      // Start conversation with signed URL
      await conversation.startSession({ 
        signedUrl 
      });
      setIsActive(true);
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast({
        title: "Failed to start voice assistant",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleEnd = async () => {
    await conversation.endSession();
    setIsActive(false);
  };

  return (
    <Card className="border-accent">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent rounded-lg">
            <Phone className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <CardTitle>Voice Assistant</CardTitle>
            <CardDescription>Speak with our AI assistant for instant help</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            {!isActive ? (
              <Button 
                onClick={handleStart} 
                size="lg"
                className="gap-2"
              >
                <Mic className="h-5 w-5" />
                Start Voice Assistant
              </Button>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center">
                      <Mic className="h-6 w-6 text-accent-foreground" />
                    </div>
                    {conversation.isSpeaking && (
                      <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-75" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Assistant Active</p>
                    <p className="text-xs text-muted">
                      {conversation.isSpeaking ? "Speaking..." : "Listening..."}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleEnd} 
                  variant="destructive"
                  size="lg"
                  className="gap-2"
                >
                  <MicOff className="h-5 w-5" />
                  End Call
                </Button>
              </>
            )}
          </div>
          <p className="text-xs text-muted text-center max-w-md">
            Our AI assistant can help you with bookings, property information, and answer any questions about StayLite
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
