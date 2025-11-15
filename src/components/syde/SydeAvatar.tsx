import { cn } from "@/lib/utils";

interface SydeAvatarProps {
  state: 'speaking' | 'listening' | 'thinking' | 'idle';
  size?: 'small' | 'large';
  className?: string;
}

export const SydeAvatar = ({ state, size = 'large', className }: SydeAvatarProps) => {
  const sizeClasses = {
    small: 'h-16 w-16',
    large: 'h-40 w-40'
  };

  const stateAnimations = {
    speaking: 'animate-pulse',
    listening: 'animate-[scale-in_2s_ease-in-out_infinite]',
    thinking: 'animate-spin-slow',
    idle: 'animate-[fade-in_3s_ease-in-out_infinite]'
  };

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "rounded-full bg-gradient-to-br from-accent via-primary to-electric",
          "flex items-center justify-center shadow-electric",
          sizeClasses[size],
          stateAnimations[state]
        )}
      >
        <div className="absolute inset-2 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className={cn("w-full h-full", size === 'small' ? 'p-3' : 'p-6')}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Simple friendly robot/AI face */}
            <circle cx="35" cy="40" r="8" fill="currentColor" className="text-accent" />
            <circle cx="65" cy="40" r="8" fill="currentColor" className="text-accent" />
            {state === 'speaking' && (
              <path
                d="M 30 65 Q 50 75 70 65"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                className="text-accent animate-pulse"
              />
            )}
            {state === 'listening' && (
              <ellipse cx="50" cy="65" rx="15" ry="8" fill="currentColor" className="text-accent" />
            )}
            {state === 'thinking' && (
              <path
                d="M 30 65 L 70 65"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                className="text-accent"
              />
            )}
            {state === 'idle' && (
              <path
                d="M 30 65 Q 50 70 70 65"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                className="text-accent opacity-70"
              />
            )}
          </svg>
        </div>
      </div>
      {state === 'speaking' && (
        <div className="absolute inset-0 rounded-full bg-accent/30 animate-ping" />
      )}
    </div>
  );
};
