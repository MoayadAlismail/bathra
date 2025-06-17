import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, ExternalLink } from "lucide-react";

type InvestorDetailProps = {
  investor: {
    id: string;
    name: string;
    preferred_industries: string;
    preferred_company_stage: string;
    average_ticket_size: string;
    company?: string;
    role?: string;
    city?: string;
    country?: string;
    number_of_investments?: number;
    website?: string;
    contact_email?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
};

const InvestorDetailModal: React.FC<InvestorDetailProps> = ({
  investor,
  isOpen,
  onClose,
  onConnect,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-bold">
                {investor.name}
              </DialogTitle>
              <p className="text-muted-foreground">
                {investor.role}{" "}
                {investor.company ? `at ${investor.company}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              {investor.website && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() =>
                    window.open(`https://${investor.website}`, "_blank")
                  }
                >
                  <ExternalLink className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Investment Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Industries
                </p>
                <p>{investor.preferred_industries || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Preferred Stage
                </p>
                <p>{investor.preferred_company_stage || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Ticket Size
                </p>
                <p>{investor.average_ticket_size || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Previous Investments
                </p>
                <p>{investor.number_of_investments || "0"}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Location</h3>
            <p>
              {investor.city && investor.country
                ? `${investor.city}, ${investor.country}`
                : "Not specified"}
            </p>
          </div>

          {investor.contact_email && (
            <div>
              <h3 className="text-lg font-medium mb-2">Contact Information</h3>
              <p>
                <a
                  href={`mailto:${investor.contact_email}`}
                  className="text-primary hover:underline"
                >
                  {investor.contact_email}
                </a>
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 border-t mt-4">
          <div className="flex gap-4 w-full justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={onConnect} className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Connect
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvestorDetailModal;
