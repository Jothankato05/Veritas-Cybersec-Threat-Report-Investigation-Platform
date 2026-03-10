import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Layout } from './components/Layout';
import { SubmitReport } from './pages/SubmitReport';
import { MyReports } from './pages/MyReports';
import { AnalystDashboard } from './pages/AnalystDashboard';
import { IntelligenceDatabase } from './pages/IntelligenceDatabase';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { NotificationToast } from './components/NotificationToast';
import { PanicButton } from './components/PanicButton';

const ProtectedRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode; 
  allowedRoles?: string[] 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">Verifying Credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <NotificationToast />
        <PanicButton />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<MyReports />} />
            <Route path="my-reports" element={<MyReports />} />
            <Route path="submit-report" element={
              <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                <SubmitReport />
              </ProtectedRoute>
            } />
            <Route path="analyst" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'SECURITY', 'STAFF']}>
                <AnalystDashboard />
              </ProtectedRoute>
            } />
            <Route path="intelligence" element={<IntelligenceDatabase />} />
            <Route path="analytics" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'SECURITY', 'STAFF']}>
                <AnalyticsDashboard />
              </ProtectedRoute>
            } />
            <Route path="admin" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
