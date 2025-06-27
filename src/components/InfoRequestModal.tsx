import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { StartupBasicInfo } from "@/lib/startup-types";
import { InvestorStartupConnectionService } from "@/lib/investor-startup-connection-service";
import { useAuth } from "@/context/AuthContext";
import { createPortal } from "react-dom";

interface InfoRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  startup: StartupBasicInfo;
}

const InfoRequestModal = ({
  isOpen,
  onClose,
  startup,
}: InfoRequestModalProps) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, profile } = useAuth();

  // Handle escape key globally
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !profile) {
      toast({
        title: "Error",
        description: "You must be logged in to request information",
        variant: "destructive",
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter your question or message",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } =
        await InvestorStartupConnectionService.createConnection({
          investor_id: user.id,
          startup_id: startup.id,
          connection_type: "info_request",
          investor_name: profile.name || "Unknown Investor",
          investor_email: profile.email || user.email || "",
          investor_calendly_link: profile.calendly_link,
          startup_name: startup.startup_name || startup.name,
          startup_email: startup.email,
          message: message.trim(),
        });

      if (error) {
        if (error === "Connection already exists") {
          toast({
            title: "Request Already Sent",
            description:
              "You have already requested information about this startup",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error,
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Request Sent",
        description:
          "Your information request has been sent to the Bathra team",
      });

      setMessage("");
      onClose();
    } catch (error) {
      console.error("Error sending info request:", error);
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="info-request-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-card rounded-xl shadow-2xl w-full max-w-lg mx-auto border border-border relative pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 id="info-request-title" className="text-lg font-semibold">
                    Request More Information
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    About {startup.startup_name || startup.name}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">
                  What would you like to know about this startup?
                </Label>
                <Textarea
                  id="message"
                  placeholder="Enter your questions or specific information you'd like to know about this startup..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="resize-none"
                  disabled={isSubmitting}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Your request will be sent to the Bathra admin team for review
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting || !message.trim()}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Send Request
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // Render using portal to escape any parent stacking contexts
  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
};

export default InfoRequestModal;
