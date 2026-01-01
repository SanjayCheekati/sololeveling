import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProgressStore } from '../store/progressStore';
import { useAuthStore } from '../store/authStore';

const ZoneMap = () => {
  const navigate = useNavigate();
  const { zone: zoneParam } = useParams();
  const { user } = useAuthStore();
  const { fetchProblems, fetchProgress, progress, zones } = useProgressStore();
  
  const [activeZone, setActiveZone] = useState(zoneParam || 'arrays');
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadZoneData = async () => {
      setLoading(true);
      const [zoneProblems, zoneProgress] = await Promise.all([
        fetchProblems(activeZone),
        fetchProgress(activeZone)
      ]);
      setProblems(zoneProblems || []);
      setLoading(false);
    };
    loadZoneData();
  }, [activeZone, fetchProblems, fetchProgress]);
  
  const zoneProgress = progress[activeZone];
  const solvedProblemIds = zoneProgress?.solvedProblems || [];
  
  const getProblemStatus = (problem) => {
    if (solvedProblemIds.includes(problem._id)) return 'completed';
    
    // Check current progress phase
    const problemProgress = zoneProgress?.currentPhase?.[problem._id];
    if (problemProgress) {
      if (problemProgress === 'visual') return 'visual';
      if (problemProgress === 'guided') return 'guided';
      if (problemProgress === 'autonomous') return 'autonomous';
    }
    
    // Check if problem is available based on index
    const problemIndex = problems.findIndex(p => p._id === problem._id);
    const completedCount = solvedProblemIds.length;
    
    if (problemIndex <= completedCount) return 'available';
    return 'locked';
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return { icon: 'check_circle', color: 'text-green-400' };
      case 'visual': return { icon: 'visibility', color: 'text-blue-400' };
      case 'guided': return { icon: 'school', color: 'text-purple-400' };
      case 'autonomous': return { icon: 'code', color: 'text-orange-400' };
      case 'available': return { icon: 'play_circle', color: 'text-primary' };
      default: return { icon: 'lock', color: 'text-gray-600' };
    }
  };
  
  const handleProblemClick = (problem) => {
    const status = getProblemStatus(problem);
    
    if (status === 'locked') return;
    
    // Navigate based on current phase
    if (status === 'completed') {
      // Allow revisiting any phase
      navigate(`/learn/${problem.slug}`);
    } else if (status === 'available' || status === 'visual') {
      navigate(`/learn/${problem.slug}`);
    } else if (status === 'guided') {
      navigate(`/guided/${problem.slug}`);
    } else if (status === 'autonomous') {
      navigate(`/solve/${problem.slug}`);
    }
  };
  
  const difficultyColors = {
    'E': 'border-gray-500 text-gray-400',
    'D': 'border-green-500 text-green-400',
    'C': 'border-blue-500 text-blue-400',
    'B': 'border-purple-500 text-purple-400',
    'A': 'border-orange-500 text-orange-400',
    'S': 'border-red-500 text-red-400'
  };
  
  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex justify-between items-center mb-8"
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Dashboard</span>
        </button>
        
        <div className="text-right">
          <h1 className="text-xl font-bold">
            <span className="text-primary">{zones[activeZone]?.name}</span>
          </h1>
          <p className="text-xs text-gray-500 font-mono">[SYSTEM] Select a mission</p>
        </div>
      </motion.header>
      
      {/* Zone Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {Object.entries(zones).map(([key, zone]) => {
          const isLocked = !zone.unlocked;
          const isActive = activeZone === key;
          
          return (
            <button
              key={key}
              onClick={() => !isLocked && setActiveZone(key)}
              disabled={isLocked}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary text-black font-bold'
                  : isLocked
                    ? 'glass-panel text-gray-600 cursor-not-allowed'
                    : 'glass-panel text-gray-400 hover:text-white hover:border-primary/30'
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {isLocked ? 'lock' : zone.icon}
              </span>
              {zone.name}
            </button>
          );
        })}
      </div>
      
      {/* Problems Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <span className="material-symbols-outlined text-5xl text-primary animate-pulse">
              radar
            </span>
            <p className="text-gray-500 mt-4 font-mono">[SYSTEM] Scanning dungeon...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map((problem, idx) => {
            const status = getProblemStatus(problem);
            const statusInfo = getStatusIcon(status);
            const isLocked = status === 'locked';
            
            return (
              <motion.div
                key={problem._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleProblemClick(problem)}
                className={`glass-panel p-5 rounded-xl transition-all ${
                  isLocked
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer hover:border-primary/50 hover:shadow-neon'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      status === 'completed' ? 'bg-green-500/20' : 'bg-primary/10'
                    }`}>
                      <span className={`material-symbols-outlined ${statusInfo.color}`}>
                        {statusInfo.icon}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 font-mono">#{idx + 1}</span>
                      <h3 className="font-bold text-sm">{problem.title}</h3>
                    </div>
                  </div>
                  
                  {/* Difficulty Badge */}
                  <span className={`text-xs px-2 py-1 rounded border ${difficultyColors[problem.difficulty]}`}>
                    {problem.difficulty}-Rank
                  </span>
                </div>
                
                {/* Description */}
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                  {problem.description}
                </p>
                
                {/* Footer */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">star</span>
                      {problem.rewards?.xp || 50} XP
                    </span>
                    <span className="flex items-center gap-1 text-yellow-400">
                      <span className="material-symbols-outlined text-sm">paid</span>
                      {problem.rewards?.gold || 10}
                    </span>
                  </div>
                  
                  {!isLocked && (
                    <span className={`flex items-center gap-1 ${statusInfo.color}`}>
                      {status === 'completed' ? 'Replay' : 'Start'}
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </span>
                  )}
                </div>
                
                {/* Phase Indicators */}
                {!isLocked && status !== 'completed' && (
                  <div className="mt-3 pt-3 border-t border-gray-800">
                    <div className="flex gap-2">
                      {['visual', 'guided', 'autonomous'].map((phase) => {
                        const isActive = status === phase;
                        const isComplete = 
                          (phase === 'visual' && ['guided', 'autonomous', 'completed'].includes(status)) ||
                          (phase === 'guided' && ['autonomous', 'completed'].includes(status)) ||
                          (phase === 'autonomous' && status === 'completed');
                        
                        return (
                          <div
                            key={phase}
                            className={`flex-1 h-1 rounded-full ${
                              isComplete
                                ? 'bg-green-500'
                                : isActive
                                  ? 'bg-primary'
                                  : 'bg-gray-700'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-gray-600">Visual</span>
                      <span className="text-[10px] text-gray-600">Guided</span>
                      <span className="text-[10px] text-gray-600">Auto</span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
      
      {/* Zone Boss (if all problems completed) */}
      {!loading && solvedProblemIds.length === problems.length && problems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 glass-panel p-8 rounded-xl border-2 border-red-500/50 text-center"
        >
          <span className="material-symbols-outlined text-6xl text-red-400 mb-4">
            skull
          </span>
          <h2 className="text-2xl font-bold text-red-400 mb-2">ZONE BOSS UNLOCKED</h2>
          <p className="text-gray-400 mb-6">
            Defeat the boss to rank up and unlock the next zone!
          </p>
          <button
            onClick={() => navigate(`/boss/${activeZone}-boss`)}
            className="px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-red-500/30 transition-all"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined">swords</span>
              CHALLENGE BOSS
            </span>
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default ZoneMap;
