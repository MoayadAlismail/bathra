
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertCircle, Check, Key, User, Building, Mail } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getAllSubscribedEmails, processStartupData, processInvestorData, supabase, Startup, Investor, SubscribedEmail } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';

const DeveloperAccess = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [emails, setEmails] = useState<SubscribedEmail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

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
      if (startupData) setStartups(processStartupData(startupData));
      
      // Fetch investors
      const { data: investorData, error: investorError } = await supabase
        .from('investors')
        .select('*');
      
      if (investorError) throw investorError;
      if (investorData) setInvestors(processInvestorData(investorData));
      
      // Fetch subscribed emails
      try {
        const emailData = await getAllSubscribedEmails();
        setEmails(emailData);
      } catch (err) {
        console.error('Error fetching emails:', err);
      }
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle the developer panel visibility
  const togglePanel = () => {
    setShowPanel(!showPanel);
    if (!showPanel && !isAuthenticated) {
      // Reset values when opening panel
      setPassword('');
      setError('');
    }
  };

  // If not showing panel, just show the toggle button
  if (!showPanel) {
    return (
      <Button 
        size="sm" 
        variant="outline" 
        onClick={togglePanel}
        className="fixed bottom-4 right-4 z-50 opacity-70 hover:opacity-100"
      >
        <Key size={16} className="mr-2" /> 
        Developer
      </Button>
    );
  }

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-4 right-4 z-50 w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-semibold">Developer Access</CardTitle>
                <CardDescription>
                  Enter the developer password to access the database and API information.
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={togglePanel}>
                &times;
              </Button>
            </div>
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
                  <AlertDescription>Access granted! Loading data...</AlertDescription>
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
    );
  }

  // Authenticated view
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-4 right-4 z-50 w-full max-w-md max-h-[80vh] overflow-auto"
    >
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Developer Dashboard</CardTitle>
              <CardDescription>Database and API Information</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={togglePanel}>
              &times;
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Subscribed Emails Section */}
              <div>
                <div className="flex items-center mb-2">
                  <Mail className="mr-2 h-4 w-4" />
                  <h3 className="text-lg font-medium">Subscribed Emails ({emails.length})</h3>
                </div>
                
                <div className="bg-muted/50 p-3 rounded-md max-h-48 overflow-y-auto">
                  {emails.length > 0 ? (
                    <div className="space-y-1">
                      {emails.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm py-1 border-b border-muted last:border-0">
                          <span>{item.email}</span>
                          <Badge variant="outline" className="text-xs">
                            {new Date(item.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">No subscribed emails yet.</p>
                  )}
                </div>
                
                <div className="mt-2 text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      const emailList = emails.map(item => item.email).join('\n');
                      navigator.clipboard.writeText(emailList);
                      alert('Emails copied to clipboard!');
                    }}
                    disabled={emails.length === 0}
                    className="text-xs"
                  >
                    Copy All Emails
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchData}
                    className="text-xs ml-2"
                  >
                    Refresh
                  </Button>
                </div>
              </div>
              
              {/* Startups Section */}
              <div>
                <div className="flex items-center mb-2">
                  <Building className="mr-2 h-4 w-4" />
                  <h3 className="text-lg font-medium">Startups ({startups.length})</h3>
                </div>
                <div className="text-sm text-muted-foreground">
                  {startups.map(startup => startup.name).join(', ')}
                </div>
              </div>
              
              {/* Investors Section */}
              <div>
                <div className="flex items-center mb-2">
                  <User className="mr-2 h-4 w-4" />
                  <h3 className="text-lg font-medium">Investors ({investors.length})</h3>
                </div>
                <div className="text-sm text-muted-foreground">
                  {investors.map(investor => investor.name).join(', ')}
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => {
              localStorage.removeItem('developerAccess');
              setIsAuthenticated(false);
              setShowPanel(false);
            }}
          >
            Revoke Access
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              localStorage.setItem('developerAccess', 'true');
              window.location.reload();
            }}
          >
            View Full App
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default DeveloperAccess;
