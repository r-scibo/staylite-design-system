import { motion } from "framer-motion";
import { useSydeConversation } from "@/contexts/SydeConversationContext";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export const SearchAnimation = () => {
  const { conversationState, searchPreferences } = useSydeConversation();
  const [searchText, setSearchText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (conversationState === 'SEARCHING') {
      setIsTyping(true);
      
      // Build search query from preferences
      const parts = [];
      if (searchPreferences.guests) parts.push(`${searchPreferences.guests} guests`);
      if (searchPreferences.budget) {
        parts.push(`€${searchPreferences.budget.min}-${searchPreferences.budget.max}/night`);
      }
      if (searchPreferences.location) parts.push(searchPreferences.location);
      if (searchPreferences.amenities?.length) {
        parts.push(searchPreferences.amenities.join(', '));
      }
      
      const fullText = parts.length > 0 ? parts.join(", ") : "2 guests, €100-150/night, downtown Milan, wifi";
      
      // Typing animation
      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        if (currentIndex <= fullText.length) {
          setSearchText(fullText.substring(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
        }
      }, 50);

      return () => clearInterval(typingInterval);
    }
  }, [conversationState, searchPreferences]);

  if (conversationState !== 'SEARCHING') return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-background rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="space-y-6">
          {/* Search bar with typing animation */}
          <div className="relative">
            <div className="bg-muted rounded-lg p-4 min-h-[60px] flex items-center">
              <p className="text-foreground font-medium">
                {searchText}
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    |
                  </motion.span>
                )}
              </p>
            </div>
          </div>

          {/* Loading indicator */}
          <div className="flex items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-accent" />
            <p className="text-sm">Searching for perfect places...</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};