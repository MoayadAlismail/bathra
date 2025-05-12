
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Eye } from 'lucide-react';

const ComingSoon = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmailList, setShowEmailList] = useState(false);
  const [subscribedEmails, setSubscribedEmails] = useState<string[]>([]);
  const { toast } = useToast();

  // Load emails from localStorage on component mount
  useEffect(() => {
    const storedEmails = localStorage.getItem('subscribedEmails');
    if (storedEmails) {
      setSubscribedEmails(JSON.parse(storedEmails));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    // Add email to the list and store in localStorage
    setTimeout(() => {
      const updatedEmails = [...subscribedEmails, email];
      setSubscribedEmails(updatedEmails);
      localStorage.setItem('subscribedEmails', JSON.stringify(updatedEmails));
      
      toast({
        title: "Success!",
        description: "Thank you for subscribing. We'll notify you when we launch!",
      });
      setEmail('');
      setLoading(false);
    }, 1000);
    
    // In a real implementation, you would send this to your backend/email service
  };

  // Toggle email list visibility
  const toggleEmailList = () => {
    setShowEmailList(!showEmailList);
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      {/* Content */}
      <div className="z-10 px-4 sm:px-0">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md mx-auto text-center"
        >
          <img 
            src="/Logo.svg" 
            alt="Bathra Logo" 
            className="h-12 mx-auto mb-10" 
          />
          
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl sm:text-6xl font-bold mb-6 tracking-tight"
          >
            Coming Soon
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg text-muted-foreground mb-10"
          >
            We're working on something exciting. Our platform connecting startups with investors will be launching soon.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="glass p-6 rounded-2xl"
          >
            <h2 className="text-xl font-semibold mb-4">Get Notified When We Launch</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit" disabled={loading} className="whitespace-nowrap">
                  {loading ? "Subscribing..." : "Notify Me"}
                </Button>
              </div>
            </form>
          </motion.div>
          
          {/* Email List (Hidden by default, visible to developers) */}
          {showEmailList && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mt-6 bg-background/80 backdrop-blur border border-border rounded-lg p-4 text-left"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Collected Emails ({subscribedEmails.length})</h3>
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
            </motion.div>
          )}
        </motion.div>
      </div>
      
      {/* Show/Hide Email List Button (For Developers) */}
      <div className="fixed top-4 right-20 z-50">
        <Button
          variant="outline"
          size="sm"
          className="opacity-30 hover:opacity-100 transition-opacity"
          onClick={toggleEmailList}
        >
          <Eye className="h-4 w-4 mr-1" />
          {showEmailList ? 'Hide Emails' : 'Show Emails'}
        </Button>
      </div>
      
      <footer className="absolute bottom-4 text-center w-full text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Bathra. All rights reserved.
      </footer>
    </div>
  );
};

export default ComingSoon;
