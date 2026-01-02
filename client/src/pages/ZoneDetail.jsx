import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { problemAPI } from '../services/api';
import { toast } from 'react-toastify';

const ZoneDetail = () => {
  const { zoneId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState(null);
  
  const zoneConfig = {
    'arrays': {
      name: 'Array Plains',
      icon: 'grid_view',
      color: '#22C55E',
      description: 'Master the fundamentals of array manipulation',
      bgGradient: 'from-green-600/20 via-green-500/10 to-transparent',
      bossName: 'THE DUPLICATE HUNTER'
    },
    'stacks': {
      name: 'Stack Citadel',
      icon: 'layers',
      color: '#3B82F6',
      description: 'Conquer LIFO data structures',
      bgGradient: 'from-blue-600/20 via-blue-500/10 to-transparent',
      bossName: 'THE PARENTHESIS WARDEN'
    },
    'recursion': {
      name: 'Recursion Depths',
      icon: 'all_inclusive',
      color: '#A855F7',
      description: 'The infinite abyss where problems solve themselves',
      bgGradient: 'from-purple-600/20 via-purple-500/10 to-transparent',
      bossName: 'THE INFINITE MIRROR'
    },
    'binary-trees': {
      name: 'Tree Sanctuary',
      icon: 'account_tree',
      color: '#06B6D4',
      description: 'Navigate hierarchical structures',
      bgGradient: 'from-cyan-600/20 via-cyan-500/10 to-transparent',
      bossName: 'THE ROOT KEEPER'
    }
  };
  
  const zone = zoneConfig[zoneId] || zoneConfig['arrays'];
  
  useEffect(() => {
    const loadProblems = async () => {
      setLoading(true);
      try {
        const res = await problemAPI.getByZone(zoneId);
        const data = res.data?.data?.problems || res.data?.problems || res.data?.data || [];
        setProblems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load problems:', error);
        toast.error('[SYSTEM] Failed to load zone problems');
        setProblems([]);
      }
      setLoading(false);
    };
    
    if (zoneId) {
      loadProblems();
    }
  }, [zoneId]);
  
  const getDifficultyColor = (difficulty) => {
    const colors = {
      'tutorial': 'text-gray-400 bg-gray-500/20',
      'easy': 'text-green-400 bg-green-500/20',
      'medium': 'text-yellow-400 bg-yellow-500/20',
      'hard': 'text-red-400 bg-red-500/20'
    };
    return colors[difficulty?.toLowerCase()] || colors.easy;
  };
  
  const handleProblemClick = (problem) => {
    // Navigate to visualization phase first
    navigate(`/visual/${problem.slug || problem._id}`);
  };
  
  const totalProblems = problems.length;
  const solvedProblems = problems.filter(p => p.solved).length;
  const progressPercent = totalProblems > 0 ? (solvedProblems / totalProblems) * 100 : 0;
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-2 border-primary border-t-transparent rounded-full mx-auto"
          />
          <p className="text-gray-500 mt-6 font-mono text-sm">[SYSTEM] Loading zone data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-6 pb-20">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass-panel-strong rounded-2xl p-8 mb-8 relative overflow-hidden bg-gradient-to-br ${zone.bgGradient}`}
        >
          {/* Background Glow */}
          <div 
            className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-30"
            style={{ background: zone.color }}
          />
          
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/zones')}
                className="w-12 h-12 rounded-xl glass-panel flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <span className="material-symbols-outlined text-primary">arrow_back</span>
              </button>
              
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center border-2"
                style={{ borderColor: zone.color, background: `${zone.color}20` }}
              >
                <span className="material-symbols-outlined text-4xl" style={{ color: zone.color }}>
                  {zone.icon}
                </span>
              </div>
              
              <div>
                <h1 className="text-3xl font-bold mb-2">{zone.name}</h1>
                <p className="text-gray-400">{zone.description}</p>
              </div>
            </div>
            
            {/* Progress */}
            <div className="text-right">
              <p className="text-sm text-gray-400 mb-2">Zone Progress</p>
              <p className="text-2xl font-bold" style={{ color: zone.color }}>
                {solvedProblems}/{totalProblems}
              </p>
              <div className="w-32 h-2 bg-void rounded-full mt-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className="h-full rounded-full"
                  style={{ background: zone.color }}
                />
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Problems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.length > 0 ? (
            problems.map((problem, idx) => (
              <motion.div
                key={problem._id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => handleProblemClick(problem)}
                className={`
                  glass-panel rounded-xl p-6 cursor-pointer transition-all
                  hover:border-primary/50 hover:shadow-neon
                  ${problem.solved ? 'border-green-500/30' : 'border-gray-800'}
                `}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        problem.solved ? 'bg-green-500/20' : 'bg-void'
                      }`}
                    >
                      <span className={`material-symbols-outlined ${
                        problem.solved ? 'text-green-400' : 'text-gray-600'
                      }`}>
                        {problem.solved ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty || 'Easy'}
                    </span>
                  </div>
                  
                  {problem.isBossBattle && (
                    <span className="material-symbols-outlined text-red-400">skull</span>
                  )}
                </div>
                
                <h3 className="text-lg font-bold mb-2">{problem.title}</h3>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">star</span>
                    <span className="text-sm text-primary">+{problem.xpReward || 50} XP</span>
                  </div>
                  
                  <span className={`text-xs px-2 py-1 rounded ${
                    problem.rank === 'E' ? 'bg-gray-500/20 text-gray-400' :
                    problem.rank === 'D' ? 'bg-green-500/20 text-green-400' :
                    problem.rank === 'C' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-primary/20 text-primary'
                  }`}>
                    {problem.rank || 'E'}-Rank
                  </span>
                </div>
                
                {/* Phases Available */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-800">
                  <span className="text-xs text-gray-500">Phases:</span>
                  {(problem.availableInPhases || ['visualization', 'guided', 'autonomous']).map((phase, i) => (
                    <span 
                      key={i}
                      className="w-6 h-6 rounded flex items-center justify-center bg-void border border-gray-700"
                      title={phase}
                    >
                      <span className="material-symbols-outlined text-xs text-gray-400">
                        {phase === 'visualization' ? 'visibility' :
                         phase === 'guided' ? 'school' : 'code'}
                      </span>
                    </span>
                  ))}
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-16"
            >
              <span className="material-symbols-outlined text-6xl text-gray-700 mb-4">folder_off</span>
              <h3 className="text-xl font-bold text-gray-500 mb-2">No Problems Found</h3>
              <p className="text-gray-600">This zone doesn't have any problems yet.</p>
            </motion.div>
          )}
        </div>
        
        {/* Boss Battle Section */}
        {problems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <div className="glass-panel rounded-xl p-6 border border-red-500/20 bg-gradient-to-br from-red-500/10 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
                    <span className="material-symbols-outlined text-3xl text-red-400">skull</span>
                  </div>
                  <div>
                    <p className="text-xs text-red-400 font-mono mb-1">ZONE BOSS</p>
                    <h3 className="text-xl font-bold text-red-400">{zone.bossName}</h3>
                    <p className="text-sm text-gray-500">
                      {progressPercent >= 80 
                        ? 'Boss is ready for challenge!' 
                        : `Complete ${Math.ceil(totalProblems * 0.8)} problems to unlock`}
                    </p>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: progressPercent >= 80 ? 1.05 : 1 }}
                  whileTap={{ scale: progressPercent >= 80 ? 0.95 : 1 }}
                  onClick={() => progressPercent >= 80 && navigate(`/boss/${zoneId}`)}
                  disabled={progressPercent < 80}
                  className={`
                    px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all
                    ${progressPercent >= 80 
                      ? 'bg-red-500 hover:bg-red-600 text-white cursor-pointer' 
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'}
                  `}
                >
                  <span className="material-symbols-outlined">swords</span>
                  {progressPercent >= 80 ? 'Challenge Boss' : 'Locked'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ZoneDetail;
