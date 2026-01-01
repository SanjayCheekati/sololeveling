import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ZoneMap from './pages/ZoneMap';
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
        <div className="text-primary animate-pulse">
          <span className="material-symbols-outlined text-6xl">settings</span>
          <p className="mt-4 text-sm tracking-widest">LOADING SYSTEM...</p>
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
      {/* Background Effects */}
      <div className="fixed inset-0 grid-bg opacity-50 pointer-events-none z-0" />
      <div className="fixed inset-0 scanlines pointer-events-none z-50" />
      <div className="fixed inset-0 vignette pointer-events-none z-40" />
      
      {/* Ambient Glow */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] animate-pulse-slow pointer-events-none z-0" />
      <div className="fixed bottom-1/4 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-[80px] animate-pulse-slow pointer-events-none z-0" style={{ animationDelay: '1.5s' }} />
      
      {/* Routes */}
      <div className="relative z-10">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/zones" element={<ProtectedRoute><ZoneMap /></ProtectedRoute>} />
          <Route path="/zone/:zone" element={<ProtectedRoute><ZoneMap /></ProtectedRoute>} />
          <Route path="/learn/:problemSlug" element={<ProtectedRoute><VisualLearning /></ProtectedRoute>} />
          <Route path="/guided/:problemSlug" element={<ProtectedRoute><GuidedCoding /></ProtectedRoute>} />
          <Route path="/solve/:problemSlug" element={<ProtectedRoute><AutonomousCoding /></ProtectedRoute>} />
          <Route path="/boss/:problemSlug" element={<ProtectedRoute><BossBattle /></ProtectedRoute>} />
          <Route path="/rank-up" element={<ProtectedRoute><RankUp /></ProtectedRoute>} />
          
          {/* 404 */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
                <p className="text-gray-400">[SYSTEM] Route not found</p>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </div>
  );
}

export default App;
