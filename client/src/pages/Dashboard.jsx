import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useProgressStore } from '../store/progressStore';
import { userAPI } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, getXPProgress } = useAuthStore();
  const { fetchAllProgress } = useProgressStore();
  const [dailyQuests, setDailyQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [systemMessages, setSystemMessages] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [activeTab, setActiveTab] = useState('overview');
  
  const generateDefaultQuests = useCallback(() => [
    { id: 1, description: 'Complete 1 visualization phase', xpReward: 20, completed: false, progress: 0, target: 1 },
    { id: 2, description: 'Solve 2 problems in any zone', xpReward: 50, completed: false, progress: 0, target: 2 },
    { id: 3, description: 'Make 5 correct predictions', xpReward: 30, completed: false, progress: 0, target: 5 },
  ], []);
  
  const generateSystemMessages = useCallback(() => {
    const messages = [];
    const rank = user?.rank || 'E';
    
    if (rank === 'E') {
      messages.push({ type: 'notice', text: 'You are an E-Rank Hunter. Prove your worth in the Array Plains.' });
    }
    if ((user?.totalProblemsSolved || 0) === 0) {
      messages.push({ type: 'warning', text: 'No dungeons cleared. Begin your training immediately.' });
    }
    if ((user?.currentStreak || 0) >= 3) {
      messages.push({ type: 'success', text: `${user.currentStreak} day streak active. The System is impressed.` });
    }
    
    setSystemMessages(messages);
  }, [user]);
  
  useEffect(() => {
    const loadData = async () => {
      await fetchAllProgress();
      try {
        const res = await userAPI.getDailyQuests();
        const data = res.data?.data || res.data;
        setDailyQuests(data?.quests || generateDefaultQuests());
      } catch (e) {
        setDailyQuests(generateDefaultQuests());
      }
      generateSystemMessages();
      setLoading(false);
    };
    loadData();
  }, [fetchAllProgress, generateDefaultQuests, generateSystemMessages]);
  
  const getRankConfig = (rank) => {
    const configs = {
      'E': { color: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500', name: 'E-Rank', desc: 'Unawakened' },
      'D': { color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500', name: 'D-Rank', desc: 'Awakened' },
      'C': { color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500', name: 'C-Rank', desc: 'Skilled' },
      'B': { color: 'text-primary', bg: 'bg-primary/20', border: 'border-primary', name: 'B-Rank', desc: 'Elite' },
      'A': { color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500', name: 'A-Rank', desc: 'Champion' },
      'S': { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500', name: 'S-Rank', desc: 'Monarch' },
    };
    return configs[rank] || configs['E'];
  };
  
  const zones = [
    { 
      id: 'arrays', 
      name: 'Array Plains', 
      icon: 'grid_view', 
      description: 'Master the fundamentals of array manipulation',
      unlocked: true,
      difficulty: 'E-Rank',
      problems: 5,
      color: 'from-green-500/20 to-green-600/10'
    },
    { 
      id: 'stacks', 
      name: 'Stack Citadel', 
      icon: 'layers', 
      description: 'Conquer LIFO data structures',
      unlocked: user?.zonesUnlocked?.includes('stacks') || user?.rank !== 'E',
      difficulty: 'D-Rank',
      problems: 5,
      color: 'from-blue-500/20 to-blue-600/10'
    },
    { 
      id: 'recursion', 
      name: 'Recursion Depths', 
      icon: 'all_inclusive', 
      description: 'Understand the power of self-reference',
      unlocked: user?.zonesUnlocked?.includes('recursion') || ['C', 'B', 'A', 'S'].includes(user?.rank),
      difficulty: 'C-Rank',
      problems: 5,
      color: 'from-purple-500/20 to-purple-600/10'
    },
    { 
      id: 'binary-trees', 
      name: 'Tree Sanctuary', 
      icon: 'account_tree', 
      description: 'Navigate hierarchical structures',
      unlocked: user?.zonesUnlocked?.includes('binary-trees') || ['C', 'B', 'A', 'S'].includes(user?.rank),
      difficulty: 'C-Rank',
      problems: 5,
      color: 'from-cyan-500/20 to-cyan-600/10'
    },
  ];
  
  const statIcons = {
    strength: { icon: 'fitness_center', color: 'text-red-400', label: 'STR' },
    intelligence: { icon: 'psychology', color: 'text-blue-400', label: 'INT' },
    agility: { icon: 'bolt', color: 'text-yellow-400', label: 'AGI' },
    endurance: { icon: 'favorite', color: 'text-green-400', label: 'END' },
    sense: { icon: 'visibility', color: 'text-primary', label: 'SEN' },
  };
  
  const xpProgress = getXPProgress();
  const rankConfig = getRankConfig(user?.rank || 'E');
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-2 border-2 border-primary/50 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-primary animate-pulse">diamond</span>
            </div>
          </div>
          <p className="text-gray-500 mt-6 font-mono text-sm">[SYSTEM] Loading Hunter data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-6 pb-20">
      <div className="max-w-[1600px] mx-auto">
        {/* System Messages */}
        <AnimatePresence>
          {systemMessages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 space-y-2"
            >
              {systemMessages.map((msg, idx) => (
                <div 
                  key={idx}
                  className={`
                    p-3 rounded-lg flex items-center gap-3
                    ${msg.type === 'notice' ? 'system-notice' : ''}
                    ${msg.type === 'warning' ? 'system-warning' : ''}
                    ${msg.type === 'success' ? 'bg-green-500/10 border-l-4 border-green-500' : ''}
                  `}
                >
                  <span className="material-symbols-outlined text-lg">
                    {msg.type === 'notice' && 'info'}
                    {msg.type === 'warning' && 'warning'}
                    {msg.type === 'success' && 'check_circle'}
                  </span>
                  <span className="text-sm font-mono">[SYSTEM] {msg.text}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Hunter Profile */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Rank Card */}
            <div className="glass-panel-strong rounded-2xl p-6 relative overflow-hidden">
              {/* Background Glow */}
              <div className={`absolute -top-20 -right-20 w-40 h-40 ${rankConfig.bg} rounded-full blur-3xl opacity-50`} />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">Hunter Rank</span>
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-16 h-16 rounded-xl flex items-center justify-center ${rankConfig.bg} ${rankConfig.border} border-2 shadow-lg`}
                  >
                    <span className={`text-3xl font-bold ${rankConfig.color}`}>
                      {user?.rank || 'E'}
                    </span>
                  </motion.div>
                </div>
                
                <h2 className="text-xl font-bold mb-1">{user?.hunterName}</h2>
                <p className={`text-sm ${rankConfig.color}`}>{rankConfig.name} • {rankConfig.desc}</p>
                
                {/* Level & XP */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Level {user?.level || 1}</span>
                    <span className="text-sm text-primary">{user?.currentXP || 0} / {user?.xpForNextLevel || 100} XP</span>
                  </div>
                  <div className="h-3 bg-void rounded-full overflow-hidden border border-primary/20">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full xp-bar progress-stripe"
                    />
                  </div>
                </div>
                
                {/* Gold */}
                <div className="mt-4 flex items-center justify-between p-3 bg-void/50 rounded-lg border border-yellow-500/20">
                  <span className="text-yellow-400 flex items-center gap-2">
                    <span className="material-symbols-outlined">paid</span>
                    Gold
                  </span>
                  <span className="font-bold text-yellow-400">{user?.gold || 0}</span>
                </div>
              </div>
            </div>
            
            {/* Stats Panel */}
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="text-sm text-gray-500 font-mono mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">analytics</span>
                HUNTER STATS
              </h3>
              <div className="space-y-4">
                {user?.stats && Object.entries(user.stats).map(([stat, value]) => (
                  <div key={stat} className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-void flex items-center justify-center border border-gray-800`}>
                      <span className={`material-symbols-outlined ${statIcons[stat]?.color || 'text-gray-400'}`}>
                        {statIcons[stat]?.icon || 'star'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400 uppercase text-xs">{statIcons[stat]?.label || stat}</span>
                        <span className="text-white font-bold">{value}</span>
                      </div>
                      <div className="stat-bar">
                        <div className="stat-bar-fill" style={{ width: `${Math.min((value / 100) * 100, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Daily Quests */}
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm text-gray-500 font-mono flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">task_alt</span>
                  DAILY QUESTS
                </h3>
                <span className="text-xs text-primary">
                  {dailyQuests.filter(q => q.completed).length}/{dailyQuests.length}
                </span>
              </div>
              <div className="space-y-3">
                {dailyQuests.map((quest) => (
                  <div 
                    key={quest.id}
                    className={`p-3 rounded-lg border transition-all ${
                      quest.completed 
                        ? 'border-green-500/30 bg-green-500/5' 
                        : 'border-gray-800 bg-void/50 hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`material-symbols-outlined mt-0.5 ${
                        quest.completed ? 'text-green-400' : 'text-gray-600'
                      }`}>
                        {quest.completed ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <div className="flex-1">
                        <p className={`text-sm ${quest.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                          {quest.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-primary">+{quest.xpReward} XP</span>
                          {!quest.completed && quest.target > 1 && (
                            <span className="text-xs text-gray-500">
                              {quest.progress || 0}/{quest.target}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          
          {/* Main Content Area */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 space-y-6"
          >
            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickStat 
                icon="military_tech" 
                label="Problems Solved" 
                value={user?.totalProblemsSolved || 0} 
                color="text-primary"
              />
              <QuickStat 
                icon="local_fire_department" 
                label="Current Streak" 
                value={`${user?.currentStreak || 0} days`} 
                color="text-orange-400"
              />
              <QuickStat 
                icon="psychology" 
                label="Predictions" 
                value={`${user?.dailyQuests?.predictionsCorrect || 0}`} 
                color="text-cyan-400"
              />
              <QuickStat 
                icon="trending_up" 
                label="Accuracy" 
                value={`${Math.round((user?.dailyQuests?.predictionsCorrect || 0) / Math.max((user?.totalProblemsAttempted || 1), 1) * 100)}%`} 
                color="text-green-400"
              />
            </div>
            
            {/* Zone Map Section */}
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">map</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Dungeon Zones</h2>
                    <p className="text-xs text-gray-500">Select a zone to begin training</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/zones')}
                  className="btn-system px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">fullscreen</span>
                  Full Map
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {zones.map((zone, idx) => (
                  <motion.div
                    key={zone.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.1 }}
                    onClick={() => zone.unlocked && navigate(`/zone/${zone.id}`)}
                    className={`
                      relative p-5 rounded-xl border transition-all cursor-pointer
                      ${zone.unlocked 
                        ? 'dungeon-card hover:shadow-neon' 
                        : 'dungeon-card-locked border-gray-800 cursor-not-allowed'
                      }
                    `}
                  >
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${zone.color} opacity-50`} />
                    
                    <div className="relative">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-lg bg-void/80 flex items-center justify-center border border-gray-700">
                          <span className={`material-symbols-outlined text-2xl ${zone.unlocked ? 'text-primary' : 'text-gray-600'}`}>
                            {zone.icon}
                          </span>
                        </div>
                        {!zone.unlocked && (
                          <span className="material-symbols-outlined text-gray-600">lock</span>
                        )}
                      </div>
                      
                      <h3 className={`font-bold mb-1 ${zone.unlocked ? 'text-white' : 'text-gray-500'}`}>
                        {zone.name}
                      </h3>
                      <p className={`text-xs mb-3 ${zone.unlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                        {zone.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded ${
                          zone.unlocked 
                            ? 'bg-primary/20 text-primary' 
                            : 'bg-gray-800 text-gray-500'
                        }`}>
                          {zone.difficulty}
                        </span>
                        <span className="text-xs text-gray-500">
                          {zone.problems} problems
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Recent Activity & Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="glass-panel rounded-2xl p-6">
                <h3 className="text-sm text-gray-500 font-mono mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">history</span>
                  RECENT ACTIVITY
                </h3>
                <div className="space-y-3">
                  {(user?.recentActivity || [
                    { action: 'Joined the System', time: 'Just now', icon: 'person_add' }
                  ]).slice(0, 5).map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-void/50 rounded-lg">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-sm">
                          {activity.icon || 'task_alt'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-300">{activity.action}</p>
                        <p className="text-xs text-gray-600">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Unlocked Skills */}
              <div className="glass-panel rounded-2xl p-6">
                <h3 className="text-sm text-gray-500 font-mono mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                  UNLOCKED SKILLS
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {(user?.skills || []).length > 0 ? (
                    user.skills.map((skill, idx) => (
                      <div 
                        key={idx}
                        className="skill-icon flex-col gap-1"
                        title={skill.description}
                      >
                        <span className="material-symbols-outlined text-primary">
                          {skill.icon || 'star'}
                        </span>
                        <span className="text-[10px] text-gray-500">{skill.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-8">
                      <span className="material-symbols-outlined text-4xl text-gray-700 mb-2">lock</span>
                      <p className="text-sm text-gray-600">Complete dungeons to unlock skills</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Quick Stat Component
const QuickStat = ({ icon, label, value, color }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className="glass-panel rounded-xl p-4"
  >
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg bg-void flex items-center justify-center border border-gray-800`}>
        <span className={`material-symbols-outlined ${color}`}>{icon}</span>
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`text-lg font-bold ${color}`}>{value}</p>
      </div>
    </div>
  </motion.div>
);

export default Dashboard;
