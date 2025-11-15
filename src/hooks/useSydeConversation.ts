import { useState, useCallback } from "react";
import { SearchParams } from "@/components/syde/SydeVoiceOverlay";

type ConversationState =
  | 'idle'
  | 'syde_speaking'
  | 'waiting_for_user'
  | 'user_speaking'
  | 'thinking'
  | 'searching';

interface ConversationStep {
  sydeMessage: string;
  userResponseKey: keyof SearchParams | 'preferences' | 'complete';
  extractValue?: (response: string) => any;
}

const conversationFlow: ConversationStep[] = [
  {
    sydeMessage: "Hi! I'm Syde. What kind of place are you looking for?",
    userResponseKey: 'preferences',
  },
  {
    sydeMessage: "Great! How many guests will be staying?",
    userResponseKey: 'guests',
    extractValue: () => 2, // Mock: extract from user speech
  },
  {
    sydeMessage: "Perfect! What's your budget range per night?",
    userResponseKey: 'minPrice',
    extractValue: () => ({ minPrice: 100, maxPrice: 150 }), // Mock extraction
  },
  {
    sydeMessage: "Excellent! Let me search for the perfect places for you...",
    userResponseKey: 'complete',
  },
];

export const useSydeConversation = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [conversationState, setConversationState] = useState<ConversationState>('idle');
  const [extractedParams, setExtractedParams] = useState<SearchParams>({});

  const startConversation = useCallback(() => {
    setCurrentStep(0);
    setExtractedParams({});
    setConversationState('syde_speaking');
    setCurrentMessage(conversationFlow[0].sydeMessage);

    // Simulate Syde speaking time
    setTimeout(() => {
      setConversationState('waiting_for_user');
    }, 2000);
  }, []);

  const simulateUserResponse = useCallback(() => {
    const step = conversationFlow[currentStep];
    
    setConversationState('user_speaking');
    setCurrentMessage(''); // Clear during user speaking

    // Simulate user speaking time
    setTimeout(() => {
      setConversationState('thinking');

      // Extract parameters if available
      if (step.extractValue) {
        const extracted = step.extractValue('mock user response');
        setExtractedParams(prev => ({ ...prev, ...extracted }));
      }

      // Move to next step
      setTimeout(() => {
        const nextStep = currentStep + 1;
        
        if (nextStep < conversationFlow.length) {
          setCurrentStep(nextStep);
          setConversationState('syde_speaking');
          setCurrentMessage(conversationFlow[nextStep].sydeMessage);

          // Check if this is the last step (searching)
          if (conversationFlow[nextStep].userResponseKey === 'complete') {
            setTimeout(() => {
              setConversationState('searching');
            }, 2000);
          } else {
            setTimeout(() => {
              setConversationState('waiting_for_user');
            }, 2000);
          }
        }
      }, 1000);
    }, 1500);
  }, [currentStep]);

  return {
    currentMessage,
    conversationState,
    startConversation,
    simulateUserResponse,
    extractedParams,
  };
};
