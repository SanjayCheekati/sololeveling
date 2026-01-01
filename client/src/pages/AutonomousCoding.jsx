import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Editor from '@monaco-editor/react';
import { useProgressStore } from '../store/progressStore';
import { useAuthStore } from '../store/authStore';
import { executionAPI } from '../services/api';

const AutonomousCoding = () => {
  const navigate = useNavigate();
  const { problemSlug } = useParams();
  const { fetchProblem, currentProblem, completePhase } = useProgressStore();
  const { user, addXP, addStats, updateUser } = useAuthStore();
  
  const editorRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [mistakes, setMistakes] = useState([]);
  
  useEffect(() => {
    const loadProblem = async () => {
      const problem = await fetchProblem(problemSlug);
      if (problem) {
        // Minimal template - user writes everything
        setCode(getMinimalTemplate(problem));
      }
      setLoading(false);
    };
    loadProblem();
  }, [problemSlug, fetchProblem]);
  
  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);
  
  const getMinimalTemplate = (problem) => {
    return `# ${problem.title}
# Write your solution from scratch

def solution(${problem.functionSignature?.params?.join(', ') || 'arr'}):
    # Your code here
    pass
`;
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };
  
  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error('[SYSTEM] No code to execute!');
      return;
    }
    
    setIsRunning(true);
    setOutput('');
    
    try {
      const response = await executionAPI.run(code, currentProblem?._id, null);
      const result = response.data?.data || response.data;
      
      setOutput(result.output || result.error || 'No output');
      
      if (result.success) {
        toast.success('[SYSTEM] Code executed successfully!');
      } else {
        // Track mistake
        if (result.errorType) {
          setMistakes(prev => [...prev, { type: result.errorType, time: timeElapsed }]);
        }
      }
    } catch (error) {
      setOutput(error.response?.data?.error || 'Execution failed');
    }
    
    setIsRunning(false);
  };
  
  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('[SYSTEM] No code to submit!');
      return;
    }
    
    setIsRunning(true);
    setAttempts(prev => prev + 1);
    setTestResults([]);
    
    try {
      const response = await executionAPI.submit(code, currentProblem?._id, 'autonomous', 0, timeElapsed);
      const result = response.data?.data || response.data;
      
      setTestResults(result.testResults || []);
      
      if (result.passed) {
        // Calculate rewards based on performance
        const baseXP = currentProblem.rewards?.xp || 50;
        const baseGold = currentProblem.rewards?.gold || 20;
        
        // Bonus for fewer attempts
        const attemptBonus = Math.max(0, 1 - (attempts * 0.1));
        // Bonus for speed (under 5 minutes = bonus)
        const timeBonus = timeElapsed < 300 ? 0.2 : 0;
        
        const finalXP = Math.floor(baseXP * (1 + attemptBonus + timeBonus));
        const finalGold = Math.floor(baseGold * (1 + attemptBonus));
        
        // Award rewards
        await addXP(finalXP);
        updateUser({ gold: (user?.gold || 0) + finalGold });
        
        // Calculate stat gains
        const statGains = calculateStatGains(result, mistakes);
        if (Object.keys(statGains).length > 0) {
          await addStats(statGains);
        }
        
        // Complete autonomous phase
        await completePhase(currentProblem.zone, currentProblem._id, 'autonomous');
        
        setShowSuccess(true);
        
        toast.success('[SYSTEM] MISSION COMPLETE! Problem solved!');
      } else {
        const passedCount = result.testResults?.filter(t => t.passed).length || 0;
        const totalCount = result.testResults?.length || 0;
        
        toast.warning(`[SYSTEM] ${passedCount}/${totalCount} tests passed.`);
        
        // Track submission mistake
        setMistakes(prev => [...prev, { type: 'failed_submission', time: timeElapsed }]);
      }
    } catch (error) {
      toast.error('[SYSTEM] Submission failed!');
      setOutput(error.response?.data?.error || 'Submission error');
    }
    
    setIsRunning(false);
  };
  
  const calculateStatGains = (result, mistakes) => {
    const gains = {};
    
    // Intelligence boost for clean solution
    if (mistakes.length === 0) {
      gains.intelligence = 2;
    } else if (mistakes.length < 3) {
      gains.intelligence = 1;
    }
    
    // Agility boost for speed
    if (timeElapsed < 180) {
      gains.agility = 2;
    } else if (timeElapsed < 300) {
      gains.agility = 1;
    }
    
    // Endurance for persistence (many attempts but succeeded)
    if (attempts > 3) {
      gains.endurance = 1;
    }
    
    // Strength for optimization (if applicable)
    if (result.performance?.timeComplexity === 'optimal') {
      gains.strength = 1;
    }
    
    return gains;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-orange-400 animate-pulse">
            code
          </span>
          <p className="text-gray-500 mt-4 font-mono">[SYSTEM] Loading autonomous mode...</p>
        </div>
      </div>
    );
  }
  
  if (!currentProblem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-red-400">error</span>
          <p className="text-gray-500 mt-4">Problem not found</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="text-center p-8"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="text-8xl mb-6"
              >
                🏆
              </motion.div>
              
              <h1 className="text-4xl font-bold text-primary mb-4">
                MISSION COMPLETE!
              </h1>
              
              <p className="text-gray-400 mb-8">
                You've successfully solved {currentProblem.title}
              </p>
              
              {/* Stats */}
              <div className="flex justify-center gap-6 mb-8">
                <div className="glass-panel p-4 rounded-xl text-center min-w-[100px]">
                  <span className="material-symbols-outlined text-2xl text-primary">timer</span>
                  <p className="text-2xl font-bold">{formatTime(timeElapsed)}</p>
                  <p className="text-xs text-gray-500">Time</p>
                </div>
                <div className="glass-panel p-4 rounded-xl text-center min-w-[100px]">
                  <span className="material-symbols-outlined text-2xl text-purple-400">replay</span>
                  <p className="text-2xl font-bold">{attempts}</p>
                  <p className="text-xs text-gray-500">Attempts</p>
                </div>
                <div className="glass-panel p-4 rounded-xl text-center min-w-[100px]">
                  <span className="material-symbols-outlined text-2xl text-green-400">star</span>
                  <p className="text-2xl font-bold text-primary">+{currentProblem.rewards?.xp || 50}</p>
                  <p className="text-xs text-gray-500">XP</p>
                </div>
              </div>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate(`/zone/${currentProblem.zone}`)}
                  className="px-6 py-3 glass-panel rounded-lg hover:bg-primary/10"
                >
                  Back to Zone
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-blue-400 rounded-lg font-bold text-black"
                >
                  Dashboard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex justify-between items-center p-4 glass-panel border-b border-gray-800"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/zone/${currentProblem.zone}`)}
            className="text-gray-400 hover:text-white"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="font-bold">{currentProblem.title}</h1>
            <span className="text-xs text-orange-400 font-mono">PHASE 3: AUTONOMOUS MODE</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Timer */}
          <div className="flex items-center gap-2 text-gray-400">
            <span className="material-symbols-outlined">timer</span>
            <span className="font-mono">{formatTime(timeElapsed)}</span>
          </div>
          
          {/* Attempts */}
          <div className="flex items-center gap-2 text-gray-400">
            <span className="material-symbols-outlined">replay</span>
            <span>{attempts} attempts</span>
          </div>
          
          {/* Difficulty */}
          <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
            currentProblem.difficulty === 'E' ? 'bg-gray-500/20 text-gray-400' :
            currentProblem.difficulty === 'D' ? 'bg-green-500/20 text-green-400' :
            currentProblem.difficulty === 'C' ? 'bg-blue-500/20 text-blue-400' :
            'bg-purple-500/20 text-purple-400'
          }`}>
            {currentProblem.difficulty}-Rank
          </span>
        </div>
      </motion.header>
      
      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Problem Description */}
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-96 glass-panel border-r border-gray-800 p-4 overflow-y-auto"
        >
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3">{currentProblem.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {currentProblem.description}
            </p>
          </div>
          
          {/* Constraints */}
          {currentProblem.constraints && (
            <div className="mb-6">
              <h4 className="text-sm font-mono text-gray-500 mb-2">CONSTRAINTS</h4>
              <ul className="space-y-1 text-sm text-gray-400">
                {currentProblem.constraints.map((c, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Examples */}
          <div className="mb-6">
            <h4 className="text-sm font-mono text-gray-500 mb-2">EXAMPLES</h4>
            {currentProblem.testCases?.slice(0, 2).map((tc, idx) => (
              <div key={idx} className="mb-3 p-3 bg-void/50 rounded-lg border border-gray-800">
                <div className="text-xs text-gray-500 mb-2">Example {idx + 1}</div>
                <div className="font-mono text-xs space-y-1">
                  <div>
                    <span className="text-gray-500">Input: </span>
                    <span className="text-primary">{JSON.stringify(tc.input)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Output: </span>
                    <span className="text-green-400">{JSON.stringify(tc.expected)}</span>
                  </div>
                  {tc.explanation && (
                    <div className="mt-2 text-gray-500 text-xs">
                      {tc.explanation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Tips */}
          <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <h4 className="text-sm text-orange-400 flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-sm">tips_and_updates</span>
              Autonomous Mode
            </h4>
            <p className="text-xs text-gray-400">
              No hints available in this mode. Apply what you learned in the previous phases!
            </p>
          </div>
        </motion.div>
        
        {/* Center - Code Editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="python"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              onMount={handleEditorMount}
              options={{
                fontSize: 14,
                fontFamily: 'JetBrains Mono, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                wordWrap: 'on',
                padding: { top: 16 }
              }}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="p-4 glass-panel border-t border-gray-800 flex justify-between items-center">
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="px-6 py-2 glass-panel rounded-lg text-primary hover:bg-primary/10 flex items-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined">
                {isRunning ? 'hourglass_empty' : 'play_arrow'}
              </span>
              Run Code
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={isRunning}
              className="px-8 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <span className="material-symbols-outlined">rocket_launch</span>
              Submit Solution
            </button>
          </div>
        </div>
        
        {/* Right Panel - Output & Results */}
        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-80 glass-panel border-l border-gray-800 flex flex-col"
        >
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-sm font-mono text-gray-500">CONSOLE OUTPUT</h3>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
            {output ? (
              <pre className="whitespace-pre-wrap text-gray-300">{output}</pre>
            ) : (
              <p className="text-gray-600">Run your code to see output...</p>
            )}
          </div>
          
          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="p-4 border-t border-gray-800">
              <h4 className="text-xs text-gray-500 mb-3">TEST RESULTS</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {testResults.map((result, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded text-xs flex items-center justify-between ${
                      result.passed
                        ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                        : 'bg-red-500/10 border border-red-500/30 text-red-400'
                    }`}
                  >
                    <span>Test {idx + 1}</span>
                    <span className="material-symbols-outlined text-sm">
                      {result.passed ? 'check_circle' : 'cancel'}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-800 text-center">
                <span className={`text-lg font-bold ${
                  testResults.every(t => t.passed) ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {testResults.filter(t => t.passed).length}/{testResults.length} Passed
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AutonomousCoding;
