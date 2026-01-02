import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { problemAPI } from '../services/api';

const ZoneMap = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedZone, setSelectedZone] = useState(null);
  const [zoneProblems, setZoneProblems] = useState({});
  const [loading, setLoading] = useState(true);
  const [hoveredZone, setHoveredZone] = useState(null);
  
  const zones = [
    {
      id: 'arrays',
      name: 'Array Plains',
      icon: 'grid_view',
      description: 'The foundational training grounds. Master index manipulation and linear traversal.',
      difficulty: 'E-Rank',
      color: '#22C55E',
      bgGradient: 'from-green-600/30 via-green-500/20 to-transparent',
      borderColor: 'border-green-500',
      unlocked: true,
      position: { x: '15%', y: '60%' },
      concepts: ['Two Pointers', 'Sliding Window', 'Prefix Sum', 'Kadane\'s Algorithm'],
      bossName: 'THE DUPLICATE HUNTER',
      lore: 'A vast expanse where data flows in ordered sequences. Many hunters begin their journey here.'
    },
    {
      id: 'stacks',
      name: 'Stack Citadel',
      icon: 'layers',
      description: 'A towering fortress of LIFO principles. Push your limits or be popped.',
      difficulty: 'D-Rank',
      color: '#3B82F6',
      bgGradient: 'from-blue-600/30 via-blue-500/20 to-transparent',
      borderColor: 'border-blue-500',
      unlocked: user?.zonesUnlocked?.includes('stacks') || user?.rank !== 'E',
      position: { x: '35%', y: '30%' },
      concepts: ['Valid Parentheses', 'Monotonic Stack', 'Next Greater Element', 'Min Stack'],
      bossName: 'THE PARENTHESIS WARDEN',
      lore: 'An ancient citadel where balance is law. Only those who understand the last-in-first-out can survive.'
    },
    {
      id: 'recursion',
      name: 'Recursion Depths',
      icon: 'all_inclusive',
      description: 'The infinite abyss where problems solve themselves... eventually.',
      difficulty: 'C-Rank',
      color: '#A855F7',
      bgGradient: 'from-purple-600/30 via-purple-500/20 to-transparent',
      borderColor: 'border-purple-500',
      unlocked: user?.zonesUnlocked?.includes('recursion') || ['C', 'B', 'A', 'S'].includes(user?.rank),
      position: { x: '70%', y: '25%' },
      concepts: ['Base Cases', 'Divide & Conquer', 'Memoization', 'Backtracking'],
      bossName: 'THE INFINITE MIRROR',
      lore: 'A dimension that folds upon itself. To understand it, you must first understand it.'
    },
    {
      id: 'binary-trees',
      name: 'Tree Sanctuary',
      icon: 'account_tree',
      description: 'The sacred grove of hierarchical wisdom. Navigate branches to find enlightenment.',
      difficulty: 'C-Rank',
      color: '#06B6D4',
      bgGradient: 'from-cyan-600/30 via-cyan-500/20 to-transparent',
      borderColor: 'border-cyan-500',
      unlocked: user?.zonesUnlocked?.includes('binary-trees') || ['C', 'B', 'A', 'S'].includes(user?.rank),
      position: { x: '80%', y: '55%' },
      concepts: ['DFS Traversals', 'BFS', 'Tree Properties', 'Path Problems'],
      bossName: 'THE ROOT KEEPER',
      lore: 'An ancient forest where each tree holds countless secrets. The path is never straight.'
    },
    {
      id: 'graphs',
      name: 'Graph Labyrinth',
      icon: 'hub',
      description: 'Coming Soon - A maze of connections where every node tells a story.',
      difficulty: 'B-Rank',
      color: '#F97316',
      bgGradient: 'from-orange-600/30 via-orange-500/20 to-transparent',
      borderColor: 'border-orange-500',
      unlocked: false,
      position: { x: '55%', y: '70%' },
      concepts: ['BFS/DFS', 'Shortest Path', 'Topological Sort', 'Union Find'],
      bossName: '???',
      lore: 'Locked. Requires B-Rank clearance.'
    },
    {
      id: 'dp',
      name: 'DP Dimension',
      icon: 'table_chart',
      description: 'Coming Soon - The realm of optimal substructure and overlapping problems.',
      difficulty: 'A-Rank',
      color: '#EF4444',
      bgGradient: 'from-red-600/30 via-red-500/20 to-transparent',
      borderColor: 'border-red-500',
      unlocked: false,
      position: { x: '50%', y: '15%' },
      concepts: ['1D DP', '2D DP', 'State Compression', 'Optimization'],
      bossName: '???',
      lore: 'Locked. Only the strongest may enter.'
    }
  ];
  
  useEffect(() => {
    const loadProblems = async () => {
      try {
        const categories = ['arrays', 'stacks', 'recursion', 'binary-trees'];
        const problemData = {};
        
        for (const cat of categories) {
          try {
            const res = await problemAPI.getByZone(cat);
            const problems = res.data?.data?.problems || res.data?.problems || res.data?.data || [];
            problemData[cat] = Array.isArray(problems) ? problems : [];
          } catch (e) {
            problemData[cat] = [];
          }
        }
        setZoneProblems(problemData);
      } catch (e) {
        console.error('Failed to load problems:', e);
      }
      setLoading(false);
    };
    loadProblems();
  }, []);
  
  const getZoneProgress = (zoneId) => {
    const problems = zoneProblems[zoneId] || [];
    const solved = problems.filter(p => p.solved || user?.problemsSolved?.includes(p._id)).length;
    return { solved, total: problems.length };
  };
  
  const ZoneNode = ({ zone, index }) => {
    const progress = getZoneProgress(zone.id);
    const isHovered = hoveredZone === zone.id;
    const isSelected = selectedZone?.id === zone.id;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 + index * 0.15, type: 'spring' }}
        style={{ 
          position: 'absolute', 
          left: zone.position.x, 
          top: zone.position.y,
          transform: 'translate(-50%, -50%)'
        }}
        className="z-10"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          onMouseEnter={() => setHoveredZone(zone.id)}
          onMouseLeave={() => setHoveredZone(null)}
          onClick={() => zone.unlocked && setSelectedZone(zone)}
          className={`
            relative cursor-pointer transition-all duration-300
            ${!zone.unlocked && 'opacity-40 cursor-not-allowed'}
          `}
        >
          {/* Glow Ring */}
          <motion.div
            animate={{
              scale: isHovered ? [1, 1.2, 1] : 1,
              opacity: isHovered ? [0.5, 0.8, 0.5] : 0.3
            }}
            transition={{ duration: 2, repeat: isHovered ? Infinity : 0 }}
            className={`absolute -inset-4 rounded-full blur-xl`}
            style={{ background: zone.color, opacity: 0.3 }}
          />
          
          {/* Main Node */}
          <div 
            className={`
              zone-portal w-20 h-20 rounded-full flex items-center justify-center
              ${zone.borderColor} border-2 relative
              ${isSelected ? 'ring-4 ring-primary/50' : ''}
            `}
            style={{ boxShadow: `0 0 30px ${zone.color}40` }}
          >
            {/* Icon */}
            <span 
              className="material-symbols-outlined text-3xl"
              style={{ color: zone.color }}
            >
              {zone.unlocked ? zone.icon : 'lock'}
            </span>
            
            {/* Progress Ring */}
            {zone.unlocked && progress.total > 0 && (
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke={`${zone.color}30`}
                  strokeWidth="3"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke={zone.color}
                  strokeWidth="3"
                  strokeDasharray={`${(progress.solved / progress.total) * 226} 226`}
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>
          
          {/* Zone Name */}
          <div className="text-center mt-3">
            <p className="text-sm font-bold text-white">{zone.name}</p>
            <p className="text-xs text-gray-500">{zone.difficulty}</p>
          </div>
        </motion.div>
      </motion.div>
    );
  };
  
  // Connection lines between zones
  const ConnectionLines = () => (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {/* Arrays to Stacks */}
      <motion.line 
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        x1="15%" y1="60%" x2="35%" y2="30%" 
        stroke="url(#lineGradient)" 
        strokeWidth="2"
        strokeDasharray="5,5"
      />
      {/* Stacks to Recursion */}
      <motion.line 
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 0.7 }}
        x1="35%" y1="30%" x2="70%" y2="25%" 
        stroke="url(#lineGradient)" 
        strokeWidth="2"
        strokeDasharray="5,5"
      />
      {/* Recursion to Trees */}
      <motion.line 
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 0.9 }}
        x1="70%" y1="25%" x2="80%" y2="55%" 
        stroke="url(#lineGradient)" 
        strokeWidth="2"
        strokeDasharray="5,5"
      />
      {/* Arrays to Graphs */}
      <motion.line 
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 1.1 }}
        x1="15%" y1="60%" x2="55%" y2="70%" 
        stroke="url(#lineGradient)" 
        strokeWidth="2"
        strokeDasharray="5,5"
        opacity="0.3"
      />
      {/* All to DP (faint) */}
      <motion.line 
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 1.3 }}
        x1="50%" y1="15%" x2="70%" y2="25%" 
        stroke="url(#lineGradient)" 
        strokeWidth="2"
        strokeDasharray="5,5"
        opacity="0.2"
      />
    </svg>
  );
  
  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 80% 70%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)`
        }} />
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, Math.random() * -200],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      {/* Header */}
      <div className="relative z-20 p-6">
        <div className="flex items-center justify-between max-w-[1800px] mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 rounded-lg glass-panel flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
              <span className="material-symbols-outlined text-primary">arrow_back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold">Dungeon World Map</h1>
              <p className="text-sm text-gray-500">Select a zone to begin training</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">location_on</span>
              <span className="text-sm text-gray-400">Current: <span className="text-white">{user?.currentZone || 'Array Plains'}</span></span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Map Area */}
      <div className="relative h-[calc(100vh-150px)] max-w-[1800px] mx-auto">
        <ConnectionLines />
        {zones.map((zone, index) => (
          <ZoneNode key={zone.id} zone={zone} index={index} />
        ))}
      </div>
      
      {/* Zone Detail Panel */}
      <AnimatePresence>
        {selectedZone && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 h-full w-[400px] glass-panel-strong border-l border-primary/20 z-30 overflow-y-auto"
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedZone(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-void flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
              <span className="material-symbols-outlined text-gray-400">close</span>
            </button>
            
            {/* Zone Header */}
            <div className={`p-6 bg-gradient-to-br ${selectedZone.bgGradient}`}>
              <div 
                className={`w-16 h-16 rounded-xl flex items-center justify-center ${selectedZone.borderColor} border-2 mb-4`}
                style={{ background: `${selectedZone.color}20` }}
              >
                <span className="material-symbols-outlined text-3xl" style={{ color: selectedZone.color }}>
                  {selectedZone.icon}
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-2">{selectedZone.name}</h2>
              <div className="flex items-center gap-3">
                <span 
                  className="px-2 py-1 rounded text-xs"
                  style={{ background: `${selectedZone.color}20`, color: selectedZone.color }}
                >
                  {selectedZone.difficulty}
                </span>
                <span className="text-sm text-gray-400">
                  {getZoneProgress(selectedZone.id).solved}/{getZoneProgress(selectedZone.id).total} Cleared
                </span>
              </div>
            </div>
            
            {/* Zone Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-xs text-gray-500 font-mono mb-2">ZONE INFO</h3>
                <p className="text-gray-400 text-sm">{selectedZone.description}</p>
              </div>
              
              {/* Lore */}
              <div className="p-4 bg-void/50 rounded-lg border border-gray-800 italic">
                <p className="text-xs text-gray-500">{selectedZone.lore}</p>
              </div>
              
              {/* Core Concepts */}
              <div>
                <h3 className="text-xs text-gray-500 font-mono mb-3">CORE CONCEPTS</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedZone.concepts.map((concept, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 rounded-full text-xs border border-gray-700 bg-void/50 text-gray-300"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Zone Boss */}
              <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-red-400">skull</span>
                  <span className="text-xs text-red-400 font-mono">ZONE BOSS</span>
                </div>
                <p className="text-lg font-bold text-red-400">{selectedZone.bossName}</p>
              </div>
              
              {/* Problems List */}
              {zoneProblems[selectedZone.id]?.length > 0 && (
                <div>
                  <h3 className="text-xs text-gray-500 font-mono mb-3">AVAILABLE DUNGEONS</h3>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                    {zoneProblems[selectedZone.id].map((problem, idx) => (
                      <div 
                        key={problem._id || idx}
                        className="p-3 rounded-lg bg-void/50 border border-gray-800 flex items-center justify-between hover:border-primary/30 transition-colors cursor-pointer"
                        onClick={() => navigate(`/visual/${problem._id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`material-symbols-outlined text-sm ${
                            problem.solved ? 'text-green-400' : 'text-gray-600'
                          }`}>
                            {problem.solved ? 'check_circle' : 'radio_button_unchecked'}
                          </span>
                          <span className="text-sm text-gray-300">{problem.title}</span>
                        </div>
                        <span className={`text-xs ${
                          problem.difficulty === 'Easy' ? 'text-green-400' :
                          problem.difficulty === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {problem.difficulty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Enter Zone Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/zone/${selectedZone.id}`)}
                className="w-full py-4 rounded-xl btn-primary font-bold flex items-center justify-center gap-3"
                style={{ 
                  background: `linear-gradient(135deg, ${selectedZone.color}, ${selectedZone.color}99)`,
                  boxShadow: `0 0 30px ${selectedZone.color}40`
                }}
              >
                <span className="material-symbols-outlined">door_open</span>
                ENTER ZONE
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Legend */}
      <div className="fixed bottom-6 left-6 glass-panel rounded-xl p-4 z-20">
        <h3 className="text-xs text-gray-500 font-mono mb-3">ZONE DIFFICULTY</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-gray-400">E-Rank</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs text-gray-400">D-Rank</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-xs text-gray-400">C-Rank</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-xs text-gray-400">B-Rank (Locked)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-gray-400">A-Rank (Locked)</span>
          </div>
        </div>
      </div>
      
      {loading && (
        <div className="fixed inset-0 bg-void/80 flex items-center justify-center z-50">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full mx-auto"
            />
            <p className="text-gray-500 mt-4 font-mono text-sm">[SYSTEM] Loading zone data...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoneMap;
