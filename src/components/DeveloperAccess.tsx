
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Lock } from 'lucide-react';

interface DeveloperAccessProps {
  onAccess: () => void;
}

const DeveloperAccess: React.FC<DeveloperAccessProps> = ({ onAccess }) => {
  const [password, setPassword] = useState('');
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  
  // Simple developer password - in a real app you would use a more secure approach
  const DEVELOPER_PASSWORD = 'the3dudes';
  
  useEffect(() => {
    // Check if developer access is already granted
    const hasAccess = localStorage.getItem('developerAccess') === 'granted';
    if (hasAccess) {
      onAccess();
    }
  }, [onAccess]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === DEVELOPER_PASSWORD) {
      localStorage.setItem('developerAccess', 'granted');
      onAccess();
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
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!showForm ? (
        <Button
          variant="outline"
          size="sm"
          className="opacity-30 hover:opacity-100 transition-opacity"
          onClick={() => setShowForm(true)}
        >
          <Lock className="h-4 w-4 mr-2" />
          Developer
        </Button>
      ) : (
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
  );
};

export default DeveloperAccess;
