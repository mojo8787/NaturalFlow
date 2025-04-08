import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import your components
import Login from './pages/auth/Login';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Installations from './pages/Installations';
import Support from './pages/Support';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Admin Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          } />
          <Route path="/installations" element={
            <ProtectedRoute>
              <Installations />
            </ProtectedRoute>
          } />
          <Route path="/support" element={
            <ProtectedRoute>
              <Support />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
