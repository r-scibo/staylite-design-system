import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SydeAvatar } from "./SydeAvatar";

interface SydeWidgetProps {
  onClick: () => void;
  className?: string;
}

export const SydeWidget = ({ onClick, className }: SydeWidgetProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  const handleClick = () => {
    setShowTooltip(false);
    onClick();
  };

  return (
    <div className={cn("fixed bottom-8 right-8 z-50", className)}>
      {/* Proactive tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-4 animate-fade-in">
          <div className="bg-accent text-accent-foreground px-4 py-2 rounded-lg shadow-lg whitespace-nowrap">
            Let Syde help you! 👋
            <div className="absolute bottom-0 right-8 transform translate-y-1/2 rotate-45 w-3 h-3 bg-accent" />
          </div>
        </div>
      )}

      <Button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative rounded-full p-0 h-20 w-20 overflow-visible shadow-electric hover:shadow-cyan transition-all"
        size="icon"
      >
        <SydeAvatar state="idle" size="small" />
        {isHovered && (
          <div className="absolute inset-0 rounded-full bg-accent/20 animate-ping" />
        )}
      </Button>
    </div>
  );
};
