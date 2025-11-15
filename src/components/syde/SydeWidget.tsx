import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useSydeConversation } from "@/contexts/SydeConversationContext";
import { SydeAvatar } from "./SydeAvatar";

export const SydeWidget = () => {
  const [showTooltip, setShowTooltip] = useState(true);
  const { openVoiceInterface, avatarState } = useSydeConversation();

  const handleClick = () => {
    setShowTooltip(false);
    openVoiceInterface();
  };

  return (
    <>
      {/* Floating Widget */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <motion.button
          onClick={handleClick}
          className="relative focus:outline-none"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onHoverStart={() => setShowTooltip(true)}
        >
          <SydeAvatar state={avatarState} size="small" />
          
          {/* Pulse animation for attention */}
          <motion.div
            className="absolute inset-0 rounded-full bg-accent"
            animate={{
              scale: [1, 1.2, 1.2],
              opacity: [0.5, 0, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        </motion.button>

        {/* Proactive Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              className="absolute bottom-full right-0 mb-2 whitespace-nowrap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-background border border-border rounded-lg px-4 py-2 shadow-lg">
                <p className="text-sm font-medium text-foreground">
                  Let Syde help you! 👋
                </p>
              </div>
              {/* Arrow */}
              <div className="absolute top-full right-4 -mt-1">
                <div className="border-8 border-transparent border-t-background" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};