import { SydeWidget } from "./SydeWidget";
import { VoiceOverlay } from "./VoiceOverlay";
import { SearchAnimation } from "./SearchAnimation";
import { SydeConversationProvider } from "@/contexts/SydeConversationContext";

/**
 * Main container for Syde voice assistant
 * Includes widget, voice overlay, and search animations
 * VOICE INTEGRATION READY - UI complete, ready for ElevenLabs API
 */
export const SydeContainer = () => {
  return (
    <SydeConversationProvider>
      <SydeWidget />
      <VoiceOverlay />
      <SearchAnimation />
    </SydeConversationProvider>
  );
};