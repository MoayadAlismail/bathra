import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Home,
  Users,
  Building,
  Mail,
  Settings,
  BarChart3,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  // Admin navigation items
  const adminNavItems = [
    { label: "Dashboard", path: "/admin", icon: BarChart3 },
    { label: "User Management", path: "/admin/users", icon: Users },
    { label: "Startups", path: "/admin/startups", icon: Building },
    { label: "Investors", path: "/admin/investors", icon: Users },
    { label: "Emails", path: "/admin/emails", icon: Mail },
    { label: "Settings", path: "/admin/settings", icon: Settings },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-md border-b border-border"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div
              className="flex items-center space-x-2 cursor-pointer group"
              onClick={() => handleNavigation("/admin")}
            >
              <img
                src="/Logo.svg"
                alt="Bathra Admin"
                className="h-8 w-auto group-hover:scale-105 transition-transform"
              />
              <div className="flex items-center space-x-1">
                <span className="text-xl font-bold text-foreground">
                  Bathra
                </span>
                <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full font-medium">
                  Admin
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {adminNavItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation(item.path)}
                  className="flex items-center space-x-2 text-foreground hover:text-primary"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>

            {/* Admin Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigation("/")}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Main Site
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Admin
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
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
            className="fixed top-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border md:hidden"
          >
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col space-y-4">
                {/* Mobile Navigation Items */}
                {adminNavItems.map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigation(item.path)}
                    className="flex items-center justify-start space-x-3 text-foreground hover:text-primary w-full"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                ))}

                {/* Mobile Actions */}
                <div className="pt-4 border-t border-border space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNavigation("/")}
                    className="flex items-center justify-start space-x-3 w-full"
                  >
                    <Home className="w-4 h-4" />
                    <span>Main Site</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center justify-start space-x-3 w-full"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminNavbar;
