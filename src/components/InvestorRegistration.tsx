
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { MailIcon } from 'lucide-react';

const InvestorRegistration = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('investor_leads')
        .insert([{ email: email.trim(), created_at: new Date().toISOString() }]);
        
      if (error) throw error;
      
      toast.success('Thank you for your interest! We\'ll be in touch soon.');
      setEmail('');
    } catch (error: any) {
      console.error('Error submitting email:', error);
      toast.error(error.message || 'Failed to submit your email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Join Our Investor Network</h2>
          <p className="text-lg mb-8 text-muted-foreground">
            Get early access to promising startups and exclusive investment opportunities in the MENA region.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <div className="relative flex-1">
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 pl-10"
                required
              />
              <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="h-12 px-6"
            >
              {isLoading ? 'Submitting...' : 'Join Now'}
            </Button>
          </form>
          
          <p className="text-sm mt-4 text-muted-foreground">
            By submitting, you agree to receive updates about investment opportunities.
          </p>
        </div>
      </div>
    </section>
  );
};

export default InvestorRegistration;
