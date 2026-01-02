import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useProgressStore } from '../store/progressStore';

// System Messages that appear dynamically
const SYSTEM_QUOTES = [
  "The System is always watching.",
  "Strength is earned, not given.",
  "Every failure is data.",
  "The weak perish. Adapt.",
  "Your potential is being calculated.",
  "Dungeons await the worthy.",
  "Logic is your weapon.",
  "The System remembers everything.",
];

const SystemHUD = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, getXPProgress } = useAuthStore();
  const { currentPhase } = useProgressStore();
  
  const [systemMessage, setSystemMessage] = useState('');
  const [showSystemAlert, setShowSystemAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('notice');
  
  // Rotate system quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMessage(SYSTEM_QUOTES[Math.floor(Math.random() * SYSTEM_QUOTES.length)]);
    }, 10000);
    setSystemMessage(SYSTEM_QUOTES[0]);
    return () => clearInterval(interval);
  }, []);
  
  // Show welcome alert on auth
  useEffect(() => {
    if (isAuthenticated && user) {
      showAlert(`HUNTER ${user.hunterName?.toUpperCase()} - STATUS: ACTIVE`, 'notice');
    }
  }, [isAuthenticated, user]);
  
  const showAlert = (message, type = 'notice') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowSystemAlert(true);
    setTimeout(() => setShowSystemAlert(false), 4000);
  };
  
  const getRankConfig = (rank) => {
    const configs = {
      'E': { color: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500', glow: 'shadow-gray-500/30' },
      'D': { color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500', glow: 'shadow-green-500/30' },
      'C': { color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500', glow: 'shadow-blue-500/30' },
      'B': { color: 'text-primary', bg: 'bg-primary/20', border: 'border-primary', glow: 'shadow-primary/30' },
      'A': { color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500', glow: 'shadow-orange-500/30' },
      'S': { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500', glow: 'shadow-red-500/30' },
    };
    return configs[rank] || configs['E'];
  };
  
  const xpProgress = getXPProgress();
  const rankConfig = getRankConfig(user?.rank || 'E');
  
  // Don't show HUD on landing, login, register pages
  const hideHUD = ['/', '/login', '/register'].includes(location.pathname);
  
  if (hideHUD) {
    return <>{children}</>;
  }
  
  return (
    <div className="min-h-screen bg-void">
      {/* System Alert Overlay */}
      <AnimatePresence>
        {showSystemAlert && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100]"
          >
            <div className={`
              px-8 py-4 rounded-lg backdrop-blur-xl
              ${alertType === 'notice' ? 'system-notice' : ''}
              ${alertType === 'warning' ? 'system-warning' : ''}
              ${alertType === 'error' ? 'system-error' : ''}
              ${alertType === 'success' ? 'bg-green-500/20 border-l-4 border-green-500' : ''}
            `}>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-xl animate-pulse">
                  {alertType === 'notice' && 'info'}
                  {alertType === 'warning' && 'warning'}
                  {alertType === 'error' && 'error'}
                  {alertType === 'success' && 'check_circle'}
                </span>
                <span className="font-system text-sm tracking-wider">{alertMessage}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Top HUD Bar */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 glass-panel-strong border-b border-primary/20"
      >
        <div className="max-w-[1920px] mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Left Section - Logo & Navigation */}
            <div className="flex items-center gap-6">
              {/* System Logo */}
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center group-hover:shadow-neon transition-all">
                  <span className="material-symbols-outlined text-primary text-xl">
                    diamond
                  </span>
                </div>
                <div className="hidden md:block">
                  <h1 className="text-lg font-bold tracking-wider">
                    <span className="text-primary neon-text">SOLO</span>
                    <span className="text-white">LEVELING</span>
                  </h1>
                  <p className="text-[10px] text-gray-500 tracking-[0.3em] -mt-1">DSA SYSTEM</p>
                </div>
              </button>
              
              {/* Nav Links */}
              <nav className="hidden lg:flex items-center gap-1">
                <NavLink to="/dashboard" icon="home" label="Dashboard" />
                <NavLink to="/zones" icon="map" label="Zones" />
              </nav>
            </div>
            
            {/* Center Section - System Status */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-void border border-primary/20">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs text-gray-400 font-mono">
                  SYSTEM ONLINE
                </span>
              </div>
              
              <motion.div 
                key={systemMessage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-gray-500 italic max-w-[200px] truncate"
              >
                "{systemMessage}"
              </motion.div>
            </div>
            
            {/* Right Section - Hunter Stats */}
            <div className="flex items-center gap-4">
              {/* Current Phase Indicator */}
              {currentPhase && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/30">
                  <span className="material-symbols-outlined text-primary text-sm">
                    {currentPhase === 'visualization' ? 'visibility' : 
                     currentPhase === 'guided' ? 'school' : 'code'}
                  </span>
                  <span className="text-xs text-primary uppercase tracking-wider">
                    {currentPhase}
                  </span>
                </div>
              )}
              
              {/* XP Bar */}
              <div className="hidden sm:block w-32">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-gray-500">LV.{user?.level || 1}</span>
                  <span className="text-[10px] text-primary">{Math.round(xpProgress)}%</span>
                </div>
                <div className="h-1.5 bg-void rounded-full overflow-hidden border border-primary/20">
                  <motion.div
                    className="h-full xp-bar"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
              
              {/* Rank Badge */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  ${rankConfig.bg} ${rankConfig.border} border-2
                  cursor-pointer hover:shadow-lg ${rankConfig.glow}
                  transition-all
                `}
                onClick={() => navigate('/dashboard')}
              >
                <span className={`text-xl font-bold ${rankConfig.color}`}>
                  {user?.rank || 'E'}
                </span>
              </motion.div>
              
              {/* Hunter Profile */}
              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-semibold">{user?.hunterName || 'Hunter'}</p>
                  <p className="text-[10px] text-gray-500">
                    {user?.gold || 0} <span className="text-yellow-500">◆</span> Gold
                  </p>
                </div>
                
                {/* Profile Menu */}
                <div className="relative group">
                  <button className="w-10 h-10 rounded-lg glass-panel flex items-center justify-center hover:border-primary/50 transition-all">
                    <span className="material-symbols-outlined text-gray-400">
                      person
                    </span>
                  </button>
                  
                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-48 glass-panel-strong rounded-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="p-3 border-b border-primary/10">
                      <p className="text-sm font-semibold">{user?.hunterName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="w-full px-3 py-2 text-left text-sm text-gray-400 hover:bg-primary/10 hover:text-white flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">dashboard</span>
                      Dashboard
                    </button>
                    <button
                      onClick={logout}
                      className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">logout</span>
                      Disconnect
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>
      
      {/* Side HUD Panel (Stats) */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="fixed left-4 top-24 bottom-4 w-16 hidden xl:flex flex-col items-center py-4 glass-panel rounded-xl z-40"
      >
        {/* Quick Stats */}
        <div className="flex flex-col items-center gap-4">
          <StatIcon icon="fitness_center" value={user?.stats?.strength || 10} label="STR" color="text-red-400" />
          <StatIcon icon="psychology" value={user?.stats?.intelligence || 10} label="INT" color="text-blue-400" />
          <StatIcon icon="bolt" value={user?.stats?.agility || 10} label="AGI" color="text-yellow-400" />
          <StatIcon icon="favorite" value={user?.stats?.endurance || 10} label="END" color="text-green-400" />
          <StatIcon icon="visibility" value={user?.stats?.sense || 10} label="SEN" color="text-primary" />
        </div>
        
        <div className="flex-1" />
        
        {/* Quick Actions */}
        <div className="flex flex-col items-center gap-2">
          <button 
            onClick={() => navigate('/zones')}
            className="w-10 h-10 rounded-lg glass-panel flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/50 transition-all"
            title="Zone Map"
          >
            <span className="material-symbols-outlined">map</span>
          </button>
        </div>
      </motion.aside>
      
      {/* Main Content Area */}
      <main className="pt-16 xl:pl-24 min-h-screen">
        {children}
      </main>
      
      {/* Bottom System Bar */}
      <motion.footer
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-primary/10 py-2"
      >
        <div className="max-w-[1920px] mx-auto px-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4 text-gray-500">
              <span className="font-mono">[SYSTEM v1.0.0]</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Problems Solved: {user?.totalProblemsSolved || 0}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Streak: {user?.currentStreak || 0} days</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <span className="material-symbols-outlined text-xs text-primary animate-pulse">radio_button_checked</span>
              <span className="font-mono">CONNECTED TO SYSTEM</span>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

// Navigation Link Component
const NavLink = ({ to, icon, label }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
  
  return (
    <button
      onClick={() => navigate(to)}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg transition-all
        ${isActive 
          ? 'bg-primary/20 text-primary border border-primary/30' 
          : 'text-gray-400 hover:text-white hover:bg-white/5'
        }
      `}
    >
      <span className="material-symbols-outlined text-lg">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

// Stat Icon Component
const StatIcon = ({ icon, value, label, color }) => (
  <div className="flex flex-col items-center group cursor-default" title={`${label}: ${value}`}>
    <div className={`w-10 h-10 rounded-lg bg-void flex items-center justify-center border border-gray-800 group-hover:border-primary/30 transition-all`}>
      <span className={`material-symbols-outlined text-lg ${color}`}>{icon}</span>
    </div>
    <span className="text-[10px] text-gray-500 mt-1">{value}</span>
  </div>
);

export default SystemHUD;
