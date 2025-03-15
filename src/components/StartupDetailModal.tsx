
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Bookmark, ExternalLink, MessageCircle, File } from "lucide-react";

type StartupDetailProps = {
  startup: {
    id: string;
    name: string;
    industry: string;
    stage: string;
    funding_required: string;
    valuation: string;
    document_path?: string;
    business_model?: string;
    key_metrics?: string;
    founders?: string;
    website?: string;
    contact_email?: string;
    investment_terms?: string;
    description?: string;
    video_url?: string;
    market_analysis?: string;
    competition?: string;
    financials?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  isSaved: boolean;
  onRequestInfo: () => void;
};

const StartupDetailModal: React.FC<StartupDetailProps> = ({
  startup,
  isOpen,
  onClose,
  onSave,
  isSaved,
  onRequestInfo,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-bold">{startup.name}</DialogTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full">
                  {startup.industry}
                </span>
                <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded-full">
                  {startup.stage}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onSave();
                }}
              >
                <Bookmark className={`h-5 w-5 ${isSaved ? "fill-primary text-primary" : ""}`} />
              </Button>
              {startup.website && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => window.open(`https://${startup.website}`, '_blank')}
                >
                  <ExternalLink className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-grow overflow-auto pt-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="business">Business</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="financials">Financials</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">About</h3>
                <p className="text-gray-700">{startup.description}</p>
              </div>
              
              {startup.video_url && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Pitch Video</h3>
                  <div className="aspect-video rounded-lg bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-500">Video player would appear here</p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Funding Sought</h3>
                  <p className="text-xl font-bold">{startup.funding_required}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Valuation</h3>
                  <p className="text-xl font-bold">{startup.valuation}</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="business" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Business Model</h3>
                <p className="text-gray-700">{startup.business_model || "Information not provided"}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Market Analysis</h3>
                <p className="text-gray-700">{startup.market_analysis || "Information not provided"}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Competitive Landscape</h3>
                <p className="text-gray-700">{startup.competition || "Information not provided"}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Key Metrics</h3>
                <p className="text-gray-700">{startup.key_metrics || "Information not provided"}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="team" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Founders</h3>
                <p className="text-gray-700">{startup.founders || "Information not provided"}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Contact Information</h3>
                <p className="text-gray-700">
                  {startup.contact_email && (
                    <a 
                      href={`mailto:${startup.contact_email}`} 
                      className="text-primary hover:underline"
                    >
                      {startup.contact_email}
                    </a>
                  )}
                  {!startup.contact_email && "Information not provided"}
                </p>
                <p className="text-gray-700 mt-1">
                  {startup.website && (
                    <a 
                      href={`https://${startup.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {startup.website}
                    </a>
                  )}
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="financials" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Financial Projections</h3>
                <p className="text-gray-700">{startup.financials || "Information not provided"}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Investment Terms</h3>
                <p className="text-gray-700">{startup.investment_terms || "Information not provided"}</p>
              </div>
              
              {startup.document_path && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Documents</h3>
                  <Button variant="outline" className="flex items-center gap-2">
                    <File className="h-4 w-4" />
                    Download Pitch Deck
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="pt-4 border-t mt-4">
          <div className="flex gap-4 w-full justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={onRequestInfo} className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Request More Info
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StartupDetailModal;
