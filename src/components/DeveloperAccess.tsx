import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertCircle, Check, Key } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase, Startup, Investor, SubscribedEmail } from '@/lib/supabase';

const DeveloperAccess = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [emails, setEmails] = useState<SubscribedEmail[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if developer access is already granted
    const hasAccess = localStorage.getItem('developerAccess') === 'true';
    if (hasAccess) {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  const handleAuthenticate = () => {
    setError('');
    
    // This is a simple demo password - in a real app, this would be a secure authentication system
    if (password === 'bathra2023') {
      setIsAuthenticated(true);
      setShowSuccess(true);
      localStorage.setItem('developerAccess', 'true');
      
      // Hide success message after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        fetchData();
      }, 2000);
    } else {
      setError('Invalid password. Please try again.');
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch startups
      const { data: startupData, error: startupError } = await supabase
        .from('startups')
        .select('*');
      
      if (startupError) throw startupError;
      if (startupData) setStartups(startupData as Startup[]);
      
      // Fetch investors
      const { data: investorData, error: investorError } = await supabase
        .from('investors')
        .select('*');
      
      if (investorError) throw investorError;
      if (investorData) setInvestors(investorData as Investor[]);
      
      // Fetch subscribed emails
      const { data: emailData, error: emailError } = await supabase
        .from('subscribed_emails')
        .select('*');
      
      if (emailError) throw emailError;
      if (emailData) setEmails(emailData as SubscribedEmail[]);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Developer Access</CardTitle>
              <CardDescription>
                Enter the developer password to access the database and API information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter developer password"
                  />
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {showSuccess && (
                  <Alert className="bg-green-50 text-green-800 border-green-200">
                    <Check className="h-4 w-4" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>Access granted! Redirecting...</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleAuthenticate}>
                <Key className="mr-2 h-4 w-4" />
                Authenticate
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6">Developer Dashboard</h1>
        
        {isLoading ? (
          <p className="text-center py-8">Loading data...</p>
        ) : (
          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Database Overview</CardTitle>
                <CardDescription>Current data in the Supabase tables</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div>
                    <h3 className="text-lg font-medium">Startups: {startups.length}</h3>
                    <p className="text-sm text-muted-foreground">
                      {startups.map(startup => startup.name).join(', ')}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Investors: {investors.length}</h3>
                    <p className="text-sm text-muted-foreground">
                      {investors.map(investor => investor.name).join(', ')}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Subscribed Emails: {emails.length}</h3>
                    <p className="text-sm text-muted-foreground">
                      {emails.map(item => item.email).join(', ')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Button 
              variant="outline" 
              onClick={() => {
                localStorage.removeItem('developerAccess');
                setIsAuthenticated(false);
              }}
            >
              Revoke Developer Access
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DeveloperAccess;
