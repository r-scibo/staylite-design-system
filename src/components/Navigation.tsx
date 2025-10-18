import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { UserMenu } from "./UserMenu";
import { LoadingSpinner } from "./LoadingSpinner";

export const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading, signOut } = useAuth();
  const { role } = useUserRole();
  const navigate = useNavigate();

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
            {role === "Guest" && user && (
              <Link 
                to="/profile" 
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                My Bookings
              </Link>
            )}
            {role === "Host" && (
              <Link 
                to="/host" 
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Host Dashboard
              </Link>
            )}
          </div>

          {/* Auth Section - Desktop */}
          <div className="hidden md:flex md:items-center md:gap-3">
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                {user && role !== "Host" && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate("/auth?next=/host")}
                  >
                    Host your place
                  </Button>
                )}
                {user ? (
                  <UserMenu user={user} onSignOut={signOut} />
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate("/auth?next=/host")}
                    >
                      Host your place
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-foreground hover:text-primary hover:bg-secondary"
                      onClick={() => navigate("/auth")}
                    >
                      Login
                    </Button>
                    <Button 
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft"
                      onClick={() => navigate("/auth")}
                    >
                      Sign up
                    </Button>
                  </>
                )}
              </>
            )}
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
            {role === "Guest" && user && (
              <Link
                to="/profile"
                className="block px-3 py-2 text-base font-medium text-foreground hover:bg-secondary hover:text-primary rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Bookings
              </Link>
            )}
            {role === "Host" && (
              <Link
                to="/host"
                className="block px-3 py-2 text-base font-medium text-foreground hover:bg-secondary hover:text-primary rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Host Dashboard
              </Link>
            )}
            {/* Auth Section - Mobile */}
            <div className="px-3 pt-2">
              {loading ? (
                <div className="flex justify-center py-2">
                  <LoadingSpinner size="sm" />
                </div>
              ) : user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-md">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium truncate">{user.email}</span>
                  </div>
                  {role !== "Host" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate("/auth?next=/host");
                        setMobileMenuOpen(false);
                      }}
                    >
                      Host your place
                    </Button>
                  )}
                  {role === "Guest" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate("/profile");
                        setMobileMenuOpen(false);
                      }}
                    >
                      Profile
                    </Button>
                  )}
                  {role === "Host" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate("/host");
                        setMobileMenuOpen(false);
                      }}
                    >
                      Host Dashboard
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      navigate("/auth?next=/host");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Host your place
                  </Button>
                  <div className="flex gap-3">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-1 text-foreground hover:text-primary hover:bg-secondary"
                      onClick={() => {
                        navigate("/auth");
                        setMobileMenuOpen(false);
                      }}
                    >
                      Login
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => {
                        navigate("/auth");
                        setMobileMenuOpen(false);
                      }}
                    >
                      Sign up
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
