
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Index from "./pages/Index";
import StartupPitch from "./pages/StartupPitch";
import InvestorJoin from "./pages/InvestorJoin";
import InvestorLogin from "./pages/InvestorLogin";
import InvestorDashboard from "./pages/InvestorDashboard";
import VettedStartups from "./pages/VettedStartups";
import NotFound from "./pages/NotFound";
import { Suspense, Component, ReactNode } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Error Fallback component
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

// Error Boundary component using class component
class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean; error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <ErrorFallback error={this.state.error || new Error("Unknown error occurred")} />;
    }

    return this.props.children;
  }
}

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
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
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <InvestorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/startups" element={
          <ProtectedRoute>
            <VettedStartups />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
          <AppRoutes />
        </Suspense>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
