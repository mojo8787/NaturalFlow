import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/hooks/use-language";
import NotFound from "@/pages/not-found";
import AuthPage from './pages/auth-page';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/dashboard';
import Profile from './pages/profile';
import Checkout from "@/pages/checkout";
import SubscriptionSuccess from "@/pages/subscription-success";
import EcoImpact from "@/pages/eco-impact";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              <Route path="/subscription-success" element={
                <ProtectedRoute>
                  <SubscriptionSuccess />
                </ProtectedRoute>
              } />
              <Route path="/eco-impact" element={
                <ProtectedRoute>
                  <EcoImpact />
                </ProtectedRoute>
              } />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
