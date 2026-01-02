import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { useAuthStore } from '../store/authStore';
import { progressAPI } from '../services/api';
import { toast } from 'react-toastify';

const BossBattle = () => {
  const { zoneId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [boss, setBoss] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  
  // Battle state
  const [playerHP, setPlayerHP] = useState(100);
  const [bossHP, setBossHP] = useState(100);
  const [bossMaxHP, setBossMaxHP] = useState(100);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes
  const [battleStarted, setBattleStarted] = useState(false);
  const [battleEnded, setBattleEnded] = useState(false);
  const [victory, setVictory] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [totalPhases, setTotalPhases] = useState(3);
  const [attacks, setAttacks] = useState([]);
  const [showIntro, setShowIntro] = useState(true);
  
  const timerRef = useRef(null);
  const battleRef = useRef(null);
  
  const bosses = {
    'arrays': {
      name: 'THE DUPLICATE HUNTER',
      title: 'Guardian of the Array Plains',
      icon: 'grid_view',
      color: '#22C55E',
      description: 'A creature that feeds on redundant data. It knows every element in its domain.',
      phases: [
        { hp: 100, problem: 'reverse', attack: 'Reversal Strike' },
        { hp: 100, problem: 'twosum', attack: 'Index Assault' },
        { hp: 100, problem: 'maxsubarray', attack: 'Contiguous Crush' }
      ]
    },
    'stacks': {
      name: 'THE PARENTHESIS WARDEN',
      title: 'Keeper of Balance',
      icon: 'layers',
      color: '#3B82F6',
      description: 'An ancient being that maintains perfect balance. Every opening must have its closing.',
      phases: [
        { hp: 100, problem: 'validparens', attack: 'Balance Break' },
        { hp: 100, problem: 'minstack', attack: 'Minimum Siege' }
      ]
    },
    'recursion': {
      name: 'THE INFINITE MIRROR',
      title: 'Echo of the Depths',
      icon: 'all_inclusive',
      color: '#A855F7',
      description: 'A being that exists in infinite reflections. To defeat it, you must understand its pattern.',
      phases: [
        { hp: 100, problem: 'fibonacci', attack: 'Recursive Rift' },
        { hp: 100, problem: 'factorial', attack: 'Self-Reference Storm' }
      ]
    },
    'binary-trees': {
      name: 'THE ROOT KEEPER',
      title: 'Ancient of the Sanctuary',
      icon: 'account_tree',
      color: '#06B6D4',
      description: 'The eldest tree spirit. Its branches hold secrets of all paths.',
      phases: [
        { hp: 100, problem: 'maxdepth', attack: 'Depth Dive' },
        { hp: 100, problem: 'inorder', attack: 'Traversal Terror' }
      ]
    }
  };
  
  useEffect(() => {
    const loadBoss = async () => {
      const bossData = bosses[zoneId];
      if (!bossData) {
        toast.error('Boss not found');
        navigate('/zones');
        return;
      }
      
      setBoss(bossData);
      setTotalPhases(bossData.phases.length);
      setBossMaxHP(bossData.phases.reduce((sum, p) => sum + p.hp, 0));
      setBossHP(bossData.phases.reduce((sum, p) => sum + p.hp, 0));
      
      // Load first phase problem
      await loadPhase(1, bossData);
      setLoading(false);
    };
    
    loadBoss();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [zoneId, navigate]);
  
  const loadPhase = async (phase, bossData) => {
    // In real app, load actual problem from API
    const phaseData = bossData.phases[phase - 1];
    setCode(getPhaseStarterCode(phaseData.problem));
  };
  
  const getPhaseStarterCode = (problemType) => {
    const templates = {
      'reverse': `# BOSS PHASE: Reverse Array
# Defeat this phase by reversing the array in-place!

def solve(arr):
    # Your code here
    pass

# Test
print(solve([1, 2, 3, 4, 5]))  # Expected: [5, 4, 3, 2, 1]`,
      'twosum': `# BOSS PHASE: Two Sum
# Find two numbers that add up to target!

def solve(nums, target):
    # Your code here
    pass

# Test
print(solve([2, 7, 11, 15], 9))  # Expected: [0, 1]`,
      'maxsubarray': `# BOSS PHASE: Maximum Subarray
# Find the contiguous subarray with largest sum!

def solve(nums):
    # Your code here
    pass

# Test
print(solve([-2,1,-3,4,-1,2,1,-5,4]))  # Expected: 6`,
      'validparens': `# BOSS PHASE: Valid Parentheses
# Check if the parentheses string is valid!

def solve(s):
    # Your code here
    pass

# Test
print(solve("()[]{}"))  # Expected: True`,
      'minstack': `# BOSS PHASE: Min Stack
# Implement a stack with O(1) getMin!

class MinStack:
    def __init__(self):
        pass
    
    def push(self, val):
        pass
    
    def pop(self):
        pass
    
    def getMin(self):
        pass`,
      'fibonacci': `# BOSS PHASE: Fibonacci
# Calculate the nth Fibonacci number!

def solve(n):
    # Your code here
    pass

# Test
print(solve(10))  # Expected: 55`,
      'factorial': `# BOSS PHASE: Factorial
# Calculate n factorial using recursion!

def solve(n):
    # Your code here
    pass

# Test
print(solve(5))  # Expected: 120`,
      'maxdepth': `# BOSS PHASE: Max Depth
# Find the maximum depth of a binary tree!

def solve(root):
    # Your code here
    pass`,
      'inorder': `# BOSS PHASE: Inorder Traversal
# Return inorder traversal of binary tree!

def solve(root):
    # Your code here
    pass`
    };
    return templates[problemType] || '# Boss phase code';
  };
  
  const startBattle = () => {
    setShowIntro(false);
    setBattleStarted(true);
    
    // Start timer
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          endBattle(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Start boss attack pattern
    startBossAttacks();
  };
  
  const startBossAttacks = () => {
    battleRef.current = setInterval(() => {
      if (!battleEnded) {
        // Boss attacks every 30 seconds
        const damage = Math.floor(Math.random() * 15) + 10;
        setPlayerHP(prev => {
          const newHP = Math.max(0, prev - damage);
          if (newHP === 0) {
            endBattle(false);
          }
          return newHP;
        });
        
        setAttacks(prev => [...prev, {
          type: 'boss',
          message: `${boss?.phases[currentPhase - 1]?.attack || 'Attack'}! -${damage} HP`,
          timestamp: Date.now()
        }].slice(-5));
        
        toast.error(`Boss attacks! -${damage} HP`);
      }
    }, 30000);
  };
  
  const handleSubmit = async () => {
    setIsRunning(true);
    
    try {
      // Simulate code execution
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Random success for demo (in real app, actually test the code)
      const success = Math.random() > 0.3;
      
      if (success) {
        // Deal damage to boss
        const damage = Math.floor((100 / totalPhases) + Math.random() * 20);
        setBossHP(prev => {
          const newHP = Math.max(0, prev - damage);
          if (newHP === 0) {
            endBattle(true);
          }
          return newHP;
        });
        
        setAttacks(prev => [...prev, {
          type: 'player',
          message: `Critical Hit! -${damage} Boss HP`,
          timestamp: Date.now()
        }].slice(-5));
        
        // Check if phase complete
        const phaseHP = (totalPhases - currentPhase + 1) * 100 / totalPhases * bossMaxHP / 100;
        if (bossHP - damage < phaseHP && currentPhase < totalPhases) {
          setCurrentPhase(prev => prev + 1);
          toast.success(`Phase ${currentPhase} complete! Boss enraged!`);
          loadPhase(currentPhase + 1, boss);
        } else {
          toast.success('Attack successful!');
        }
      } else {
        // Failed attempt damages player
        const damage = 10;
        setPlayerHP(prev => {
          const newHP = Math.max(0, prev - damage);
          if (newHP === 0) {
            endBattle(false);
          }
          return newHP;
        });
        
        setAttacks(prev => [...prev, {
          type: 'fail',
          message: `Attack failed! -${damage} HP (incorrect solution)`,
          timestamp: Date.now()
        }].slice(-5));
        
        toast.error('Attack failed! Check your solution.');
      }
    } catch (error) {
      toast.error('Execution error');
    }
    
    setIsRunning(false);
  };
  
  const endBattle = (won) => {
    setBattleEnded(true);
    setVictory(won);
    if (timerRef.current) clearInterval(timerRef.current);
    if (battleRef.current) clearInterval(battleRef.current);
    
    if (won) {
      toast.success('[SYSTEM] BOSS DEFEATED!');
    } else {
      toast.error('[SYSTEM] Battle lost. Train harder, Hunter.');
    }
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 mx-auto mb-4 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-5xl text-red-500">skull</span>
          </motion.div>
          <p className="text-gray-500 font-mono text-sm">[SYSTEM] Loading boss data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dramatic background */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${boss?.color}40 0%, transparent 60%)`
          }}
        />
        <motion.div
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-t from-red-900/20 to-transparent"
        />
      </div>
      
      {/* Boss Intro */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-void/95 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="text-center max-w-lg mx-4"
            >
              {/* Boss icon */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center border-4"
                style={{ borderColor: boss?.color, background: `${boss?.color}20` }}
              >
                <span className="material-symbols-outlined text-6xl" style={{ color: boss?.color }}>
                  {boss?.icon}
                </span>
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xs text-red-400 font-mono mb-2"
              >
                [SYSTEM WARNING] BOSS DETECTED
              </motion.p>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-4xl font-bold mb-2"
                style={{ color: boss?.color }}
              >
                {boss?.name}
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-gray-400 mb-4"
              >
                {boss?.title}
              </motion.p>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="text-sm text-gray-500 italic mb-8"
              >
                "{boss?.description}"
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
                className="flex items-center justify-center gap-4 mb-8"
              >
                <div className="glass-panel px-4 py-2 rounded-lg">
                  <span className="text-xs text-gray-500">Phases</span>
                  <p className="text-lg font-bold text-primary">{totalPhases}</p>
                </div>
                <div className="glass-panel px-4 py-2 rounded-lg">
                  <span className="text-xs text-gray-500">Time Limit</span>
                  <p className="text-lg font-bold text-yellow-400">10:00</p>
                </div>
                <div className="glass-panel px-4 py-2 rounded-lg">
                  <span className="text-xs text-gray-500">Difficulty</span>
                  <p className="text-lg font-bold text-red-400">BOSS</p>
                </div>
              </motion.div>
              
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startBattle}
                className="px-8 py-4 rounded-xl font-bold text-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${boss?.color}, ${boss?.color}99)`,
                  boxShadow: `0 0 40px ${boss?.color}60`
                }}
              >
                <span className="flex items-center gap-3">
                  <span className="material-symbols-outlined">swords</span>
                  BEGIN BATTLE
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Battle UI */}
      {battleStarted && !showIntro && (
        <div className="p-4 lg:p-6 h-screen flex flex-col">
          {/* Top Bar - HP and Timer */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              {/* Player HP */}
              <div className="flex-1 max-w-md">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Hunter {user?.hunterName}</span>
                  <span className="text-sm text-green-400">{playerHP}/100 HP</span>
                </div>
                <div className="hp-bar h-4">
                  <motion.div 
                    className="hp-bar-fill"
                    style={{ width: `${playerHP}%` }}
                    animate={{ width: `${playerHP}%` }}
                  />
                </div>
              </div>
              
              {/* Timer */}
              <div className="mx-8 glass-panel px-6 py-3 rounded-xl">
                <div className={`font-mono text-2xl font-bold ${timeRemaining < 60 ? 'text-red-400 animate-pulse' : 'text-primary'}`}>
                  {formatTime(timeRemaining)}
                </div>
              </div>
              
              {/* Boss HP */}
              <div className="flex-1 max-w-md">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm" style={{ color: boss?.color }}>{boss?.name}</span>
                  <span className="text-sm text-red-400">{bossHP}/{bossMaxHP} HP</span>
                </div>
                <div className="h-4 bg-void rounded-full overflow-hidden border border-red-500/30">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-red-600 to-red-400"
                    style={{ width: `${(bossHP / bossMaxHP) * 100}%` }}
                    animate={{ width: `${(bossHP / bossMaxHP) * 100}%` }}
                  />
                </div>
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-gray-500">Phase {currentPhase}/{totalPhases}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Battle Area */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
            {/* Left - Attack Log */}
            <div className="glass-panel rounded-xl p-4 flex flex-col">
              <h3 className="text-sm text-gray-500 font-mono mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-400 text-sm">swords</span>
                BATTLE LOG
              </h3>
              <div className="flex-1 space-y-2 overflow-auto">
                {attacks.map((attack, idx) => (
                  <motion.div
                    key={attack.timestamp}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className={`p-2 rounded-lg text-sm ${
                      attack.type === 'boss' ? 'bg-red-500/10 text-red-400 border-l-2 border-red-500' :
                      attack.type === 'player' ? 'bg-green-500/10 text-green-400 border-l-2 border-green-500' :
                      'bg-yellow-500/10 text-yellow-400 border-l-2 border-yellow-500'
                    }`}
                  >
                    {attack.message}
                  </motion.div>
                ))}
                {attacks.length === 0 && (
                  <p className="text-gray-600 text-sm">Battle started...</p>
                )}
              </div>
            </div>
            
            {/* Center - Code Editor */}
            <div className="lg:col-span-2 flex flex-col gap-4 overflow-hidden">
              <div className="glass-panel rounded-xl overflow-hidden flex-1 flex flex-col">
                <div className="p-3 border-b border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono" style={{ color: boss?.color }}>
                      PHASE {currentPhase}: {boss?.phases[currentPhase - 1]?.attack}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">Python</span>
                </div>
                
                <div className="flex-1">
                  <Editor
                    height="100%"
                    language="python"
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme="vs-dark"
                    options={{
                      fontSize: 14,
                      fontFamily: 'JetBrains Mono, monospace',
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      padding: { top: 16 }
                    }}
                  />
                </div>
              </div>
              
              {/* Attack Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isRunning || battleEnded}
                className="py-4 rounded-xl font-bold text-lg disabled:opacity-50"
                style={{ 
                  background: `linear-gradient(135deg, ${boss?.color}, ${boss?.color}99)`,
                  boxShadow: `0 0 30px ${boss?.color}40`
                }}
              >
                {isRunning ? (
                  <motion.span 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="material-symbols-outlined"
                  >
                    sync
                  </motion.span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">bolt</span>
                    ATTACK!
                  </span>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      )}
      
      {/* Battle End Modal */}
      <AnimatePresence>
        {battleEnded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-void/95 flex items-center justify-center z-50"
          >
            {/* Victory/Defeat effects */}
            {victory && [...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{ duration: 1.5, delay: i * 0.3 }}
                className="absolute w-40 h-40 border-4 rounded-full"
                style={{ borderColor: boss?.color }}
              />
            ))}
            
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="glass-panel-strong rounded-2xl p-8 max-w-md text-center"
            >
              <span 
                className={`material-symbols-outlined text-6xl mb-4 ${victory ? 'text-yellow-400' : 'text-red-400'}`}
              >
                {victory ? 'emoji_events' : 'skull'}
              </span>
              
              <h2 className="text-2xl font-bold mb-2">
                {victory ? '[SYSTEM] BOSS DEFEATED!' : '[SYSTEM] BATTLE LOST'}
              </h2>
              <p className="text-gray-400 mb-6">
                {victory 
                  ? 'You have conquered this dungeon boss!' 
                  : 'The boss was too strong. Train harder and try again.'
                }
              </p>
              
              {victory && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-void rounded-lg">
                    <span className="text-xs text-gray-500">XP Earned</span>
                    <p className="text-lg font-bold text-primary">+500</p>
                  </div>
                  <div className="p-3 bg-void rounded-lg">
                    <span className="text-xs text-gray-500">Time</span>
                    <p className="text-lg font-bold text-cyan-400">{formatTime(600 - timeRemaining)}</p>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/zones')}
                  className="flex-1 py-3 rounded-lg btn-system"
                >
                  Zone Map
                </button>
                {victory ? (
                  <button
                    onClick={() => navigate('/rank-up')}
                    className="flex-1 py-3 rounded-lg btn-primary font-bold"
                  >
                    Check Rank
                  </button>
                ) : (
                  <button
                    onClick={() => window.location.reload()}
                    className="flex-1 py-3 rounded-lg btn-primary font-bold"
                  >
                    Retry
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BossBattle;
