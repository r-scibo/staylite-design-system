import { useEffect, useRef } from "react";
import { useVoiceAssistant } from "@/contexts/VoiceAssistantContext";

export const SydeEmbed = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { widgetConfig } = useVoiceAssistant();

  useEffect(() => {
    // Listen for messages from Syde iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://syde.lovable.app") return;
      
      // Forward Syde messages to voice widget
      window.postMessage(event.data, "*");
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Send current config to Syde when iframe loads
  useEffect(() => {
    const handleLoad = () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          {
            type: "VOICE_WIDGET_CONFIG",
            payload: widgetConfig,
          },
          "*"
        );
      }
    };

    const iframe = iframeRef.current;
    iframe?.addEventListener("load", handleLoad);
    return () => iframe?.removeEventListener("load", handleLoad);
  }, [widgetConfig]);

  return (
    <div className="w-full h-[600px] border border-border rounded-lg overflow-hidden">
      <iframe
        ref={iframeRef}
        src="https://syde.lovable.app/customize"
        className="w-full h-full"
        title="Syde Voice Widget Customizer"
        allow="microphone"
      />
    </div>
  );
};
