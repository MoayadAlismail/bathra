import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Home,
  Users,
  Building,
  LogOut,
  BarChart3,
  Shield,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import NotificationDropdown from "@/components/NotificationDropdown";
import { canBrowseContent } from "@/lib/auth-utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const { profile } = useAuth();
  const [isIOS, setIsIOS] = useState(false);

  const accountType = profile?.accountType;

  useEffect(() => {
    // Detect iOS Safari
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigation = (path: string) => {
    navigate(path);
    // Scroll to top when navigating to new page
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
  };

  const handleSignOutClick = () => {
    setShowSignOutDialog(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    window.scrollTo(0, 0);
  };

  // Admin navigation items
  const adminNavItems = [
    { label: "Dashboard", path: "/admin", icon: BarChart3 },
    { label: "Startups", path: "/admin?tab=startups", icon: Building },
    { label: "Investors", path: "/admin?tab=investors", icon: Users },
    { label: "Sign-Out", action: handleSignOutClick, icon: LogOut },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? isIOS
              ? "bg-background/95 border-b border-border"
              : "bg-background/80 backdrop-blur-md border-b border-border"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div
              className="flex items-center space-x-1 sm:space-x-2 cursor-pointer group min-w-0 flex-shrink-0"
              onClick={() => handleNavigation("/admin")}
            >
              <img
                src="/Logo.svg"
                alt="Bathra Admin"
                className="h-6 sm:h-8 w-auto group-hover:scale-105 transition-transform"
              />
              <span className="px-1.5 sm:px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full font-medium whitespace-nowrap">
                Admin
              </span>
            </div>

            {/* Desktop Navigation - Hide on smaller screens, show on large screens */}
            <div className="hidden lg:flex items-center space-x-1 overflow-hidden">
              {adminNavItems.map((item) => (
                <Button
                  key={item.path || "signout"}
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    item.action ? item.action() : handleNavigation(item.path!)
                  }
                  className="flex items-center space-x-1 xl:space-x-2 text-foreground hover:text-white text-xs xl:text-sm"
                >
                  <item.icon className="w-3 h-3 xl:w-4 xl:h-4 flex-shrink-0" />
                  <span className="hidden xl:inline">{item.label}</span>
                  <span className="xl:hidden">{item.label.split(" ")[0]}</span>
                </Button>
              ))}
            </div>

            {/* Tablet Navigation - Show limited items */}
            <div className="hidden md:flex lg:hidden items-center space-x-1">
              {adminNavItems.slice(0, 3).map((item) => (
                <Button
                  key={item.path || "signout"}
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    item.action ? item.action() : handleNavigation(item.path!)
                  }
                  className="flex items-center space-x-1 text-foreground hover:text-white text-xs"
                >
                  <item.icon className="w-3 h-3 flex-shrink-0" />
                </Button>
              ))}
            </div>

            {/* Admin Actions */}
            <div className="hidden lg:flex items-center space-x-2 xl:space-x-4 flex-shrink-0">
              {profile &&
                (profile.accountType === "admin" ||
                  canBrowseContent(profile)) && <NotificationDropdown />}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigation("/")}
                className="flex items-center gap-1 xl:gap-2 text-xs xl:text-sm"
              >
                <Home className="w-3 h-3 xl:w-4 xl:h-4" />
                <span className="hidden xl:inline">Main Site</span>
                <span className="xl:hidden">Main</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 xl:gap-2 text-xs xl:text-sm"
              >
                <Shield className="w-3 h-3 xl:w-4 xl:h-4" />
                <span className="hidden xl:inline">Admin</span>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-foreground hover:text-white p-1 sm:p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-14 sm:top-16 left-0 right-0 z-40 border-b border-border lg:hidden ${
              isIOS ? "bg-background/95" : "bg-background/95 backdrop-blur-md"
            }`}
          >
            <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
              <div className="flex flex-col space-y-3 sm:space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
                {/* Mobile Navigation Items */}
                {adminNavItems.map((item) => (
                  <Button
                    key={item.path || "signout"}
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      item.action ? item.action() : handleNavigation(item.path!)
                    }
                    className="flex items-center justify-start space-x-2 sm:space-x-3 text-foreground hover:text-white w-full text-left py-2 sm:py-3"
                  >
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-sm sm:text-base">{item.label}</span>
                  </Button>
                ))}

                {/* Mobile Actions */}
                <div className="pt-3 sm:pt-4 border-t border-border space-y-2">
                  {profile &&
                    (profile.accountType === "admin" ||
                      canBrowseContent(profile)) && (
                      <div className="py-2">
                        <NotificationDropdown />
                      </div>
                    )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNavigation("/")}
                    className="flex items-center justify-start space-x-2 sm:space-x-3 w-full text-left py-2 sm:py-3"
                  >
                    <Home className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Main Site</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center justify-start space-x-2 sm:space-x-3 w-full text-left py-2 sm:py-3"
                  >
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Admin Panel</span>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sign Out Confirmation Dialog */}
      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign Out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out of the admin panel?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut}>
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminNavbar;
