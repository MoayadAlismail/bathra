import { useState, useEffect } from "react";
import { Menu, X, LogIn, ArrowLeft, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase, SubscribedEmail } from "@/lib/supabase";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showEmailsList, setShowEmailsList] = useState(false);
  const [subscribedEmails, setSubscribedEmails] = useState<string[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const { toast } = useToast();

  const accountType = profile?.accountType;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch emails from Supabase when the emails list is opened
  const fetchEmails = async () => {
    try {
      setIsLoadingEmails(true);

      // Fetch subscribed emails from Supabase
      const { data, error } = await supabase
        .from("subscribed_emails")
        .select("*");

      if (error) {
        console.error("Error fetching emails:", error);
        toast({
          title: "Error fetching emails",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Handle case when no emails exist yet
      if (!data || data.length === 0) {
        setSubscribedEmails([]);
        return;
      }

      // Process the data through our helper function to ensure proper typing
      const processedData = data.map((item: SubscribedEmail) => item.email);
      setSubscribedEmails(processedData);
    } catch (err: unknown) {
      console.error("Error:", err);
      toast({
        title: "Error",
        description: "Failed to fetch subscribed emails",
        variant: "destructive",
      });
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const handleNavigation = (path: string) => {
    if (path.startsWith("/#")) {
      const elementId = path.substring(2);
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(path);
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Return to Coming Soon page and remove developer access
  const handleReturnToComingSoon = () => {
    localStorage.removeItem("developerAccess");
    window.location.reload(); // Reload to show Coming Soon page
  };

  // Toggle emails list visibility and fetch emails if opened
  const toggleEmailsList = async () => {
    if (!showEmailsList) {
      await fetchEmails();
    }
    setShowEmailsList(!showEmailsList);
  };

  // Copy all emails to clipboard
  const copyEmailsToClipboard = () => {
    if (subscribedEmails.length === 0) {
      toast({
        title: "No emails to copy",
        description: "There are no subscribed emails yet.",
      });
      return;
    }

    const emailsText = subscribedEmails.join("\n");
    navigator.clipboard.writeText(emailsText);
    toast({
      title: "Emails Copied!",
      description: `${subscribedEmails.length} email(s) copied to clipboard.`,
    });
  };

  // Get navigation items based on user type and authentication status
  const getNavItems = () => {
    const publicItems = [
      { label: "Home", path: "/" },
      { label: "How It Works", path: "/#how-it-works" },
    ];

    if (!user) return publicItems;

    // When logged in, don't show "How It Works" for a cleaner experience
    if (accountType === "startup") {
      return [
        { label: "Home", path: "/" },
        { label: "My Startup", path: "/startup-profile" },
      ];
    } else {
      // For investors (individual or VC)
      return [
        { label: "Home", path: "/" },
        { label: "Startups", path: "/startups" },
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
          onClick={() => navigate("/login")}
          className="flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </Button>
      );
    }

    // Render different buttons based on account type
    if (accountType === "startup") {
      return (
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleLogout}>
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
            onClick={() => navigate("/startups")}
          >
            Vetted Startups
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
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
            navigate("/login");
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
    if (accountType === "startup") {
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
              navigate("/startups");
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
          isScrolled
            ? "bg-background/80 backdrop-blur-lg shadow-lg py-2"
            : "bg-transparent py-4"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleNavigation("/")}
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

              {/* Emails List Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleEmailsList}
                className="flex items-center gap-2 text-sm"
                disabled={isLoadingEmails}
              >
                <Mail className="h-4 w-4" />
                {isLoadingEmails
                  ? "Loading..."
                  : `Emails (${subscribedEmails.length})`}
              </Button>

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

      {/* Emails List Popup */}
      {showEmailsList && (
        <div className="fixed top-20 right-4 z-50 bg-background border rounded-md p-4 shadow-lg w-80">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">
              Subscribed Emails ({subscribedEmails.length})
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyEmailsToClipboard}
                className="text-xs"
              >
                Copy All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleEmailsList}
                className="text-xs"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {isLoadingEmails ? (
              <div className="text-sm py-4 text-center text-muted-foreground">
                Loading emails...
              </div>
            ) : subscribedEmails.length > 0 ? (
              <ul className="space-y-1">
                {subscribedEmails.map((email, index) => (
                  <li
                    key={index}
                    className="text-sm py-1 px-2 rounded hover:bg-accent"
                  >
                    {email}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No emails collected yet.
              </p>
            )}
          </div>
        </div>
      )}

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

                {/* Emails List Button for mobile */}
                <button
                  onClick={toggleEmailsList}
                  className="flex items-center gap-2 text-foreground hover:text-primary transition-colors duration-200 py-2 text-left"
                >
                  <Mail className="h-4 w-4" />
                  {isLoadingEmails
                    ? "Loading..."
                    : `Show Emails (${subscribedEmails.length})`}
                </button>

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
