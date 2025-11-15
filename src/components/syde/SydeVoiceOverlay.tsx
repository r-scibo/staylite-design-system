import { useState, useEffect } from "react";
import { X, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SydeAvatar } from "./SydeAvatar";
import { VoiceVisualizer } from "./VoiceVisualizer";
import { cn } from "@/lib/utils";
import { useSydeConversation } from "@/hooks/useSydeConversation";

interface SydeVoiceOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (params: SearchParams) => void;
}

export interface SearchParams {
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  amenities?: string[];
}

export const SydeVoiceOverlay = ({ isOpen, onClose, onSearch }: SydeVoiceOverlayProps) => {
  const {
    currentMessage,
    conversationState,
    startConversation,
    simulateUserResponse,
    extractedParams
  } = useSydeConversation();

  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startConversation();
    }
  }, [isOpen, startConversation]);

  useEffect(() => {
    if (conversationState === 'waiting_for_user') {
      setShowPrompt(true);
    } else {
      setShowPrompt(false);
    }
  }, [conversationState]);

  useEffect(() => {
    if (conversationState === 'searching' && extractedParams && onSearch) {
      // Wait a moment to show the search animation
      setTimeout(() => {
        onSearch(extractedParams);
        onClose();
      }, 2000);
    }
  }, [conversationState, extractedParams, onSearch, onClose]);

  if (!isOpen) return null;

  const avatarState =
    conversationState === 'syde_speaking' ? 'speaking' :
    conversationState === 'user_speaking' ? 'listening' :
    conversationState === 'thinking' ? 'thinking' : 'idle';

  const visualizerState =
    conversationState === 'syde_speaking' ? 'speaking' :
    conversationState === 'user_speaking' ? 'listening' : 'idle';

  return (
    <div className="fixed inset-0 z-50 animate-fade-in">
      {/* Dark transparent overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />

      {/* Close button */}
      <Button
        onClick={onClose}
        variant="ghost"
        size="icon"
        className="absolute top-8 right-8 z-10 text-foreground hover:bg-muted"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Main content */}
      <div className="relative h-full flex flex-col items-center justify-center gap-8 p-8">
        {/* Avatar */}
        <SydeAvatar state={avatarState} size="large" className="animate-scale-in" />

        {/* Voice Visualizer */}
        <VoiceVisualizer
          isActive={conversationState !== 'idle'}
          state={visualizerState}
          className="animate-fade-in"
        />

        {/* Current message */}
        {currentMessage && (
          <div className="max-w-2xl text-center animate-fade-in">
            <p className="text-xl text-foreground">{currentMessage}</p>
          </div>
        )}

        {/* User prompt */}
        {showPrompt && (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <p className="text-sm text-muted">Your turn to speak</p>
            <Button
              onClick={simulateUserResponse}
              size="lg"
              className="rounded-full gap-2"
              disabled={conversationState === 'user_speaking'}
            >
              <Mic className="h-5 w-5" />
              {conversationState === 'user_speaking' ? 'Speaking...' : 'Speak'}
            </Button>
          </div>
        )}

        {/* Searching state */}
        {conversationState === 'searching' && (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent" />
            <p className="text-lg text-muted">Finding perfect places for you...</p>
          </div>
        )}
      </div>
    </div>
  );
};
