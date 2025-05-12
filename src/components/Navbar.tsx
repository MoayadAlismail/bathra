
import { useState, useEffect } from "react";
import { Menu, X, LogIn, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const accountType = profile?.accountType || user?.user_metadata?.accountType;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigation = (path: string) => {
    if (path.startsWith('/#')) {
      const elementId = path.substring(2);
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(path);
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Return to Coming Soon page and remove developer access
  const handleReturnToComingSoon = () => {
    localStorage.removeItem('developerAccess');
    window.location.reload(); // Reload to show Coming Soon page
  };

  // Get navigation items based on user type and authentication status
  const getNavItems = () => {
    const publicItems = [
      { label: "Home", path: "/" },
      { label: "How It Works", path: "/#how-it-works" },
    ];
    
    if (!user) return publicItems;
    
    // When logged in, don't show "How It Works" for a cleaner experience
    if (accountType === 'startup') {
      return [
        { label: "Home", path: "/" },
        { label: "My Startup", path: "/startup-profile" }
      ];
    } else {
      // For investors (individual or VC)
      return [
        { label: "Home", path: "/" },
        { label: "Startups", path: "/startups" }
      ];
    }
  };

  // Get navigation items
  const navItems = getNavItems();

  const renderAuthButtons = () => {
    if (!user) {
      return (
        <Button 
          size="sm" 
          onClick={() => navigate('/login')}
          className="flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </Button>
      );
    }

    // Render different buttons based on account type
    if (accountType === 'startup') {
      return (
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </div>
      );
    } else {
      // For investors (individual or VC)
      return (
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/startups')}
          >
            Vetted Startups
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </div>
      );
    }
  };

  const renderMobileAuthButtons = () => {
    if (!user) {
      return (
        <button
          onClick={() => {
            navigate('/login');
            setIsMobileMenuOpen(false);
          }}
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors duration-200 py-2 text-left"
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </button>
      );
    }

    // Only show the Sign Out button for startup accounts, as the My Startup link is already in navItems
    if (accountType === 'startup') {
      return (
        <button
          onClick={() => {
            handleLogout();
            setIsMobileMenuOpen(false);
          }}
          className="text-foreground hover:text-primary transition-colors duration-200 py-2 text-left"
        >
          Sign Out
        </button>
      );
    } else {
      return (
        <>
          <button
            onClick={() => {
              navigate('/startups');
              setIsMobileMenuOpen(false);
            }}
            className="text-foreground hover:text-primary transition-colors duration-200 py-2 text-left"
          >
            Vetted Startups
          </button>
          <button
            onClick={() => {
              handleLogout();
              setIsMobileMenuOpen(false);
            }}
            className="text-foreground hover:text-primary transition-colors duration-200 py-2 text-left"
          >
            Sign Out
          </button>
        </>
      );
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled ? "bg-background/80 backdrop-blur-lg shadow-lg py-2" : "bg-transparent py-4"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => handleNavigation('/')} 
              className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200"
            >
              <img src="/Logo.svg" alt="Bathra Logo" className="h-5 w-auto" />
            </button>

            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavigation(item.path)}
                  className="text-foreground hover:text-primary transition-colors duration-200"
                >
                  {item.label}
                </button>
              ))}
              
              {/* Coming Soon button */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReturnToComingSoon}
                className="flex items-center gap-2 text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Coming Soon Page
              </Button>
              
              {renderAuthButtons()}
            </div>

            <div className="md:hidden flex items-center">
              <button
                className="text-foreground hover:text-primary transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[60px] left-0 right-0 bg-background/80 backdrop-blur-lg shadow-lg z-40 md:hidden"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleNavigation(item.path)}
                    className="text-foreground hover:text-primary transition-colors duration-200 py-2 text-left"
                  >
                    {item.label}
                  </button>
                ))}
                
                {/* Coming Soon button for mobile */}
                <button
                  onClick={handleReturnToComingSoon}
                  className="flex items-center gap-2 text-foreground hover:text-primary transition-colors duration-200 py-2 text-left"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Coming Soon Page
                </button>
                
                {renderMobileAuthButtons()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
