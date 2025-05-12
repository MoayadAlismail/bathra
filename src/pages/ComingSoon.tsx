
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const ComingSoon = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
    
    try {
      // First, check if the email already exists
      const { data: existingEmail, error: checkError } = await supabase
        .from('subscribed_emails')
        .select('email')
        .eq('email', email);
      
      if (checkError) {
        throw checkError;
      }
      
      // If email already exists, don't add it again
      if (existingEmail && existingEmail.length > 0) {
        toast({
          title: "Already Subscribed",
          description: "This email is already subscribed to our updates.",
        });
        setEmail('');
        return;
      }
      
      // Insert the email into the subscribed_emails table
      const { error } = await supabase
        .from('subscribed_emails')
        .insert([{ email }]);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success!",
        description: "Thank you for subscribing. We'll notify you when we launch!",
      });
      setEmail('');
    } catch (error: any) {
      console.error('Error subscribing email:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to subscribe. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
        </motion.div>
      </div>
      
      <footer className="absolute bottom-4 text-center w-full text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Bathra. All rights reserved.
      </footer>
    </div>
  );
};

export default ComingSoon;
