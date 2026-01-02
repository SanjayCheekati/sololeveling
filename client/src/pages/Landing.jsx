import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Landing = () => {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  const [introPhase, setIntroPhase] = useState(0);
  const [showMain, setShowMain] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  
  // System Awakening sequence messages
  const introMessages = [
    { text: "...", delay: 800 },
    { text: "[SYSTEM] Neural interface detected...", delay: 1200 },
    { text: "[SYSTEM] Analyzing cognitive patterns...", delay: 1200 },
    { text: "[SYSTEM] Potential identified...", delay: 1000 },
    { text: "[SYSTEM] AWAKENING PROTOCOL INITIATED", delay: 1500 },
  ];
  
  useEffect(() => {
    if (showIntro && introPhase < introMessages.length) {
      const timer = setTimeout(() => {
        setIntroPhase(prev => prev + 1);
      }, introMessages[introPhase]?.delay || 1000);
      return () => clearTimeout(timer);
    } else if (introPhase >= introMessages.length) {
      setTimeout(() => {
        setShowIntro(false);
        setShowMain(true);
      }, 500);
    }
  }, [introPhase, showIntro, introMessages.length]);
  
  // Glitch effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 150);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left - rect.width / 2) / 50,
          y: (e.clientY - rect.top - rect.height / 2) / 50,
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  const handleAwaken = () => {
    setGlitchActive(true);
    setTimeout(() => navigate('/register'), 300);
  };
  
  const handleLogin = () => {
    navigate('/login');
  };
  
  return (
    <div 
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-void via-void to-primary/5" />
      
      {/* Animated Grid */}
      <div 
        className="absolute inset-0 grid-bg opacity-30"
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
        }}
      />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              background: i % 3 === 0 ? '#8B5CF6' : i % 3 === 1 ? '#06B6D4' : '#C084FC',
              left: `${Math.random() * 100}%`,
              filter: 'blur(1px)',
            }}
            initial={{ 
              y: typeof window !== 'undefined' ? window.innerHeight + 20 : 1000,
              opacity: 0,
            }}
            animate={{
              y: -20,
              opacity: [0, 0.6, 0.6, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 8,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: "linear",
            }}
          />
        ))}
      </div>
      
      {/* Radial Glow */}
      <div 
        className="absolute w-[800px] h-[800px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
          transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)`,
        }}
      />
      
      {/* Intro Sequence */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-void z-50"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center font-mono max-w-lg px-6">
              {introMessages.slice(0, introPhase + 1).map((msg, idx) => (
                <motion.p
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`mb-4 ${
                    idx === introPhase 
                      ? 'text-primary text-lg neon-text' 
                      : 'text-gray-600 text-sm'
                  }`}
                >
                  {msg.text}
                  {idx === introPhase && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="ml-1"
                    >
                      _
                    </motion.span>
                  )}
                </motion.p>
              ))}
              
              {/* Loading bar */}
              <div className="mt-8 h-1 bg-gray-800 rounded-full overflow-hidden w-64 mx-auto">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${((introPhase + 1) / introMessages.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
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
            transition={{ duration: 1.5 }}
            className="relative z-10 text-center px-6 max-w-4xl mx-auto"
          >
            {/* System Logo/Icon */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 1, type: "spring", bounce: 0.3 }}
              className="mb-12"
            >
              <div className="relative inline-block">
                {/* Outer Rotating Ring */}
                <motion.div
                  className="absolute -inset-8 border-2 border-primary/20 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                >
                  {/* Ring markers */}
                  {[0, 90, 180, 270].map((deg) => (
                    <div
                      key={deg}
                      className="absolute w-2 h-2 bg-primary rounded-full"
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: `rotate(${deg}deg) translateX(80px) translateY(-50%)`,
                      }}
                    />
                  ))}
                </motion.div>
                
                {/* Middle Rotating Ring */}
                <motion.div
                  className="absolute -inset-4 border border-cyan-500/30 rounded-full"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                
                {/* Core */}
                <motion.div 
                  className={`w-32 h-32 system-panel rounded-2xl flex items-center justify-center ${glitchActive ? 'animate-glitch' : ''}`}
                  whileHover={{ scale: 1.05 }}
                  animate={{ 
                    boxShadow: [
                      '0 0 30px rgba(139, 92, 246, 0.3)',
                      '0 0 60px rgba(139, 92, 246, 0.5)',
                      '0 0 30px rgba(139, 92, 246, 0.3)',
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="material-symbols-outlined text-6xl text-primary neon-text">
                    diamond
                  </span>
                </motion.div>
              </div>
            </motion.div>
            
            {/* Title */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h1 className={`text-6xl md:text-8xl font-bold tracking-wider mb-4 ${glitchActive ? 'animate-glitch' : ''}`}>
                <span className="text-primary neon-text-strong">SOLO</span>
                <span className="text-white">LEVELING</span>
              </h1>
              
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-primary to-transparent" />
                <span className="text-primary text-lg tracking-[0.4em] font-system">
                  DSA × SYSTEM
                </span>
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-primary to-transparent" />
              </div>
            </motion.div>
            
            {/* Subtitle */}
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-gray-400 max-w-xl mx-auto mb-12 leading-relaxed text-lg"
            >
              You have been chosen. The System has detected your potential.
              <br />
              <span className="text-primary">Awaken</span> and master the algorithms that govern this world.
            </motion.p>
            
            {/* Stats Preview */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex justify-center gap-4 mb-12"
            >
              {[
                { label: 'STR', icon: 'fitness_center', color: 'text-red-400' },
                { label: 'INT', icon: 'psychology', color: 'text-blue-400' },
                { label: 'AGI', icon: 'bolt', color: 'text-yellow-400' },
                { label: 'END', icon: 'favorite', color: 'text-green-400' },
                { label: 'SEN', icon: 'visibility', color: 'text-primary' },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1 + idx * 0.1 }}
                  className="w-16 h-20 glass-panel rounded-xl flex flex-col items-center justify-center hover:border-primary/50 transition-all cursor-default group"
                >
                  <span className={`material-symbols-outlined text-xl ${stat.color} group-hover:scale-110 transition-transform`}>
                    {stat.icon}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">{stat.label}</span>
                  <span className="text-sm font-bold text-gray-400">??</span>
                </motion.div>
              ))}
            </motion.div>
            
            {/* CTA Buttons */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <motion.button
                onClick={handleAwaken}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-12 py-4 rounded-xl overflow-hidden"
              >
                {/* Button Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-dark via-primary to-primary-light opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                </div>
                
                {/* Button Content */}
                <div className="relative flex items-center gap-3 text-white font-bold tracking-wider">
                  <span className="material-symbols-outlined">flash_on</span>
                  <span>AWAKEN NOW</span>
                </div>
                
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-xl shadow-neon-strong opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
              
              <motion.button
                onClick={handleLogin}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-4 rounded-xl glass-panel border-primary/30 text-gray-400 hover:text-white hover:border-primary/60 transition-all flex items-center gap-3"
              >
                <span className="material-symbols-outlined">login</span>
                <span className="font-semibold tracking-wider">RETURN HUNTER</span>
              </motion.button>
            </motion.div>
            
            {/* System Notice */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-16 system-notice inline-block rounded-lg"
            >
              <p className="text-xs font-mono text-primary/80">
                [SYSTEM NOTICE] Only those with true potential may enter. The weak will be filtered.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Bottom Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
      
      {/* Corner Decorations */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-primary/20 rounded-tl-2xl" />
      <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-primary/20 rounded-tr-2xl" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-primary/20 rounded-bl-2xl" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-primary/20 rounded-br-2xl" />
      
      {/* Version Tag */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-700 font-mono">
        v1.0.0 // SYSTEM
      </div>
    </div>
  );
};

export default Landing;
