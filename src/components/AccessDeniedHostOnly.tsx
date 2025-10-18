import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";
import { ShieldAlert } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const AccessDeniedHostOnly = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Focus heading on mount for accessibility
    headingRef.current?.focus();
  }, []);

  const handleSignInAsHost = async () => {
    setIsSigningOut(true);
    
    try {
      const { error } = await signOut();
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Couldn't sign out",
          description: "Please try again.",
        });
        setIsSigningOut(false);
        return;
      }

      // Successfully signed out, redirect to auth page
      navigate("/auth?next=/host");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Couldn't sign out",
        description: "Please try again.",
      });
      setIsSigningOut(false);
    }
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="max-w-md text-center">
        <div className="mb-4 inline-flex rounded-full bg-primary/10 p-4">
          <ShieldAlert className="h-12 w-12 text-primary" />
        </div>
        
        <h1 
          ref={headingRef}
          tabIndex={-1}
          className="mb-2 text-2xl font-bold text-foreground outline-none"
        >
          Host area — access requires a Host account
        </h1>
        
        <p className="mb-6 text-muted-foreground">
          You're currently logged in as a Guest. To open the Host Dashboard, please sign in with the Host demo account.
        </p>

        <div 
          className="flex flex-col gap-3 mb-4"
          aria-live="polite"
          aria-atomic="true"
        >
          <Button
            onClick={handleSignInAsHost}
            disabled={isSigningOut}
            className="w-full"
          >
            {isSigningOut ? "Signing out..." : "Sign in as Host"}
          </Button>
          
          <Button
            variant="ghost"
            onClick={handleBackToHome}
            disabled={isSigningOut}
            className="w-full"
          >
            Back to Home
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Demo Host: host@test.com / Host!234
        </p>
      </div>
    </div>
  );
};
