
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
      "Search params:",
      location.search,
      "State:",
      location.state
    );
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
      <div className="text-center max-w-md px-4">
        <h1 className="text-6xl font-bold mb-6 text-gradient">404</h1>
        <p className="text-xl text-foreground/80 mb-6">
          The page you're looking for doesn't exist or you may not have permission to view it.
        </p>
        <div className="flex flex-col gap-4">
          <Button asChild size="lg" className="w-full">
            <Link to="/">Go to Home</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
