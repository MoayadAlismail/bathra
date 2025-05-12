
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Lock, Eye, ArrowLeft } from 'lucide-react';

interface DeveloperAccessProps {
  onAccess: () => void;
  onBack?: () => void;
}

const DeveloperAccess: React.FC<DeveloperAccessProps> = ({ onAccess, onBack }) => {
  const [password, setPassword] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showEmailList, setShowEmailList] = useState(false);
  const [subscribedEmails, setSubscribedEmails] = useState<string[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const { toast } = useToast();
  
  // Simple developer password - in a real app you would use a more secure approach
  const DEVELOPER_PASSWORD = 'the3dudes';
  
  useEffect(() => {
    // Check if developer access is already granted
    const hasDevAccess = localStorage.getItem('developerAccess') === 'granted';
    setHasAccess(hasDevAccess);
    
    if (hasDevAccess) {
      onAccess();
      
      // Load emails from localStorage if dev access is granted
      const storedEmails = localStorage.getItem('subscribedEmails');
      if (storedEmails) {
        setSubscribedEmails(JSON.parse(storedEmails));
      }
    }
  }, [onAccess]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === DEVELOPER_PASSWORD) {
      localStorage.setItem('developerAccess', 'granted');
      setHasAccess(true);
      onAccess();
      
      // Load emails after access is granted
      const storedEmails = localStorage.getItem('subscribedEmails');
      if (storedEmails) {
        setSubscribedEmails(JSON.parse(storedEmails));
      }
      
      toast({
        title: "Developer Access Granted",
        description: "You now have access to the full website.",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect developer password.",
        variant: "destructive"
      });
    }
  };
  
  // Toggle email list visibility
  const toggleEmailList = () => {
    setShowEmailList(!showEmailList);
  };

  // Go back to Coming Soon page
  const handleGoBack = () => {
    // Clear developer access
    localStorage.removeItem('developerAccess');
    setHasAccess(false);
    
    // Call onBack function if provided
    if (onBack) {
      onBack();
    }
    
    toast({
      title: "Logged Out",
      description: "You've returned to the public site.",
    });
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
    
    const emailsText = subscribedEmails.join('\n');
    navigator.clipboard.writeText(emailsText);
    toast({
      title: "Emails Copied!",
      description: `${subscribedEmails.length} email(s) copied to clipboard.`,
    });
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
      {/* Email List (Only visible when showEmailList is true) */}
      {showEmailList && (
        <div className="bg-background border rounded-md p-3 shadow-lg mb-2 w-64">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-sm">Collected Emails ({subscribedEmails.length})</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyEmailsToClipboard}
            >
              Copy All
            </Button>
          </div>
          <div className="max-h-40 overflow-y-auto">
            {subscribedEmails.length > 0 ? (
              <ul className="space-y-1">
                {subscribedEmails.map((email, index) => (
                  <li key={index} className="text-sm py-1 px-2 rounded hover:bg-accent">
                    {email}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No emails collected yet.</p>
            )}
          </div>
        </div>
      )}
      
      {/* Developer Access Controls */}
      <div className="flex gap-2">
        {hasAccess && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="bg-red-100 hover:bg-red-200 border-red-300 text-red-700 hover:text-red-800 hover:opacity-100"
              onClick={handleGoBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Site
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="opacity-70 hover:opacity-100 transition-opacity"
              onClick={toggleEmailList}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showEmailList ? 'Hide Emails' : 'Show Emails'}
            </Button>
          </>
        )}
        
        {!hasAccess && !showForm ? (
          <Button
            variant="outline"
            size="sm"
            className="opacity-30 hover:opacity-100 transition-opacity"
            onClick={() => setShowForm(true)}
          >
            <Lock className="h-4 w-4 mr-2" />
            Developer
          </Button>
        ) : !hasAccess && (
          <form onSubmit={handleSubmit} className="bg-background border rounded-md p-3 shadow-lg flex gap-2">
            <Input
              type="password"
              placeholder="Developer password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-40"
              autoFocus
            />
            <Button type="submit" size="sm">Access</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default DeveloperAccess;
