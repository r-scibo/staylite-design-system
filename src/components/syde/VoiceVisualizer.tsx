import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface VoiceVisualizerProps {
  isActive: boolean;
  state: 'speaking' | 'listening' | 'idle';
  className?: string;
}

export const VoiceVisualizer = ({ isActive, state, className }: VoiceVisualizerProps) => {
  const [bars, setBars] = useState<number[]>(Array(20).fill(0));

  useEffect(() => {
    if (!isActive) {
      setBars(Array(20).fill(0));
      return;
    }

    const interval = setInterval(() => {
      if (state === 'speaking') {
        // Simulate active speech with random heights
        setBars(Array(20).fill(0).map(() => Math.random() * 100 + 20));
      } else if (state === 'listening') {
        // Simulate listening with moderate activity
        setBars(Array(20).fill(0).map(() => Math.random() * 60 + 10));
      } else {
        // Idle state with gentle breathing
        setBars(Array(20).fill(0).map((_, i) => {
          const wave = Math.sin(Date.now() / 1000 + i * 0.5) * 20 + 30;
          return wave;
        }));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, state]);

  return (
    <div className={cn("flex items-end justify-center gap-1 h-32", className)}>
      {bars.map((height, i) => (
        <div
          key={i}
          className={cn(
            "w-2 rounded-full transition-all duration-100",
            state === 'speaking' ? "bg-accent" : "bg-primary",
            state === 'idle' && "opacity-50"
          )}
          style={{
            height: `${height}%`,
            minHeight: '8px'
          }}
        />
      ))}
    </div>
  );
};
