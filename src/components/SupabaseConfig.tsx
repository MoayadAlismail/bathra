
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';

const SupabaseConfig = () => {
  // In our demo environment, we'll just show a notification that we're using a mock client
  const [showDemoAlert, setShowDemoAlert] = useState(true);
  
  return (
    <div className="w-full max-w-3xl mx-auto my-8 px-4">
      {showDemoAlert && (
        <Alert className="mb-6 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
          <AlertTitle className="text-amber-700 dark:text-amber-400">Demo Mode Active</AlertTitle>
          <AlertDescription className="text-amber-600 dark:text-amber-300">
            This application is running with a mock Supabase client. All functionality is simulated for demonstration purposes.
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                onClick={() => setShowDemoAlert(false)}
              >
                Dismiss
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SupabaseConfig;
