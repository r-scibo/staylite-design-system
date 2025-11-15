import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, MicOff } from "lucide-react";
import { useSydeConversation } from "@/contexts/SydeConversationContext";
import { SydeAvatar } from "./SydeAvatar";
import { VoiceVisualizer } from "./VoiceVisualizer";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export const VoiceOverlay = () => {
  const {
    isOverlayOpen,
    closeVoiceInterface,
    avatarState,
    messages,
    addMessage,
    startSearch,
    searchPreferences
  } = useSydeConversation();

  const [isMicActive, setIsMicActive] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");

  // Mock conversation flow
  const mockConversationFlow = [
    { 
      trigger: 0, 
      message: "Hi! I'm Syde. What kind of place are you looking for?",
      promptUser: "Tell me about your ideal stay"
    },
    { 
      trigger: 1, 
      message: "Great! How many guests will be staying?",
      promptUser: "Number of guests"
    },
    { 
      trigger: 2, 
      message: "Perfect! What's your budget range?",
      promptUser: "Your budget per night"
    },
    { 
      trigger: 3, 
      message: "Excellent! Let me search for the perfect places for you...",
      promptUser: null
    }
  ];

  useEffect(() => {
    if (avatarState === 'listening' && messages.length > 0) {
      const step = mockConversationFlow[messages.length];
      if (step?.promptUser) {
        setCurrentPrompt(step.promptUser);
      }
    }
  }, [avatarState, messages.length]);

  const handleMicToggle = () => {
    setIsMicActive(!isMicActive);
    
    if (!isMicActive) {
      // Simulate user speaking
      setTimeout(() => {
        simulateUserResponse();
      }, 2000);
    }
  };

  const simulateUserResponse = () => {
    setIsMicActive(false);
    
    // Mock user responses based on conversation step
    const mockResponses = [
      "I need a place for 2 people in downtown Milan",
      "2 guests",
      "Around 100 to 150 euros per night",
      ""
    ];

    const response = mockResponses[messages.length];
    if (response) {
      addMessage({
        speaker: 'user',
        message: response,
        timestamp: new Date()
      });

      // Trigger next Syde response
      setTimeout(() => {
        const nextStep = mockConversationFlow[messages.length + 1];
        if (nextStep) {
          if (nextStep.trigger === 3) {
            // Start search
            addMessage({
              speaker: 'syde',
              message: nextStep.message,
              timestamp: new Date()
            });
            setTimeout(() => {
              startSearch();
            }, 2000);
          } else {
            addMessage({
              speaker: 'syde',
              message: nextStep.message,
              timestamp: new Date()
            });
          }
        }
      }, 1000);
    }
  };

  const visualizerState = isMicActive ? 'listening' : 
                          avatarState === 'speaking' ? 'speaking' : 'idle';

  return (
    <AnimatePresence>
      {isOverlayOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/10"
            onClick={closeVoiceInterface}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Main content */}
          <div className="flex flex-col items-center justify-center h-full gap-8">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <SydeAvatar state={avatarState} size="large" />
            </motion.div>

            {/* Voice Visualizer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <VoiceVisualizer state={visualizerState} />
            </motion.div>

            {/* Status Text */}
            <AnimatePresence mode="wait">
              {avatarState === 'listening' && currentPrompt && (
                <motion.p
                  key="prompt"
                  className="text-white/80 text-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {currentPrompt}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Microphone Button (Voice Integration Ready) */}
            {avatarState === 'listening' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  size="lg"
                  variant={isMicActive ? "default" : "outline"}
                  className={`rounded-full w-16 h-16 ${
                    isMicActive ? 'bg-accent text-white' : 'bg-white/10 text-white border-white/30'
                  }`}
                  onClick={handleMicToggle}
                >
                  {isMicActive ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>
                <p className="text-xs text-white/60 text-center mt-2">
                  {isMicActive ? "Listening..." : "Click to speak"}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};