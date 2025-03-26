
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader, CheckCircle, AlertTriangle, Clock } from "lucide-react";

interface StartupDetails {
  id: string;
  name: string;
  industry: string;
  stage: string;
  description: string;
  founders: string;
  website: string;
  status: string;
  createdAt: string;
}

const StartupProfile = () => {
  const [startup, setStartup] = useState<StartupDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<StartupDetails>>({});
  const [saving, setSaving] = useState(false);
  
  const { user, profile } = useAuth();
  
  useEffect(() => {
    const fetchStartupDetails = async () => {
      try {
        setLoading(true);
        
        // In a real app, we would fetch the startup details from the database
        // using the startupId from the user's profile
        const startupId = profile?.startupId || 'demo-startup-1';
        
        // Fetch startup details
        const { data, error } = await supabase
          .from('startups')
          .select('*')
          .eq('id', startupId)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (data) {
          const startupDetails: StartupDetails = {
            id: data.id,
            name: data.name,
            industry: data.industry || '',
            stage: data.stage || '',
            description: data.description || '',
            founders: data.founders || '',
            website: data.website || '',
            status: data.status || 'pending',
            createdAt: data.created_at
          };
          
          setStartup(startupDetails);
          setFormData(startupDetails);
        } else {
          // Use demo data as fallback
          const demoStartup: StartupDetails = {
            id: 'demo-startup-1',
            name: 'EcoSolutions',
            industry: 'CleanTech',
            stage: 'Seed',
            description: 'Developing sustainable energy solutions for residential buildings.',
            founders: 'Jane Smith, John Doe',
            website: 'https://ecosolutions-demo.com',
            status: 'vetted',
            createdAt: new Date().toISOString()
          };
          
          setStartup(demoStartup);
          setFormData(demoStartup);
        }
      } catch (error) {
        console.error('Error fetching startup details:', error);
        toast.error('Failed to load startup profile. Using demo data.');
        
        // Use demo data as fallback
        const demoStartup: StartupDetails = {
          id: 'demo-startup-1',
          name: 'EcoSolutions',
          industry: 'CleanTech',
          stage: 'Seed',
          description: 'Developing sustainable energy solutions for residential buildings.',
          founders: 'Jane Smith, John Doe',
          website: 'https://ecosolutions-demo.com',
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        
        setStartup(demoStartup);
        setFormData(demoStartup);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStartupDetails();
  }, [profile?.startupId]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = async () => {
    try {
      setSaving(true);
      
      // In a real app, we would update the startup details in the database
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Update the startup details in local state
      setStartup(prev => ({ ...prev!, ...formData }));
      setEditing(false);
      
      toast.success('Startup profile updated successfully');
    } catch (error) {
      console.error('Error updating startup profile:', error);
      toast.error('Failed to update startup profile');
    } finally {
      setSaving(false);
    }
  };
  
  const getStatusIcon = () => {
    switch (startup?.status) {
      case 'vetted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="h-5 w-5 text-amber-500" />;
    }
  };
  
  const getStatusText = () => {
    switch (startup?.status) {
      case 'vetted':
        return 'Your startup has been vetted and is visible to investors';
      case 'rejected':
        return 'Your startup profile needs revision before it can be visible to investors';
      case 'pending':
      default:
        return 'Your startup is pending review and not yet visible to investors';
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading startup profile...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">Startup Profile</h1>
                <p className="text-muted-foreground">
                  Manage your startup information and track your vetting status
                </p>
              </div>
              {!editing && (
                <Button 
                  onClick={() => setEditing(true)}
                  className="mt-4 md:mt-0"
                >
                  Edit Profile
                </Button>
              )}
            </div>
            
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center">
                  {getStatusIcon()}
                  <CardTitle className="ml-2">Vetting Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-card border">
                  <p className="mb-2 font-medium">Status: <span className="font-normal">{startup?.status}</span></p>
                  <p className="text-muted-foreground">{getStatusText()}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Startup Information</CardTitle>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="name">Startup Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="industry">Industry</Label>
                        <Input
                          id="industry"
                          name="industry"
                          value={formData.industry || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="stage">Stage</Label>
                        <Input
                          id="stage"
                          name="stage"
                          value={formData.stage || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description || ''}
                        onChange={handleInputChange}
                        rows={4}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="founders">Founders</Label>
                      <Input
                        id="founders"
                        name="founders"
                        value={formData.founders || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="website">Website URL</Label>
                      <Input
                        id="website"
                        name="website"
                        value={formData.website || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-4 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setFormData(startup || {});
                          setEditing(false);
                        }}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Startup Name</p>
                      <p className="text-foreground">{startup?.name}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Industry</p>
                        <p className="text-foreground">{startup?.industry || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Stage</p>
                        <p className="text-foreground">{startup?.stage || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                      <p className="text-foreground">{startup?.description || 'No description provided'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Founders</p>
                      <p className="text-foreground">{startup?.founders || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Website URL</p>
                      {startup?.website ? (
                        <a 
                          href={startup.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {startup.website}
                        </a>
                      ) : (
                        <p className="text-foreground">Not specified</p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Created On</p>
                      <p className="text-foreground">
                        {startup?.createdAt ? new Date(startup.createdAt).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default StartupProfile;
