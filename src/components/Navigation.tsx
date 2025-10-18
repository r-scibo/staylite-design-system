import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-xl font-semibold text-foreground hover:text-primary transition-colors"
          >
            StayLite
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-8">
            <Link 
              to="/" 
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/search" 
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Search
            </Link>
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex md:items-center md:gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-foreground hover:text-primary hover:bg-secondary"
            >
              Login
            </Button>
            <Button 
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft"
            >
              Sign up
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden rounded-md p-2 text-foreground hover:bg-secondary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <Link
              to="/"
              className="block px-3 py-2 text-base font-medium text-foreground hover:bg-secondary hover:text-primary rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/search"
              className="block px-3 py-2 text-base font-medium text-foreground hover:bg-secondary hover:text-primary rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Search
            </Link>
            <div className="flex gap-3 px-3 pt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-1 text-foreground hover:text-primary hover:bg-secondary"
              >
                Login
              </Button>
              <Button 
                size="sm" 
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Sign up
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
