import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import CitizenPortal from './pages/CitizenPortal';
import OfficialDashboard from './pages/OfficialDashboard';
import OfficeDashboard from './pages/OfficeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SystemAdmin from './pages/SystemAdmin';
import ProfileSettings from './pages/ProfileSettings';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Chatbot from './components/Chatbot';

// Component bảo vệ Route: yêu cầu đăng nhập & đúng vai trò
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect về trang chủ của vai trò hiện tại
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'official') return <Navigate to="/official" replace />;
    if (user.role === 'office') return <Navigate to="/office" replace />;
    if (user.role === 'superadmin') return <Navigate to="/system-admin" replace />;
    if (user.role === 'citizen') return <Navigate to="/citizen" replace />;
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Layout chính (có Sidebar + Topbar) cho người dùng đã đăng nhập
const MainLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  return (
    <div className="app-layout">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="main-content">
        <Topbar onToggleMobile={() => setMobileOpen(!mobileOpen)} />
        <div className="content-area animate-fade-in">
          {children}
        </div>
      </div>
      <Chatbot />
    </div>
  );
};

function AppRoutes() {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'superadmin' ? '/system-admin' : user.role === 'admin' ? '/admin' : user.role === 'official' ? '/official' : user.role === 'office' ? '/office' : '/citizen'} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/forgot-password" element={user ? <Navigate to="/" replace /> : <ForgotPassword />} />
      
      <Route path="/citizen" element={
        <PrivateRoute allowedRoles={['citizen']}>
          <MainLayout><CitizenPortal /></MainLayout>
        </PrivateRoute>
      } />
      
      <Route path="/official" element={
        <PrivateRoute allowedRoles={['official']}>
          <MainLayout><OfficialDashboard /></MainLayout>
        </PrivateRoute>
      } />
      
      <Route path="/office" element={
        <PrivateRoute allowedRoles={['office']}>
          <MainLayout><OfficeDashboard /></MainLayout>
        </PrivateRoute>
      } />
      
      <Route path="/admin" element={
        <PrivateRoute allowedRoles={['admin']}>
          <MainLayout><AdminDashboard /></MainLayout>
        </PrivateRoute>
      } />

      <Route path="/system-admin" element={
        <PrivateRoute allowedRoles={['superadmin']}>
          <MainLayout><SystemAdmin /></MainLayout>
        </PrivateRoute>
      } />

      <Route path="/profile" element={
        <PrivateRoute>
          <MainLayout><ProfileSettings /></MainLayout>
        </PrivateRoute>
      } />

      {/* Mặc định chuyển hướng */}
      <Route path="/" element={
        user ? <Navigate to={user.role === 'superadmin' ? '/system-admin' : user.role === 'admin' ? '/admin' : user.role === 'official' ? '/official' : user.role === 'office' ? '/office' : '/citizen'} replace /> : <Navigate to="/login" replace />
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
