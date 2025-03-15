
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
import NotFound from "./pages/NotFound";
import { Suspense } from "react";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // You could return a loading spinner here
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
        <Route path="/pitch" element={<StartupPitch />} />
        <Route path="/invest" element={<InvestorJoin />} />
        <Route path="/login" element={<InvestorLogin />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <InvestorDashboard />
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
