import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';
import { userAPI } from '../services/api';

const RankUp = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  
  const [phase, setPhase] = useState('loading'); // loading, intro, ceremony, stats, complete
  const [oldRank, setOldRank] = useState(user?.rank || 'E');
  const [newRank, setNewRank] = useState('D');
  const [statGains, setStatGains] = useState({});
  
  const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S'];
  const rankNames = {
    'E': 'E-Rank Hunter',
    'D': 'D-Rank Hunter',
    'C': 'C-Rank Hunter',
    'B': 'B-Rank Hunter',
    'A': 'A-Rank Hunter',
    'S': 'S-Rank Hunter'
  };
  
  const rankColors = {
    'E': { bg: 'from-gray-600 to-gray-500', text: 'text-gray-400', glow: 'shadow-gray-500/50' },
    'D': { bg: 'from-green-600 to-green-400', text: 'text-green-400', glow: 'shadow-green-500/50' },
    'C': { bg: 'from-blue-600 to-blue-400', text: 'text-blue-400', glow: 'shadow-blue-500/50' },
    'B': { bg: 'from-purple-600 to-purple-400', text: 'text-purple-400', glow: 'shadow-purple-500/50' },
    'A': { bg: 'from-orange-600 to-orange-400', text: 'text-orange-400', glow: 'shadow-orange-500/50' },
    'S': { bg: 'from-red-600 to-red-400', text: 'text-red-400', glow: 'shadow-red-500/50' }
  };
  
  useEffect(() => {
    const processRankUp = async () => {
      try {
        const response = await userAPI.triggerRankUp();
        
        if (response.data.rankedUp) {
          setOldRank(response.data.oldRank);
          setNewRank(response.data.newRank);
          setStatGains(response.data.statGains || {
            strength: 5,
            intelligence: 5,
            agility: 5,
            endurance: 5,
            sense: 5
          });
          
          // Update local user data
          updateUser(response.data.user);
          
          // Start ceremony
          setTimeout(() => setPhase('intro'), 1000);
        } else {
          toast.info('[SYSTEM] Requirements not met for rank up');
          navigate('/dashboard');
        }
      } catch (error) {
        toast.error('[SYSTEM] Rank up process failed');
        navigate('/dashboard');
      }
    };
    
    processRankUp();
  }, []);
  
  // Phase progression
  useEffect(() => {
    const timers = {
      intro: () => setTimeout(() => setPhase('ceremony'), 3000),
      ceremony: () => setTimeout(() => setPhase('stats'), 4000),
      stats: () => setTimeout(() => setPhase('complete'), 3000)
    };
    
    if (timers[phase]) {
      const timer = timers[phase]();
      return () => clearTimeout(timer);
    }
  }, [phase]);
  
  const colors = rankColors[newRank];
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className={`absolute inset-0 bg-gradient-radial ${colors.bg.replace('from-', 'from-').replace('to-', 'via-')}/10 via-transparent to-black`} />
        
        {/* Particle Effects */}
        {phase !== 'loading' && [...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 ${colors.text} rounded-full`}
            initial={{ 
              x: '50%', 
              y: '50%',
              opacity: 0 
            }}
            animate={{ 
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3,
              delay: i * 0.05,
              repeat: Infinity,
              repeatDelay: Math.random() * 2
            }}
          />
        ))}
      </div>
      
      {/* Loading Phase */}
      <AnimatePresence>
        {phase === 'loading' && (
          <motion.div
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <span className="material-symbols-outlined text-6xl text-primary">
                settings
              </span>
            </motion.div>
            <p className="text-gray-500 mt-4 font-mono">[SYSTEM] Processing rank up...</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Intro Phase */}
      <AnimatePresence>
        {phase === 'intro' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center z-10"
          >
            <motion.p
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="text-2xl text-gray-400 font-mono mb-8"
            >
              [SYSTEM NOTIFICATION]
            </motion.p>
            
            <motion.h1
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="text-5xl font-bold text-primary mb-4"
            >
              RANK UP REQUIREMENTS MET
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-xl text-gray-400"
            >
              Initiating advancement ceremony...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Ceremony Phase */}
      <AnimatePresence>
        {phase === 'ceremony' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center z-10"
          >
            {/* Old Rank */}
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: 0, opacity: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="mb-8"
            >
              <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${rankColors[oldRank].bg} flex items-center justify-center shadow-lg ${rankColors[oldRank].glow}`}>
                <span className="text-6xl font-bold text-white">{oldRank}</span>
              </div>
              <p className="text-gray-500 mt-4">{rankNames[oldRank]}</p>
            </motion.div>
            
            {/* Transformation Effect */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: [0, 1.5, 1], rotate: 0 }}
              transition={{ delay: 1.5, duration: 1, type: 'spring' }}
            >
              <motion.div
                animate={{ 
                  boxShadow: [
                    `0 0 0px ${colors.text.replace('text-', '')}`,
                    `0 0 100px ${colors.text.replace('text-', '')}`,
                    `0 0 50px ${colors.text.replace('text-', '')}`
                  ]
                }}
                transition={{ delay: 2, duration: 1 }}
                className={`w-40 h-40 mx-auto rounded-full bg-gradient-to-br ${colors.bg} flex items-center justify-center`}
              >
                <span className="text-7xl font-bold text-white">{newRank}</span>
              </motion.div>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.5 }}
              className={`text-4xl font-bold ${colors.text} mt-8`}
            >
              {rankNames[newRank]}
            </motion.h2>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Stats Phase */}
      <AnimatePresence>
        {phase === 'stats' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center z-10"
          >
            <h2 className="text-2xl font-bold text-primary mb-8">STATS INCREASED</h2>
            
            <div className="grid grid-cols-5 gap-4 max-w-2xl mx-auto">
              {Object.entries(statGains).map(([stat, gain], idx) => (
                <motion.div
                  key={stat}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-panel p-4 rounded-xl"
                >
                  <span className="material-symbols-outlined text-2xl text-primary mb-2">
                    {stat === 'strength' ? 'fitness_center' :
                     stat === 'intelligence' ? 'psychology' :
                     stat === 'agility' ? 'bolt' :
                     stat === 'endurance' ? 'favorite' : 'visibility'}
                  </span>
                  <p className="text-xs text-gray-500 uppercase">{stat.slice(0, 3)}</p>
                  <p className={`text-xl font-bold ${colors.text}`}>+{gain}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Complete Phase */}
      <AnimatePresence>
        {phase === 'complete' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center z-10"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-48 h-48 mx-auto rounded-full bg-gradient-to-br ${colors.bg} flex items-center justify-center shadow-2xl ${colors.glow} mb-8`}
            >
              <span className="text-8xl font-bold text-white">{newRank}</span>
            </motion.div>
            
            <h1 className={`text-4xl font-bold ${colors.text} mb-4`}>
              RANK UP COMPLETE!
            </h1>
            
            <p className="text-gray-400 mb-8">
              You are now a <span className={colors.text}>{rankNames[newRank]}</span>
            </p>
            
            {/* New Zone Unlocked */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-panel p-6 rounded-xl max-w-md mx-auto mb-8 border border-primary/30"
            >
              <span className="material-symbols-outlined text-4xl text-primary mb-2">
                lock_open
              </span>
              <h3 className="text-lg font-bold mb-2">NEW ZONE UNLOCKED!</h3>
              <p className="text-sm text-gray-400">
                Access to {newRank}-Rank challenges is now available
              </p>
            </motion.div>
            
            <button
              onClick={() => navigate('/dashboard')}
              className={`px-10 py-4 bg-gradient-to-r ${colors.bg} rounded-lg font-bold text-white text-lg hover:shadow-lg transition-all`}
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined">home</span>
                RETURN TO DASHBOARD
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RankUp;
