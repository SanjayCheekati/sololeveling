import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Landing = () => {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  const [introPhase, setIntroPhase] = useState(0);
  const [showMain, setShowMain] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  
  // Intro sequence messages
  const introMessages = [
    "[SYSTEM] Connection established...",
    "[SYSTEM] Neural interface detected...",
    "[SYSTEM] Scanning cognitive patterns...",
    "[SYSTEM] AWAKENING PROTOCOL INITIATED"
  ];
  
  useEffect(() => {
    // Intro sequence timing
    if (showIntro && introPhase < introMessages.length) {
      const timer = setTimeout(() => {
        setIntroPhase(prev => prev + 1);
      }, 1200);
      return () => clearTimeout(timer);
    } else if (introPhase >= introMessages.length) {
      setTimeout(() => {
        setShowIntro(false);
        setShowMain(true);
      }, 800);
    }
  }, [introPhase, showIntro]);
  
  // Random glitch effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 150);
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  
  const handleAwaken = () => {
    setGlitchActive(true);
    setTimeout(() => {
      navigate('/register');
    }, 300);
  };
  
  const handleLogin = () => {
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-void to-void" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 10
            }}
            animate={{
              y: -10,
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: "linear"
            }}
          />
        ))}
      </div>
      
      {/* Intro Sequence */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-void z-50"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center font-mono">
              {introMessages.slice(0, introPhase + 1).map((msg, idx) => (
                <motion.p
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-3 ${
                    idx === introPhase 
                      ? 'text-primary text-lg' 
                      : 'text-gray-500 text-sm'
                  }`}
                >
                  {msg}
                  {idx === introPhase && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      _
                    </motion.span>
                  )}
                </motion.p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <AnimatePresence>
        {showMain && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative z-10 text-center px-6"
          >
            {/* System Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
              className="mb-8"
            >
              <div className="relative inline-block">
                {/* Outer Ring */}
                <motion.div
                  className="absolute inset-0 border-2 border-primary/30 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  style={{ width: '180px', height: '180px', margin: '-15px' }}
                />
                
                {/* Inner Ring */}
                <motion.div
                  className="absolute inset-0 border border-primary/50 rounded-full"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  style={{ width: '160px', height: '160px', margin: '-5px' }}
                />
                
                {/* Core Icon */}
                <div className={`w-[150px] h-[150px] glass-panel rounded-full flex items-center justify-center ${glitchActive ? 'animate-glitch' : ''}`}>
                  <span className="material-symbols-outlined text-7xl text-primary neon-text">
                    psychology
                  </span>
                </div>
              </div>
            </motion.div>
            
            {/* Title */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className={`text-5xl md:text-7xl font-bold tracking-wider mb-2 ${glitchActive ? 'glitch-text' : ''}`}>
                <span className="text-primary neon-text">SOLO</span>
                <span className="text-white">LEVELING</span>
              </h1>
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/50" />
                <span className="text-primary text-sm tracking-[0.3em] font-mono">DSA SYSTEM</span>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/50" />
              </div>
            </motion.div>
            
            {/* Subtitle */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-400 max-w-md mx-auto mb-10 leading-relaxed"
            >
              You have been chosen. Awaken your potential and master the 
              <span className="text-primary"> Data Structures & Algorithms </span>
              that govern this world.
            </motion.p>
            
            {/* Stats Preview */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex justify-center gap-6 mb-10"
            >
              {[
                { label: 'STR', value: '??', icon: 'fitness_center' },
                { label: 'INT', value: '??', icon: 'psychology' },
                { label: 'AGI', value: '??', icon: 'bolt' },
              ].map((stat, idx) => (
                <div 
                  key={stat.label}
                  className="glass-panel px-4 py-3 rounded-lg flex flex-col items-center min-w-[80px]"
                >
                  <span className="material-symbols-outlined text-primary text-xl mb-1">
                    {stat.icon}
                  </span>
                  <span className="text-xs text-gray-500">{stat.label}</span>
                  <span className="text-lg font-bold text-primary">{stat.value}</span>
                </div>
              ))}
            </motion.div>
            
            {/* Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {/* Awaken Button */}
              <button
                onClick={handleAwaken}
                className="group relative px-10 py-4 bg-gradient-to-r from-primary to-blue-400 rounded-lg font-bold text-black tracking-wider overflow-hidden transition-all hover:shadow-neon hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="material-symbols-outlined">flash_on</span>
                  AWAKEN
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
              
              {/* Login Button */}
              <button
                onClick={handleLogin}
                className="group px-10 py-4 glass-panel rounded-lg font-bold tracking-wider text-primary hover:bg-primary/10 transition-all border border-primary/30 hover:border-primary/60"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined">login</span>
                  CONTINUE
                </span>
              </button>
            </motion.div>
            
            {/* System Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-12 font-mono text-sm"
            >
              <p className="text-gray-600">
                [SYSTEM] <span className="text-green-400">●</span> Status: Online
              </p>
              <p className="text-gray-600 mt-1">
                [SYSTEM] Hunters registered: <span className="text-primary">∞</span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Version Tag */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-700 font-mono">
        v1.0.0 // MVP
      </div>
    </div>
  );
};

export default Landing;
