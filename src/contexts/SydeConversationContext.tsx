import { createContext, useContext, useState, ReactNode } from 'react';

export type ConversationState = 
  | 'WIDGET_VISIBLE'
  | 'VOICE_ACTIVE'
  | 'SYDE_SPEAKING'
  | 'USER_SPEAKING'
  | 'SEARCHING'
  | 'RESULTS_SHOWN'
  | 'PDP_ACTIVE';

export type AvatarState = 'speaking' | 'listening' | 'thinking' | 'idle';

interface Message {
  speaker: 'syde' | 'user';
  message: string;
  timestamp: Date;
}

interface SearchPreferences {
  guests?: number;
  budget?: { min: number; max: number };
  location?: string;
  amenities?: string[];
}

interface SydeConversationContextType {
  conversationState: ConversationState;
  avatarState: AvatarState;
  isOverlayOpen: boolean;
  messages: Message[];
  searchPreferences: SearchPreferences;
  currentPrompt: string;
  setConversationState: (state: ConversationState) => void;
  setAvatarState: (state: AvatarState) => void;
  openVoiceInterface: () => void;
  closeVoiceInterface: () => void;
  addMessage: (message: Message) => void;
  updateSearchPreferences: (prefs: Partial<SearchPreferences>) => void;
  setCurrentPrompt: (prompt: string) => void;
  startSearch: () => void;
  resetConversation: () => void;
}

const SydeConversationContext = createContext<SydeConversationContextType | undefined>(undefined);

export const SydeConversationProvider = ({ children }: { children: ReactNode }) => {
  const [conversationState, setConversationState] = useState<ConversationState>('WIDGET_VISIBLE');
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchPreferences, setSearchPreferences] = useState<SearchPreferences>({});
  const [currentPrompt, setCurrentPrompt] = useState('');

  const openVoiceInterface = () => {
    setIsOverlayOpen(true);
    setConversationState('VOICE_ACTIVE');
    setAvatarState('speaking');
    
    // Start with greeting if no messages
    if (messages.length === 0) {
      setTimeout(() => {
        addMessage({
          speaker: 'syde',
          message: "Hi! I'm Syde. What kind of place are you looking for?",
          timestamp: new Date()
        });
      }, 500);
    }
  };

  const closeVoiceInterface = () => {
    setIsOverlayOpen(false);
    setConversationState('WIDGET_VISIBLE');
    setAvatarState('idle');
  };

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
    
    // Auto-advance conversation state based on message
    if (message.speaker === 'syde') {
      setAvatarState('speaking');
      setTimeout(() => {
        setAvatarState('listening');
      }, 2000);
    } else {
      setAvatarState('thinking');
    }
  };

  const updateSearchPreferences = (prefs: Partial<SearchPreferences>) => {
    setSearchPreferences(prev => ({ ...prev, ...prefs }));
  };

  const startSearch = () => {
    setConversationState('SEARCHING');
    setAvatarState('thinking');
    
    setTimeout(() => {
      setConversationState('RESULTS_SHOWN');
      closeVoiceInterface();
    }, 3000);
  };

  const resetConversation = () => {
    setMessages([]);
    setSearchPreferences({});
    setCurrentPrompt('');
    setConversationState('WIDGET_VISIBLE');
    setAvatarState('idle');
  };

  return (
    <SydeConversationContext.Provider
      value={{
        conversationState,
        avatarState,
        isOverlayOpen,
        messages,
        searchPreferences,
        currentPrompt,
        setConversationState,
        setAvatarState,
        openVoiceInterface,
        closeVoiceInterface,
        addMessage,
        updateSearchPreferences,
        setCurrentPrompt,
        startSearch,
        resetConversation,
      }}
    >
      {children}
    </SydeConversationContext.Provider>
  );
};

export const useSydeConversation = () => {
  const context = useContext(SydeConversationContext);
  if (!context) {
    throw new Error('useSydeConversation must be used within SydeConversationProvider');
  }
  return context;
};