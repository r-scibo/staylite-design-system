import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type AvatarState = 'speaking' | 'listening' | 'thinking' | 'idle';
type AvatarSize = 'small' | 'large';

interface SydeAvatarProps {
  state: AvatarState;
  size?: AvatarSize;
  className?: string;
}

export const SydeAvatar = ({ state, size = 'large', className }: SydeAvatarProps) => {
  const sizeClasses = {
    small: 'w-16 h-16',
    large: 'w-32 h-32'
  };

  const glowColors = {
    speaking: 'shadow-[0_0_30px_rgba(14,124,134,0.6)]',
    listening: 'shadow-[0_0_30px_rgba(14,124,134,0.4)]',
    thinking: 'shadow-[0_0_30px_rgba(100,116,139,0.4)]',
    idle: 'shadow-[0_0_20px_rgba(14,124,134,0.2)]'
  };

  const getAnimation = () => {
    switch (state) {
      case 'speaking':
        return {
          scale: [1, 1.05, 1],
          transition: {
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut" as const
          }
        };
      case 'listening':
        return {
          scale: [1, 1.02, 1],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut" as const
          }
        };
      case 'thinking':
        return {
          rotate: [0, 5, -5, 0],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut" as const
          }
        };
      case 'idle':
        return {
          scale: [1, 1.01, 1],
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut" as const
          }
        };
    }
  };

  return (
    <motion.div
      className={cn(
        "relative rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center",
        sizeClasses[size],
        glowColors[state],
        className
      )}
      animate={getAnimation()}
    >
      {/* Avatar character - using initials for now */}
      <div className="text-white font-bold" style={{ fontSize: size === 'large' ? '3rem' : '1.5rem' }}>
        S
      </div>
      
      {/* Pulse ring for speaking state */}
      {state === 'speaking' && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-accent"
          animate={{
            scale: [1, 1.3, 1.3],
            opacity: [0.8, 0, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      )}
      
      {/* Listening indicator */}
      {state === 'listening' && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <motion.div
            className="w-2 h-2 bg-accent rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      )}
    </motion.div>
  );
};