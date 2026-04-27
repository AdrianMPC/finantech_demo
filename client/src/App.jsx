import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Learn } from './pages/Learn';
import { Lesson } from './pages/Lesson';
import { Profile } from './pages/Profile';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-duo-green border-t-transparent animate-spin" />
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/learn" replace /> : children;
}

function AdminRoute({ children }) {
  const { isAdmin } = useAdmin();
  return isAdmin ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <AdminProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public user routes */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            {/* Protected user routes */}
            <Route path="/learn" element={<PrivateRoute><Learn /></PrivateRoute>} />
            <Route path="/lesson/:id" element={<PrivateRoute><Lesson /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

            <Route path="*" element={<Navigate to="/learn" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </AdminProvider>
  );
}
