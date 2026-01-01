import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Editor from '@monaco-editor/react';
import { useProgressStore } from '../store/progressStore';
import { useAuthStore } from '../store/authStore';
import { executionAPI, problemAPI } from '../services/api';

const BossBattle = () => {
  const navigate = useNavigate();
  const { problemSlug } = useParams();
  const { user, addXP, addStats, updateUser } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [boss, setBoss] = useState(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [bossHP, setBossHP] = useState(100);
  const [playerHP, setPlayerHP] = useState(100);
  const [battlePhase, setBattlePhase] = useState('intro'); // intro, battle, victory, defeat
  const [showAttackAnimation, setShowAttackAnimation] = useState(false);
  const [attackType, setAttackType] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [timeLimit] = useState(600); // 10 minutes
  const [timeRemaining, setTimeRemaining] = useState(600);
  
  useEffect(() => {
    const loadBoss = async () => {
      try {
        const response = await problemAPI.getBySlug(problemSlug);
        setBoss(response.data);
        setCode(getBossTemplate(response.data));
      } catch (error) {
        toast.error('[SYSTEM] Failed to load boss battle');
      }
      setLoading(false);
    };
    loadBoss();
  }, [problemSlug]);
  
  // Timer countdown
  useEffect(() => {
    if (battlePhase !== 'battle') return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up - boss wins
          setBattlePhase('defeat');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [battlePhase]);
  
  const getBossTemplate = (boss) => {
    return `# BOSS BATTLE: ${boss?.title || 'Unknown Boss'}
# Difficulty: ${boss?.difficulty || 'S'}-Rank
# Time Limit: 10 minutes

def solution(${boss?.functionSignature?.params?.join(', ') || 'data'}):
    """
    Defeat the boss by solving this challenge!
    
    ${boss?.description || ''}
    """
    # Your battle code here
    pass
`;
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const startBattle = () => {
    setBattlePhase('battle');
    toast.warning('[SYSTEM] BOSS BATTLE INITIATED!');
  };
  
  const handleAttack = async () => {
    if (!code.trim() || isRunning) return;
    
    setIsRunning(true);
    setAttempts(prev => prev + 1);
    setShowAttackAnimation(true);
    setAttackType('player');
    
    try {
      const response = await executionAPI.submit(code, problemSlug);
      const result = response.data;
      
      setTestResults(result.testResults || []);
      
      const passedTests = result.testResults?.filter(t => t.passed).length || 0;
      const totalTests = result.testResults?.length || 1;
      const damageDealt = Math.floor((passedTests / totalTests) * 40);
      
      if (damageDealt > 0) {
        // Player hits boss
        setBossHP(prev => Math.max(0, prev - damageDealt));
        toast.success(`[SYSTEM] CRITICAL HIT! Dealt ${damageDealt} damage!`);
        
        setTimeout(() => {
          setShowAttackAnimation(false);
          
          if (bossHP - damageDealt <= 0) {
            // Victory!
            setBattlePhase('victory');
            handleVictory();
          } else {
            // Boss counterattack
            bossCounterattack(false);
          }
        }, 1000);
      } else {
        // Missed attack
        toast.error('[SYSTEM] MISS! Your attack failed!');
        
        setTimeout(() => {
          setShowAttackAnimation(false);
          // Heavy counterattack on miss
          bossCounterattack(true);
        }, 1000);
      }
      
      setOutput(result.output || result.error || 'No output');
    } catch (error) {
      toast.error('[SYSTEM] Attack failed!');
      setOutput(error.response?.data?.error || 'Error');
      setShowAttackAnimation(false);
    }
    
    setIsRunning(false);
  };
  
  const bossCounterattack = (heavy) => {
    setShowAttackAnimation(true);
    setAttackType('boss');
    
    const damage = heavy ? 30 : 15;
    
    setTimeout(() => {
      setPlayerHP(prev => {
        const newHP = Math.max(0, prev - damage);
        if (newHP <= 0) {
          setBattlePhase('defeat');
        }
        return newHP;
      });
      setShowAttackAnimation(false);
      toast.error(`[BOSS] Dealt ${damage} damage to you!`);
    }, 800);
  };
  
  const handleVictory = async () => {
    // Calculate rewards
    const baseXP = (boss?.rewards?.xp || 100) * 2;
    const baseGold = (boss?.rewards?.gold || 50) * 2;
    
    await addXP(baseXP);
    updateUser({ gold: (user?.gold || 0) + baseGold });
    
    // Stat bonuses for boss defeat
    await addStats({
      strength: 3,
      intelligence: 3,
      agility: 2,
      endurance: 2,
      sense: 1
    });
    
    toast.success('[SYSTEM] BOSS DEFEATED! Massive rewards earned!');
  };
  
  const handleDefeat = () => {
    toast.error('[SYSTEM] You have been defeated... Train harder and return!');
    setTimeout(() => navigate('/dashboard'), 2000);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <span className="material-symbols-outlined text-8xl text-red-500 animate-pulse">
            skull
          </span>
          <p className="text-red-400 mt-4 font-mono">[SYSTEM] Loading boss...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Dramatic Background */}
      <div className="absolute inset-0 bg-gradient-radial from-red-900/20 via-black to-black" />
      <div className="absolute inset-0 grid-bg opacity-20" />
      
      {/* Battle Arena Effects */}
      <AnimatePresence>
        {showAttackAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 ${
              attackType === 'player' 
                ? 'bg-primary/20' 
                : 'bg-red-500/20'
            }`}
          />
        )}
      </AnimatePresence>
      
      {/* Intro Screen */}
      <AnimatePresence>
        {battlePhase === 'intro' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-50"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.8 }}
              >
                <span className="material-symbols-outlined text-[150px] text-red-500">
                  skull
                </span>
              </motion.div>
              
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-5xl font-bold text-red-500 mt-6 mb-4"
              >
                ZONE BOSS
              </motion.h1>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-2xl text-white mb-2"
              >
                {boss?.title}
              </motion.p>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-gray-500 mb-8"
              >
                {boss?.difficulty}-Rank Challenge
              </motion.p>
              
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.1 }}
                onClick={startBattle}
                className="px-12 py-4 bg-gradient-to-r from-red-600 to-orange-500 rounded-lg font-bold text-white text-xl hover:shadow-lg hover:shadow-red-500/50 transition-all"
              >
                <span className="flex items-center gap-3">
                  <span className="material-symbols-outlined">swords</span>
                  ENGAGE BOSS
                </span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Victory Screen */}
      <AnimatePresence>
        {battlePhase === 'victory' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center z-50 bg-black/80"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="text-[120px]"
              >
                👑
              </motion.div>
              
              <h1 className="text-5xl font-bold text-yellow-400 mb-4">VICTORY!</h1>
              <p className="text-xl text-gray-300 mb-8">Boss has been defeated!</p>
              
              <div className="flex justify-center gap-6 mb-8">
                <div className="glass-panel p-4 rounded-xl text-center">
                  <span className="text-yellow-400 text-3xl font-bold">+{(boss?.rewards?.xp || 100) * 2}</span>
                  <p className="text-xs text-gray-500">XP</p>
                </div>
                <div className="glass-panel p-4 rounded-xl text-center">
                  <span className="text-yellow-400 text-3xl font-bold">+{(boss?.rewards?.gold || 50) * 2}</span>
                  <p className="text-xs text-gray-500">Gold</p>
                </div>
              </div>
              
              <button
                onClick={() => navigate('/rank-up')}
                className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg font-bold text-black"
              >
                PROCEED TO RANK UP
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Defeat Screen */}
      <AnimatePresence>
        {battlePhase === 'defeat' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center z-50 bg-black/90"
          >
            <div className="text-center">
              <span className="text-[100px]">💀</span>
              <h1 className="text-4xl font-bold text-red-500 mb-4">DEFEATED</h1>
              <p className="text-gray-400 mb-8">The boss was too powerful...</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3 glass-panel rounded-lg text-gray-300 hover:text-white"
              >
                Return to Train
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Battle Interface */}
      {battlePhase === 'battle' && (
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Battle HUD */}
          <div className="p-4 flex justify-between items-center">
            {/* Player HP */}
            <div className="w-64">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-primary">{user?.hunterName}</span>
                <span className="text-gray-400">{playerHP}/100</span>
              </div>
              <div className="h-4 bg-void rounded-full overflow-hidden border border-primary/30">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-green-400"
                  animate={{ width: `${playerHP}%` }}
                />
              </div>
            </div>
            
            {/* Timer */}
            <div className={`text-center ${timeRemaining < 60 ? 'text-red-400 animate-pulse' : 'text-gray-400'}`}>
              <span className="material-symbols-outlined text-2xl">timer</span>
              <p className="font-mono text-2xl">{formatTime(timeRemaining)}</p>
            </div>
            
            {/* Boss HP */}
            <div className="w-64">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-red-400">{boss?.title}</span>
                <span className="text-gray-400">{bossHP}/100</span>
              </div>
              <div className="h-4 bg-void rounded-full overflow-hidden border border-red-500/30">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-600 to-red-400"
                  animate={{ width: `${bossHP}%` }}
                />
              </div>
            </div>
          </div>
          
          {/* Main Battle Area */}
          <div className="flex-1 flex">
            {/* Code Editor */}
            <div className="flex-1 flex flex-col">
              <Editor
                height="100%"
                defaultLanguage="python"
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || '')}
                options={{
                  fontSize: 14,
                  fontFamily: 'JetBrains Mono, monospace',
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  wordWrap: 'on'
                }}
              />
              
              {/* Attack Button */}
              <div className="p-4 flex justify-center">
                <button
                  onClick={handleAttack}
                  disabled={isRunning}
                  className="px-12 py-4 bg-gradient-to-r from-red-600 to-orange-500 rounded-lg font-bold text-white text-xl hover:shadow-lg hover:shadow-red-500/30 transition-all disabled:opacity-50 flex items-center gap-3"
                >
                  <span className="material-symbols-outlined text-3xl">
                    {isRunning ? 'hourglass_empty' : 'swords'}
                  </span>
                  {isRunning ? 'ATTACKING...' : 'ATTACK!'}
                </button>
              </div>
            </div>
            
            {/* Right Panel - Boss & Output */}
            <div className="w-80 glass-panel border-l border-red-500/20 flex flex-col">
              {/* Boss Visual */}
              <div className="p-6 text-center border-b border-gray-800">
                <motion.div
                  animate={showAttackAnimation && attackType === 'player' 
                    ? { x: [0, -10, 10, -10, 0] } 
                    : {}
                  }
                >
                  <span className="material-symbols-outlined text-[80px] text-red-500">
                    skull
                  </span>
                </motion.div>
                <p className="text-red-400 text-sm mt-2">{boss?.difficulty}-Rank Boss</p>
              </div>
              
              {/* Output */}
              <div className="flex-1 p-4 overflow-y-auto">
                <h3 className="text-xs text-gray-500 mb-2">BATTLE LOG</h3>
                <pre className="font-mono text-xs text-gray-400 whitespace-pre-wrap">
                  {output || 'Waiting for attack...'}
                </pre>
              </div>
              
              {/* Test Results */}
              {testResults.length > 0 && (
                <div className="p-4 border-t border-gray-800">
                  <div className="flex justify-center gap-1">
                    {testResults.map((r, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded ${
                          r.passed ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BossBattle;
