import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useConversation } from "@11labs/react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface VoiceAssistantContextType {
  isActive: boolean;
  isSpeaking: boolean;
  isMinimized: boolean;
  widgetConfig: WidgetConfig;
  startConversation: () => Promise<void>;
  endConversation: () => Promise<void>;
  toggleMinimize: () => void;
  updateConfig: (config: Partial<WidgetConfig>) => void;
}

export interface WidgetConfig {
  shape: "circle" | "rounded" | "square";
  size: "small" | "medium" | "large";
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  primaryColor?: string;
}

const VoiceAssistantContext = createContext<VoiceAssistantContextType | undefined>(undefined);

export const useVoiceAssistant = () => {
  const context = useContext(VoiceAssistantContext);
  if (!context) {
    throw new Error("useVoiceAssistant must be used within VoiceAssistantProvider");
  }
  return context;
};

export const VoiceAssistantProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>({
    shape: "circle",
    size: "medium",
    position: "bottom-right",
  });

  const clientTools = {
    navigateToPage: (parameters: { page: string }) => {
      const pageMap: Record<string, string> = {
        home: "/",
        search: "/search",
        profile: "/profile",
        host: "/host",
        info: "/info",
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

      if (parameters.city) searchParams.set("city", parameters.city);
      if (parameters.checkIn) searchParams.set("checkIn", parameters.checkIn);
      if (parameters.checkOut) searchParams.set("checkOut", parameters.checkOut);
      if (parameters.guests) searchParams.set("guests", parameters.guests.toString());
      if (parameters.minPrice) searchParams.set("minPrice", parameters.minPrice.toString());
      if (parameters.maxPrice) searchParams.set("maxPrice", parameters.maxPrice.toString());
      if (parameters.propertyType) searchParams.set("propertyType", parameters.propertyType);

      navigate(`/search?${searchParams.toString()}`);
      return `Searching for listings with your criteria`;
    },

    openListing: (parameters: { slug: string }) => {
      navigate(`/listing/${parameters.slug}`);
      return `Opening listing: ${parameters.slug}`;
    },

    scrollToSection: (parameters: { section: string }) => {
      const sectionMap: Record<string, string> = {
        search: "search-section",
        destinations: "destinations-section",
        "host-cta": "host-cta-section",
        features: "features-section",
      };

      const elementId = sectionMap[parameters.section];
      if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
          return `Scrolled to ${parameters.section} section`;
        }
        return `Section ${parameters.section} not found on current page`;
      }
      return `Unknown section: ${parameters.section}`;
    },

    showMessage: (parameters: { message: string; type?: string }) => {
      const typeMap: Record<string, "default" | "destructive"> = {
        error: "destructive",
        warning: "destructive",
        success: "default",
        info: "default",
      };

      toast({
        title:
          parameters.type === "error"
            ? "Error"
            : parameters.type === "warning"
              ? "Warning"
              : parameters.type === "success"
                ? "Success"
                : "Information",
        description: parameters.message,
        variant: typeMap[parameters.type || "info"] || "default",
      });

      return "Message displayed";
    },
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

  const startConversation = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-elevenlabs-signed-url`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get signed URL");
      }

      const { signedUrl } = await response.json();

      await conversation.startSession({
        signedUrl,
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
  }, [conversation, toast]);

  const endConversation = useCallback(async () => {
    await conversation.endSession();
    setIsActive(false);
  }, [conversation]);

  const toggleMinimize = useCallback(() => {
    setIsMinimized((prev) => !prev);
  }, []);

  const updateConfig = useCallback((config: Partial<WidgetConfig>) => {
    setWidgetConfig((prev) => ({ ...prev, ...config }));
  }, []);

  return (
    <VoiceAssistantContext.Provider
      value={{
        isActive,
        isSpeaking: conversation.isSpeaking,
        isMinimized,
        widgetConfig,
        startConversation,
        endConversation,
        toggleMinimize,
        updateConfig,
      }}
    >
      {children}
    </VoiceAssistantContext.Provider>
  );
};
