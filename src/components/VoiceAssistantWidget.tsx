import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Minimize2, Maximize2, X } from "lucide-react";
import { useVoiceAssistant } from "@/contexts/VoiceAssistantContext";
import { cn } from "@/lib/utils";

export const VoiceAssistantWidget = () => {
  const {
    isActive,
    isSpeaking,
    isMinimized,
    widgetConfig,
    startConversation,
    endConversation,
    toggleMinimize,
    updateConfig,
  } = useVoiceAssistant();

  // Listen for postMessage commands from parent window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // In production, validate event.origin for security
      const { type, payload } = event.data;

      switch (type) {
        case "VOICE_WIDGET_CONFIG":
          updateConfig(payload);
          break;
        case "VOICE_WIDGET_START":
          startConversation();
          break;
        case "VOICE_WIDGET_END":
          endConversation();
          break;
        case "VOICE_WIDGET_TOGGLE_MINIMIZE":
          toggleMinimize();
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [updateConfig, startConversation, endConversation, toggleMinimize]);

  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
  };

  const sizeClasses = {
    small: "w-14 h-14",
    medium: "w-16 h-16",
    large: "w-20 h-20",
  };

  const expandedSizeClasses = {
    small: "w-72",
    medium: "w-80",
    large: "w-96",
  };

  const shapeClasses = {
    circle: "rounded-full",
    rounded: "rounded-2xl",
    square: "rounded-lg",
  };

  if (!isActive && !isMinimized) {
    return (
      <div className={cn("fixed z-50", positionClasses[widgetConfig.position])}>
        <Button
          onClick={startConversation}
          size="lg"
          className={cn(
            "shadow-lg hover:shadow-xl transition-all duration-300",
            sizeClasses[widgetConfig.size],
            shapeClasses[widgetConfig.shape],
            "bg-accent hover:bg-accent/90"
          )}
        >
          <Mic className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  if (isMinimized) {
    return (
      <div className={cn("fixed z-50", positionClasses[widgetConfig.position])}>
        <Button
          onClick={toggleMinimize}
          size="lg"
          className={cn(
            "shadow-lg relative",
            sizeClasses[widgetConfig.size],
            shapeClasses[widgetConfig.shape],
            "bg-accent hover:bg-accent/90"
          )}
        >
          <Mic className="h-6 w-6" />
          {isSpeaking && (
            <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-75" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "fixed z-50 bg-card border border-border shadow-2xl transition-all duration-300",
        positionClasses[widgetConfig.position],
        expandedSizeClasses[widgetConfig.size],
        shapeClasses[widgetConfig.shape],
        "p-4"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div
              className={cn(
                "h-10 w-10 rounded-full bg-accent flex items-center justify-center",
                shapeClasses[widgetConfig.shape]
              )}
            >
              <Mic className="h-5 w-5 text-accent-foreground" />
            </div>
            {isSpeaking && (
              <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-75" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold">Voice Assistant</p>
            <p className="text-xs text-muted">
              {isSpeaking ? "Speaking..." : "Listening..."}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            onClick={toggleMinimize}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            onClick={endConversation}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted">
            I can help you search for properties, navigate the site, and answer questions
            about StayLite.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={endConversation}
            variant="destructive"
            size="sm"
            className="flex-1 gap-2"
          >
            <MicOff className="h-4 w-4" />
            End Call
          </Button>
        </div>
      </div>
    </div>
  );
};
