import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuthStore } from './store/authStore';

// Components
import SystemHUD from './components/SystemHUD';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ZoneMap from './pages/ZoneMap';
import ZoneDetail from './pages/ZoneDetail';
import VisualLearning from './pages/VisualLearning';
import GuidedCoding from './pages/GuidedCoding';
import AutonomousCoding from './pages/AutonomousCoding';
import BossBattle from './pages/BossBattle';
import RankUp from './pages/RankUp';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="w-20 h-20 border-2 border-primary/30 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
            {/* Inner rotating ring */}
            <div className="absolute inset-2 border-2 border-primary/50 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-primary animate-pulse">
                diamond
              </span>
            </div>
          </div>
          <p className="mt-6 text-sm tracking-[0.3em] text-gray-500 font-mono">
            [SYSTEM] INITIALIZING...
          </p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route (redirect to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <div className="min-h-screen bg-void text-white font-display">
      {/* Global Background Effects */}
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none z-0" />
      <div className="fixed inset-0 hex-bg opacity-50 pointer-events-none z-0" />
      <div className="fixed inset-0 scanlines pointer-events-none z-[60]" />
      <div className="fixed inset-0 vignette pointer-events-none z-[55]" />
      
      {/* Ambient Violet Glow */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] animate-pulse-slow pointer-events-none z-0" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[120px] animate-pulse-slow pointer-events-none z-0" style={{ animationDelay: '2s' }} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-[200px] pointer-events-none z-0" />
      
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastClassName="glass-panel border border-primary/30"
        progressClassName="bg-primary"
      />
      
      {/* Routes with SystemHUD wrapper */}
      <div className="relative z-10">
        <Routes>
          {/* Public Routes (No HUD) */}
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          
          {/* Protected Routes (With HUD) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <SystemHUD><Dashboard /></SystemHUD>
            </ProtectedRoute>
          } />
          <Route path="/zones" element={
            <ProtectedRoute>
              <SystemHUD><ZoneMap /></SystemHUD>
            </ProtectedRoute>
          } />
          <Route path="/zone/:zoneId" element={
            <ProtectedRoute>
              <SystemHUD><ZoneDetail /></SystemHUD>
            </ProtectedRoute>
          } />
          <Route path="/visual/:problemId" element={
            <ProtectedRoute>
              <SystemHUD><VisualLearning /></SystemHUD>
            </ProtectedRoute>
          } />
          <Route path="/guided/:problemId" element={
            <ProtectedRoute>
              <SystemHUD><GuidedCoding /></SystemHUD>
            </ProtectedRoute>
          } />
          <Route path="/autonomous/:problemId" element={
            <ProtectedRoute>
              <SystemHUD><AutonomousCoding /></SystemHUD>
            </ProtectedRoute>
          } />
          <Route path="/boss/:zoneId/:bossId" element={
            <ProtectedRoute>
              <BossBattle />
            </ProtectedRoute>
          } />
          <Route path="/boss/:zoneId" element={
            <ProtectedRoute>
              <BossBattle />
            </ProtectedRoute>
          } />
          <Route path="/rank-up" element={
            <ProtectedRoute>
              <SystemHUD><RankUp /></SystemHUD>
            </ProtectedRoute>
          } />
          
          {/* 404 */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center glass-panel p-12 rounded-2xl">
                <span className="material-symbols-outlined text-8xl text-primary mb-4">
                  explore_off
                </span>
                <h1 className="text-6xl font-bold text-primary mb-4 neon-text">404</h1>
                <p className="text-gray-400 font-mono mb-6">[SYSTEM] LOCATION NOT FOUND IN DATABASE</p>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="btn-system-primary px-8 py-3 rounded-lg"
                >
                  RETURN TO BASE
                </button>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </div>
  );
}

export default App;
