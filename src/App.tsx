
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { useState, useEffect, Suspense, Component, ReactNode } from "react";
import ComingSoon from "./pages/ComingSoon";
import DeveloperAccess from "./components/DeveloperAccess";
import Index from "./pages/Index";
import StartupPitch from "./pages/StartupPitch";
import InvestorJoin from "./pages/InvestorJoin";
import InvestorLogin from "./pages/InvestorLogin";
import VettedStartups from "./pages/VettedStartups";
import StartupProfile from "./pages/StartupProfile";
import AccountSelection from "./pages/AccountSelection";
import NotFound from "./pages/NotFound";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ErrorFallback = ({ error }: { error: Error }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <p className="text-gray-700 mb-4">The application encountered an unexpected error:</p>
        <div className="bg-gray-100 p-4 rounded-lg overflow-auto mb-4">
          <pre className="text-sm text-red-800 whitespace-pre-wrap">{error.message}</pre>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Refresh the page
        </button>
      </div>
    </div>
  );
};

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean; error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error || new Error("Unknown error occurred")} />;
    }

    return this.props.children;
  }
}

const ProtectedRoute = ({ children, requiredAccountType }: { children: React.ReactNode, requiredAccountType?: string | string[] }) => {
  const { user, profile, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        console.log('User not authenticated, redirecting to login');
      } else if (requiredAccountType) {
        const accountType = profile?.accountType || user?.user_metadata?.accountType;
        const requiredTypes = Array.isArray(requiredAccountType) ? requiredAccountType : [requiredAccountType];
        
        if (!accountType || !requiredTypes.includes(accountType)) {
          console.log(`User does not have required account type: ${requiredAccountType}`);
        }
      }
    }
  }, [user, profile, isLoading, requiredAccountType]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredAccountType) {
    const accountType = profile?.accountType || user?.user_metadata?.accountType;
    const requiredTypes = Array.isArray(requiredAccountType) ? requiredAccountType : [requiredAccountType];
    
    if (!accountType || !requiredTypes.includes(accountType)) {
      return <Navigate to="/account-type" replace />;
    }
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const [developerAccess, setDeveloperAccess] = useState(false);
  
  useEffect(() => {
    // Check if developer access is already granted on page load
    const hasAccess = localStorage.getItem('developerAccess') === 'granted';
    if (hasAccess) {
      setDeveloperAccess(true);
    }
  }, []);

  // If not in developer mode, show coming soon page
  if (!developerAccess) {
    return (
      <>
        <ComingSoon />
        <DeveloperAccess onAccess={() => setDeveloperAccess(true)} />
      </>
    );
  }
  
  // Regular routes for developers
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/pitch" element={
          <ErrorBoundary>
            <StartupPitch />
          </ErrorBoundary>
        } />
        <Route path="/invest" element={<InvestorJoin />} />
        <Route path="/login" element={<InvestorLogin />} />
        <Route path="/account-type" element={<AccountSelection />} />
        <Route path="/startups" element={
          <ProtectedRoute requiredAccountType={["individual", "vc"]}>
            <ErrorBoundary>
              <VettedStartups />
            </ErrorBoundary>
          </ProtectedRoute>
        } />
        <Route path="/startup-profile" element={
          <ProtectedRoute requiredAccountType="startup">
            <ErrorBoundary>
              <StartupProfile />
            </ErrorBoundary>
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading application...</p>
              </div>
            </div>
          }>
            <AppRoutes />
          </Suspense>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
