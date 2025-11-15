import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchAnimationBarProps {
  searchTerms: string;
  isActive: boolean;
  onComplete?: () => void;
}

export const SearchAnimationBar = ({ searchTerms, isActive, onComplete }: SearchAnimationBarProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentIndex <= searchTerms.length) {
        setDisplayedText(searchTerms.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
        setTimeout(() => {
          onComplete?.();
        }, 500);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [isActive, searchTerms, onComplete]);

  if (!isActive && !displayedText) return null;

  return (
    <div className={cn(
      "fixed top-8 left-1/2 -translate-x-1/2 z-40",
      "w-full max-w-2xl px-4 animate-slide-in-down"
    )}>
      <div className="bg-surface border border-border rounded-lg shadow-large p-4 flex items-center gap-3">
        <Search className="h-5 w-5 text-accent flex-shrink-0" />
        <div className="flex-1 text-foreground font-medium">
          {displayedText}
          {isTyping && (
            <span className="inline-block w-0.5 h-5 bg-accent ml-1 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
};
