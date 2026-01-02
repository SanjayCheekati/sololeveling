import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';

const RankUp = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [showCeremony, setShowCeremony] = useState(true);
  const [ceremonyPhase, setCeremonyPhase] = useState(0);
  const [newRank, setNewRank] = useState(null);
  const [oldRank, setOldRank] = useState(null);
  const [statsGained, setStatsGained] = useState({});
  const [newSkill, setNewSkill] = useState(null);
  
  const ranks = useMemo(() => ['E', 'D', 'C', 'B', 'A', 'S'], []);
  
  const rankInfo = useMemo(() => ({
    'E': { 
      name: 'E-Rank', 
      title: 'Unawakened', 
      color: '#9CA3AF',
      description: 'A hunter who has just begun their journey.',
      statBonus: { strength: 5, intelligence: 5, agility: 5, endurance: 5, sense: 5 }
    },
    'D': { 
      name: 'D-Rank', 
      title: 'Awakened', 
      color: '#22C55E',
      description: 'Awakened to the power within. The journey truly begins.',
      statBonus: { strength: 10, intelligence: 10, agility: 8, endurance: 8, sense: 7 },
      skill: { name: 'Basic Array Mastery', icon: 'grid_view', description: '+10% XP from Array problems' }
    },
    'C': { 
      name: 'C-Rank', 
      title: 'Skilled', 
      color: '#3B82F6',
      description: 'A competent hunter who can handle most challenges.',
      statBonus: { strength: 15, intelligence: 18, agility: 12, endurance: 12, sense: 10 },
      skill: { name: 'Stack Sense', icon: 'layers', description: 'Unlock Stack Citadel zone' }
    },
    'B': { 
      name: 'B-Rank', 
      title: 'Elite', 
      color: '#8B5CF6',
      description: 'An elite hunter capable of facing dangerous dungeons.',
      statBonus: { strength: 22, intelligence: 28, agility: 18, endurance: 18, sense: 15 },
      skill: { name: 'Recursive Insight', icon: 'all_inclusive', description: 'Unlock Recursion Depths zone' }
    },
    'A': { 
      name: 'A-Rank', 
      title: 'Champion', 
      color: '#F97316',
      description: 'Among the strongest hunters in existence.',
      statBonus: { strength: 35, intelligence: 45, agility: 28, endurance: 28, sense: 25 },
      skill: { name: 'Tree Walker', icon: 'account_tree', description: 'Unlock Tree Sanctuary zone' }
    },
    'S': { 
      name: 'S-Rank', 
      title: 'Monarch', 
      color: '#EF4444',
      description: 'The pinnacle of power. A true Shadow Monarch.',
      statBonus: { strength: 50, intelligence: 70, agility: 40, endurance: 40, sense: 35 },
      skill: { name: 'Shadow Sovereign', icon: 'diamond', description: 'Access to all dungeons + Boss Rush mode' }
    }
  }), []);
  
  const loadPhase = useCallback(() => {
    // Determine if rank up is happening
    const currentRank = user?.rank || 'E';
    const currentRankIdx = ranks.indexOf(currentRank);
    
    // Check if user qualifies for rank up (simplified logic)
    const problemsSolved = user?.totalProblemsSolved || 0;
    const levelThresholds = { 'E': 5, 'D': 15, 'C': 30, 'B': 50, 'A': 80 };
    
    let nextRank = currentRank;
    for (let i = currentRankIdx; i < ranks.length - 1; i++) {
      if (problemsSolved >= levelThresholds[ranks[i]]) {
        nextRank = ranks[i + 1];
      }
    }
    
    if (nextRank !== currentRank) {
      setOldRank(currentRank);
      setNewRank(nextRank);
      setStatsGained(rankInfo[nextRank].statBonus);
      setNewSkill(rankInfo[nextRank].skill);
      
      // Start ceremony
      setTimeout(() => setCeremonyPhase(1), 1000);
      setTimeout(() => setCeremonyPhase(2), 3000);
      setTimeout(() => setCeremonyPhase(3), 5000);
      setTimeout(() => setCeremonyPhase(4), 7000);
      setTimeout(() => {
        setShowCeremony(false);
        toast.success(`[SYSTEM] Rank up complete: ${nextRank}-Rank!`);
      }, 9000);
    } else {
      // No rank up, show current status
      setOldRank(currentRank);
      setNewRank(currentRank);
      setShowCeremony(false);
    }
  }, [user, ranks, rankInfo]);

  useEffect(() => {
    loadPhase();
  }, [loadPhase]);
  
  const currentRankInfo = rankInfo[newRank || user?.rank || 'E'];
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10">
        <motion.div
          animate={{ 
            background: [
              'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 60%)',
              'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.2) 0%, transparent 60%)',
              'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 60%)'
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0"
        />
      </div>
      
      {/* Rank Up Ceremony */}
      <AnimatePresence>
        {showCeremony && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-void flex items-center justify-center z-50"
          >
            {/* Shockwave effects */}
            {ceremonyPhase >= 2 && [...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 5, opacity: 0 }}
                transition={{ 
                  duration: 2, 
                  delay: i * 0.4,
                  repeat: ceremonyPhase < 4 ? Infinity : 0 
                }}
                className="absolute w-40 h-40 border-4 border-primary rounded-full"
              />
            ))}
            
            {/* Particle explosion */}
            {ceremonyPhase >= 3 && [...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  opacity: 1,
                  scale: 1
                }}
                animate={{ 
                  x: (Math.random() - 0.5) * 600,
                  y: (Math.random() - 0.5) * 600,
                  opacity: 0,
                  scale: 0
                }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute w-2 h-2 rounded-full"
                style={{ background: currentRankInfo?.color || '#8B5CF6' }}
              />
            ))}
            
            <div className="text-center relative">
              {/* Phase 0: System notice */}
              {ceremonyPhase === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-mono text-sm text-primary"
                >
                  [SYSTEM] Processing rank evaluation...
                </motion.div>
              )}
              
              {/* Phase 1: Old rank fading */}
              {ceremonyPhase === 1 && (
                <motion.div
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ scale: 0.5, opacity: 0.3 }}
                  className="text-center"
                >
                  <div 
                    className="w-32 h-32 mx-auto rounded-full flex items-center justify-center border-4 mb-4"
                    style={{ borderColor: rankInfo[oldRank]?.color }}
                  >
                    <span 
                      className="text-6xl font-bold"
                      style={{ color: rankInfo[oldRank]?.color }}
                    >
                      {oldRank}
                    </span>
                  </div>
                  <p className="text-gray-500">{rankInfo[oldRank]?.name}</p>
                </motion.div>
              )}
              
              {/* Phase 2: Transformation */}
              {ceremonyPhase === 2 && (
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: [0.5, 1.5, 1] }}
                  transition={{ duration: 1.5 }}
                  className="text-center"
                >
                  <div className="text-2xl font-bold text-primary mb-4 font-mono">
                    [SYSTEM] RANK ADVANCEMENT DETECTED
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-40 h-40 mx-auto relative"
                  >
                    <div className="absolute inset-0 border-4 border-primary rounded-full animate-pulse" />
                    <div className="absolute inset-4 border-4 border-primary/50 rounded-full" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-6xl text-primary">upgrade</span>
                    </div>
                  </motion.div>
                </motion.div>
              )}
              
              {/* Phase 3: New rank reveal */}
              {ceremonyPhase === 3 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 10 }}
                  className="text-center"
                >
                  <motion.div 
                    className="w-40 h-40 mx-auto rounded-full flex items-center justify-center border-4 mb-4"
                    style={{ 
                      borderColor: currentRankInfo?.color,
                      boxShadow: `0 0 60px ${currentRankInfo?.color}80`
                    }}
                    animate={{ 
                      boxShadow: [
                        `0 0 60px ${currentRankInfo?.color}80`,
                        `0 0 100px ${currentRankInfo?.color}80`,
                        `0 0 60px ${currentRankInfo?.color}80`
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span 
                      className="text-7xl font-bold"
                      style={{ color: currentRankInfo?.color }}
                    >
                      {newRank}
                    </span>
                  </motion.div>
                  <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold"
                    style={{ color: currentRankInfo?.color }}
                  >
                    {currentRankInfo?.name}
                  </motion.h1>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-xl text-gray-400"
                  >
                    {currentRankInfo?.title}
                  </motion.p>
                </motion.div>
              )}
              
              {/* Phase 4: Stats and skills */}
              {ceremonyPhase === 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel-strong rounded-2xl p-8 max-w-md"
                >
                  <div className="text-center mb-6">
                    <div 
                      className="w-20 h-20 mx-auto rounded-full flex items-center justify-center border-4 mb-4"
                      style={{ 
                        borderColor: currentRankInfo?.color,
                        boxShadow: `0 0 40px ${currentRankInfo?.color}60`
                      }}
                    >
                      <span className="text-4xl font-bold" style={{ color: currentRankInfo?.color }}>
                        {newRank}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold" style={{ color: currentRankInfo?.color }}>
                      {currentRankInfo?.name}
                    </h2>
                    <p className="text-sm text-gray-500">{currentRankInfo?.description}</p>
                  </div>
                  
                  {/* Stat bonuses */}
                  <div className="mb-6">
                    <h3 className="text-xs text-gray-500 font-mono mb-3">STAT BONUSES</h3>
                    <div className="grid grid-cols-5 gap-2">
                      {Object.entries(statsGained).map(([stat, value]) => (
                        <motion.div
                          key={stat}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: Math.random() * 0.5 }}
                          className="text-center p-2 bg-void rounded-lg"
                        >
                          <p className="text-lg font-bold text-primary">+{value}</p>
                          <p className="text-[10px] text-gray-500 uppercase">{stat.slice(0, 3)}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  {/* New skill */}
                  {newSkill && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="p-4 bg-primary/10 rounded-lg border border-primary/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                          <span className="material-symbols-outlined text-2xl text-primary">
                            {newSkill.icon}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-primary font-mono">NEW SKILL UNLOCKED</p>
                          <p className="font-bold">{newSkill.name}</p>
                          <p className="text-xs text-gray-400">{newSkill.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Regular Rank Status View */}
      {!showCeremony && (
        <div className="p-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 rounded-lg glass-panel flex items-center justify-center hover:bg-primary/20"
            >
              <span className="material-symbols-outlined text-primary">arrow_back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold">Hunter Rank Status</h1>
              <p className="text-sm text-gray-500">Your current standing in the System</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Rank Card */}
            <div className="glass-panel-strong rounded-2xl p-8 relative overflow-hidden">
              <div 
                className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-30"
                style={{ background: currentRankInfo?.color }}
              />
              
              <div className="relative text-center">
                <motion.div 
                  className="w-32 h-32 mx-auto rounded-full flex items-center justify-center border-4 mb-6"
                  style={{ 
                    borderColor: currentRankInfo?.color,
                    boxShadow: `0 0 40px ${currentRankInfo?.color}40`
                  }}
                  animate={{ 
                    boxShadow: [
                      `0 0 40px ${currentRankInfo?.color}40`,
                      `0 0 60px ${currentRankInfo?.color}40`,
                      `0 0 40px ${currentRankInfo?.color}40`
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <span 
                    className="text-6xl font-bold"
                    style={{ color: currentRankInfo?.color }}
                  >
                    {newRank || user?.rank || 'E'}
                  </span>
                </motion.div>
                
                <h2 className="text-2xl font-bold" style={{ color: currentRankInfo?.color }}>
                  {currentRankInfo?.name}
                </h2>
                <p className="text-lg text-gray-400 mb-2">{currentRankInfo?.title}</p>
                <p className="text-sm text-gray-500">{currentRankInfo?.description}</p>
              </div>
            </div>
            
            {/* Stats & Progress */}
            <div className="space-y-6">
              {/* Current Stats */}
              <div className="glass-panel rounded-xl p-6">
                <h3 className="text-sm text-gray-500 font-mono mb-4">CURRENT STATS</h3>
                <div className="space-y-3">
                  {user?.stats && Object.entries(user.stats).map(([stat, value]) => (
                    <div key={stat} className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm uppercase">{stat}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-void rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-cyan-500"
                            style={{ width: `${Math.min((value / 100) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-white font-bold w-8">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Progress to next rank */}
              <div className="glass-panel rounded-xl p-6">
                <h3 className="text-sm text-gray-500 font-mono mb-4">NEXT RANK PROGRESS</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Problems Solved</span>
                      <span className="text-primary">{user?.totalProblemsSolved || 0}/50</span>
                    </div>
                    <div className="h-3 bg-void rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-cyan-500"
                        style={{ width: `${((user?.totalProblemsSolved || 0) / 50) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Bosses Defeated</span>
                      <span className="text-red-400">{user?.bossesDefeated || 0}/4</span>
                    </div>
                    <div className="h-3 bg-void rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                        style={{ width: `${((user?.bossesDefeated || 0) / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Rank Progression */}
          <div className="glass-panel rounded-xl p-6 mt-6">
            <h3 className="text-sm text-gray-500 font-mono mb-6">RANK PROGRESSION</h3>
            <div className="flex items-center justify-between">
              {ranks.map((rank, idx) => {
                const info = rankInfo[rank];
                const isCurrentOrPast = ranks.indexOf(user?.rank || 'E') >= idx;
                const isCurrent = (user?.rank || 'E') === rank;
                
                return (
                  <React.Fragment key={rank}>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`relative ${isCurrentOrPast ? '' : 'opacity-30'}`}
                    >
                      <div 
                        className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${
                          isCurrent ? 'ring-4 ring-primary/30' : ''
                        }`}
                        style={{ 
                          borderColor: info.color,
                          background: isCurrentOrPast ? `${info.color}20` : 'transparent'
                        }}
                      >
                        <span 
                          className="text-xl font-bold"
                          style={{ color: info.color }}
                        >
                          {rank}
                        </span>
                      </div>
                      <p className="text-xs text-center mt-2 text-gray-500">{info.title}</p>
                      {isCurrent && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary"
                        />
                      )}
                    </motion.div>
                    {idx < ranks.length - 1 && (
                      <div 
                        className={`flex-1 h-1 mx-2 rounded ${
                          ranks.indexOf(user?.rank || 'E') > idx 
                            ? 'bg-gradient-to-r from-primary to-cyan-500' 
                            : 'bg-gray-800'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          
          <div className="flex justify-center mt-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary px-8 py-3 rounded-xl font-bold"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankUp;
