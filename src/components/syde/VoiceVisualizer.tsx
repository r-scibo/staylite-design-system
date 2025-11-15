import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type VisualizerState = 'speaking' | 'listening' | 'idle';

interface VoiceVisualizerProps {
  state: VisualizerState;
  frequencyData?: number[]; // Will come from ElevenLabs later
  className?: string;
}

export const VoiceVisualizer = ({ state, frequencyData, className }: VoiceVisualizerProps) => {
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    // Generate mock frequency data for different states
    const barCount = 40;
    
    if (frequencyData) {
      setBars(frequencyData);
      return;
    }

    const interval = setInterval(() => {
      const newBars = Array.from({ length: barCount }, (_, i) => {
        switch (state) {
          case 'speaking':
            return Math.random() * 80 + 20; // Active bars
          case 'listening':
            return Math.random() * 50 + 10; // Responsive bars
          case 'idle':
            return Math.random() * 20 + 5; // Gentle breathing
          default:
            return 10;
        }
      });
      setBars(newBars);
    }, 50);

    return () => clearInterval(interval);
  }, [state, frequencyData]);

  const colors = {
    speaking: 'bg-accent',
    listening: 'bg-primary',
    idle: 'bg-muted-foreground/30'
  };

  return (
    <div className={`flex items-end justify-center gap-1 h-32 ${className}`}>
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className={`w-1 rounded-full ${colors[state]}`}
          initial={{ height: 10 }}
          animate={{ 
            height: `${height}%`,
            opacity: state === 'idle' ? 0.5 : 1
          }}
          transition={{
            duration: 0.1,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};