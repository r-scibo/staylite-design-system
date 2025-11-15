import { useEffect, useRef } from "react";
import { useVoiceAssistant } from "@/contexts/VoiceAssistantContext";

export const SydeEmbed = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { widgetConfig } = useVoiceAssistant();

  useEffect(() => {
    // Listen for messages from Syde iframe
    const handleMessage = (event: MessageEvent) => {
      console.log('Message from Syde:', event.data);
      
      if (event.origin !== "https://syde.lovable.app") return;
      
      if (event.data.type === 'VOICE_WIDGET_CONFIG') {
        const config = event.data.payload;
        console.log('Widget config:', config);
        
        // Forward to voice widget
        window.postMessage(event.data, "*");
        
        // Send acknowledgment back to Syde
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({
            type: 'CONFIG_RECEIVED',
            payload: { success: true }
          }, '*');
        }
      }
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
        src="https://syde.lovable.app/debug-comms"
        className="w-full h-full"
        title="Syde Voice Widget Customizer"
        allow="microphone"
      />
    </div>
  );
};
