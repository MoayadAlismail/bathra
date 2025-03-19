
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const SupabaseConfig = () => {
  const [url, setUrl] = useState<string>("");
  const [key, setKey] = useState<string>("");
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const { updateSupabaseConfig } = useAuth();

  // Check if valid credentials are stored in localStorage
  useEffect(() => {
    const storedUrl = localStorage.getItem("supabase_url");
    const storedKey = localStorage.getItem("supabase_anon_key");
    
    if (storedUrl && storedKey) {
      setUrl(storedUrl);
      setKey(storedKey);
      setIsConfigured(true);
      console.log("Found stored Supabase credentials");
    } else {
      console.log("No stored Supabase credentials found");
    }
  }, []);

  const handleSaveConfig = async () => {
    if (!url || !key) {
      toast.error("Please enter both the URL and anonymous key");
      return;
    }

    setIsTesting(true);
    
    try {
      console.log("Testing Supabase connection...");
      
      // Test the connection with these credentials
      const testClient = createClient(url, key, {
        auth: {
          autoRefreshToken: true,
          persistSession: true
        }
      });
      
      // Verify the credentials work by making a simple query
      const { error } = await testClient.from('investors').select('count', { count: 'exact' }).limit(1);
      
      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "No rows found" which is fine for our test
        console.error("Supabase connection test failed:", error);
        throw new Error(`Supabase connection failed: ${error.message}`);
      }

      // Store credentials in localStorage
      localStorage.setItem("supabase_url", url);
      localStorage.setItem("supabase_anon_key", key);
      
      console.log("Supabase credentials validated and saved");
      
      // Update the auth context
      updateSupabaseConfig(url, key);
      
      setIsConfigured(true);
      toast.success("Supabase configuration saved successfully!");
    } catch (error: any) {
      console.error("Failed to verify Supabase credentials:", error);
      toast.error(error.message || "Failed to connect to Supabase");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-6 bg-card border rounded-lg shadow-sm">
      <h3 className="text-xl font-bold mb-4">Configure Supabase</h3>
      
      {isConfigured ? (
        <div className="space-y-4">
          <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 rounded-md text-sm">
            Supabase is configured with your credentials.
          </div>
          <Button
            variant="outline"
            onClick={() => setIsConfigured(false)}
            className="w-full"
          >
            Update Configuration
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 rounded-md text-sm">
            Please enter your Supabase project URL and anonymous key below. 
            You can find these in your Supabase project dashboard under Settings → API.
          </div>
          
          <div className="space-y-3">
            <div>
              <label htmlFor="supabase-url" className="block text-sm font-medium mb-1">
                Supabase URL
              </label>
              <Input
                id="supabase-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project-id.supabase.co"
                className="w-full"
              />
            </div>
            
            <div>
              <label htmlFor="supabase-key" className="block text-sm font-medium mb-1">
                Supabase Anonymous Key
              </label>
              <Input
                id="supabase-key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="your-anon-key"
                className="w-full"
                type="password"
              />
            </div>
          </div>
          
          <Button 
            onClick={handleSaveConfig} 
            className="w-full"
            disabled={isTesting}
          >
            {isTesting ? (
              <span className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing Connection...
              </span>
            ) : 'Save Configuration'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SupabaseConfig;
