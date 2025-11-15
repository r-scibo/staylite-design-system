import { useConversation } from "@11labs/react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Phone } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const AGENT_ID = "agent_4901ka3wrqzgedvr4f03bdt1924f";

export const VoiceAssistant = () => {
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(false);
  
  const conversation = useConversation({
    onConnect: () => {
      toast({
        title: "Voice assistant connected",
        description: "You can now speak with our AI assistant",
      });
    },
    onDisconnect: () => {
      toast({
        title: "Voice assistant disconnected",
        description: "Conversation ended",
      });
      setIsActive(false);
    },
    onError: (error) => {
      console.error("Voice assistant error:", error);
      toast({
        title: "Connection error",
        description: "Failed to connect to voice assistant",
        variant: "destructive",
      });
      setIsActive(false);
    },
  });

  const handleStart = async () => {
    try {
      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start conversation
      await conversation.startSession({ 
        agentId: AGENT_ID 
      });
      setIsActive(true);
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast({
        title: "Microphone access required",
        description: "Please allow microphone access to use voice assistant",
        variant: "destructive",
      });
    }
  };

  const handleEnd = async () => {
    await conversation.endSession();
    setIsActive(false);
  };

  return (
    <Card className="border-accent">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent rounded-lg">
            <Phone className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <CardTitle>Voice Assistant</CardTitle>
            <CardDescription>Speak with our AI assistant for instant help</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            {!isActive ? (
              <Button 
                onClick={handleStart} 
                size="lg"
                className="gap-2"
              >
                <Mic className="h-5 w-5" />
                Start Voice Assistant
              </Button>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center">
                      <Mic className="h-6 w-6 text-accent-foreground" />
                    </div>
                    {conversation.isSpeaking && (
                      <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-75" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Assistant Active</p>
                    <p className="text-xs text-muted">
                      {conversation.isSpeaking ? "Speaking..." : "Listening..."}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleEnd} 
                  variant="destructive"
                  size="lg"
                  className="gap-2"
                >
                  <MicOff className="h-5 w-5" />
                  End Call
                </Button>
              </>
            )}
          </div>
          <p className="text-xs text-muted text-center max-w-md">
            Our AI assistant can help you with bookings, property information, and answer any questions about StayLite
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
