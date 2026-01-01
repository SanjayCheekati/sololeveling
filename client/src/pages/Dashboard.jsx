import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useProgressStore } from '../store/progressStore';
import { userAPI } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, getXPProgress, getRankColor } = useAuthStore();
  const { fetchAllProgress, progress, zones } = useProgressStore();
  const [dailyQuests, setDailyQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      await fetchAllProgress();
      try {
        const res = await userAPI.getDailyQuests();
        const data = res.data?.data || res.data;
        setDailyQuests(data?.quests || []);
      } catch (e) {
        console.error('Failed to fetch daily quests');
      }
      setLoading(false);
    };
    loadData();
  }, [fetchAllProgress]);
  
  const rankColors = {
    'E': 'text-gray-400 border-gray-500',
    'D': 'text-green-400 border-green-500',
    'C': 'text-blue-400 border-blue-500',
    'B': 'text-purple-400 border-purple-500',
    'A': 'text-orange-400 border-orange-500',
    'S': 'text-red-400 border-red-500'
  };
  
  const statIcons = {
    strength: 'fitness_center',
    intelligence: 'psychology',
    agility: 'bolt',
    endurance: 'favorite',
    sense: 'visibility'
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-primary animate-pulse">
            settings
          </span>
          <p className="text-gray-500 mt-4 font-mono">[SYSTEM] Loading Hunter data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Top Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex justify-between items-center mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 glass-panel rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">
              shield_person
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold">{user?.hunterName}</h1>
            <p className="text-xs text-gray-500 font-mono">[SYSTEM] Hunter Status: Active</p>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="glass-panel px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:border-primary/50 transition-all"
        >
          <span className="material-symbols-outlined text-sm align-middle mr-1">logout</span>
          Logout
        </button>
      </motion.header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Hunter Profile */}
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* Rank Card */}
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 font-mono">HUNTER RANK</span>
              <span className={`text-4xl font-bold ${rankColors[user?.rank || 'E']}`}>
                {user?.rank || 'E'}
              </span>
            </div>
            
            {/* Level */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Level {user?.level || 1}</span>
                <span className="text-primary">{user?.currentXP || 0} / {user?.xpForNextLevel || 100} XP</span>
              </div>
              <div className="h-3 bg-void rounded-full overflow-hidden border border-gray-700">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getXPProgress()}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary to-blue-400 progress-stripe"
                />
              </div>
            </div>
            
            {/* Gold */}
            <div className="flex items-center justify-between p-3 bg-void/50 rounded-lg">
              <span className="text-yellow-400 flex items-center gap-2">
                <span className="material-symbols-outlined">paid</span>
                Gold
              </span>
              <span className="font-bold text-yellow-400">{user?.gold || 0}</span>
            </div>
          </div>
          
          {/* Stats Panel */}
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-sm text-gray-500 font-mono mb-4">HUNTER STATS</h3>
            <div className="space-y-3">
              {user?.stats && Object.entries(user.stats).map(([stat, value]) => (
                <div key={stat} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">
                    {statIcons[stat]}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400 uppercase">{stat.slice(0, 3)}</span>
                      <span className="text-white font-bold">{value}</span>
                    </div>
                    <div className="h-1.5 bg-void rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary/50"
                        style={{ width: `${Math.min((value / 100) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Daily Quests */}
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-500 font-mono">DAILY QUESTS</h3>
              <span className="text-xs text-primary">{dailyQuests.filter(q => q.completed).length}/{dailyQuests.length}</span>
            </div>
            <div className="space-y-3">
              {dailyQuests.length > 0 ? dailyQuests.map((quest, idx) => (
                <div 
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    quest.completed 
                      ? 'border-green-500/30 bg-green-500/5' 
                      : 'border-gray-700 bg-void/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`material-symbols-outlined ${
                      quest.completed ? 'text-green-400' : 'text-gray-500'
                    }`}>
                      {quest.completed ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <div className="flex-1">
                      <p className={`text-sm ${quest.completed ? 'line-through text-gray-500' : ''}`}>
                        {quest.description}
                      </p>
                      <p className="text-xs text-primary mt-1">+{quest.xpReward} XP</p>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 text-sm text-center py-4">
                  No active quests
                </p>
              )}
            </div>
          </div>
        </motion.div>
        
        {/* Right Column - Zone Selection */}
        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Zone Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">DUNGEON ZONES</h2>
              <p className="text-gray-500 text-sm">Select a zone to begin your training</p>
            </div>
            <button
              onClick={() => navigate('/zones')}
              className="glass-panel px-4 py-2 rounded-lg text-sm text-primary hover:bg-primary/10 transition-all"
            >
              View All Zones
            </button>
          </div>
          
          {/* Zone Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(zones).map(([key, zone], idx) => {
              const zoneProgress = progress[key];
              const solved = zoneProgress?.solvedProblems?.length || 0;
              const total = zoneProgress?.totalProblems || 0;
              const isLocked = !zone.unlocked;
              
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  onClick={() => !isLocked && navigate(`/zone/${key}`)}
                  className={`glass-panel p-6 rounded-xl cursor-pointer transition-all ${
                    isLocked 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:border-primary/50 hover:shadow-neon'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isLocked ? 'bg-gray-800' : 'bg-primary/20'
                      }`}>
                        <span className={`material-symbols-outlined text-2xl ${
                          isLocked ? 'text-gray-600' : 'text-primary'
                        }`}>
                          {isLocked ? 'lock' : zone.icon}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold">{zone.name}</h3>
                        <p className="text-xs text-gray-500 capitalize">{key.replace('-', ' ')}</p>
                      </div>
                    </div>
                    
                    {!isLocked && (
                      <span className="text-xs text-gray-500">
                        {solved}/{total} cleared
                      </span>
                    )}
                  </div>
                  
                  {!isLocked && (
                    <>
                      {/* Progress Bar */}
                      <div className="h-2 bg-void rounded-full overflow-hidden mb-3">
                        <div 
                          className="h-full bg-primary/50"
                          style={{ width: `${total > 0 ? (solved / total) * 100 : 0}%` }}
                        />
                      </div>
                      
                      {/* Zone Stats */}
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Difficulty: E-{user?.rank || 'E'}</span>
                        <span className="text-primary flex items-center gap-1">
                          Enter Zone
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </span>
                      </div>
                    </>
                  )}
                  
                  {isLocked && (
                    <p className="text-xs text-gray-600 mt-2">
                      Clear previous zone to unlock
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-panel p-4 rounded-xl text-center">
              <span className="material-symbols-outlined text-3xl text-green-400 mb-2">
                check_circle
              </span>
              <p className="text-2xl font-bold">
                {Object.values(progress).reduce((sum, p) => sum + (p?.solvedProblems?.length || 0), 0)}
              </p>
              <p className="text-xs text-gray-500">Problems Solved</p>
            </div>
            
            <div className="glass-panel p-4 rounded-xl text-center">
              <span className="material-symbols-outlined text-3xl text-primary mb-2">
                local_fire_department
              </span>
              <p className="text-2xl font-bold">{user?.streak || 0}</p>
              <p className="text-xs text-gray-500">Day Streak</p>
            </div>
            
            <div className="glass-panel p-4 rounded-xl text-center">
              <span className="material-symbols-outlined text-3xl text-purple-400 mb-2">
                emoji_events
              </span>
              <p className="text-2xl font-bold">{user?.achievements?.length || 0}</p>
              <p className="text-xs text-gray-500">Achievements</p>
            </div>
          </div>
          
          {/* Tip Box */}
          <div className="glass-panel p-4 rounded-xl border-l-4 border-primary">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary">tips_and_updates</span>
              <div>
                <p className="text-sm text-gray-300">
                  <span className="text-primary font-bold">[TIP]</span> Complete all problems in a zone to unlock the Boss Battle!
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Boss battles grant bonus XP and rare stat upgrades.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
