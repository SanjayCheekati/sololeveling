import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { useAuthStore } from '../store/authStore';
import { problemAPI, executionAPI, progressAPI } from '../services/api';
import { toast } from 'react-toastify';

const AutonomousCoding = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const { refreshUser, addXP } = useAuthStore();
  const editorRef = useRef(null);
  
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [showPredictionModal, setShowPredictionModal] = useState(true);
  const [prediction, setPrediction] = useState({ timeComplexity: '', spaceComplexity: '', approach: '' });
  const [predictionSubmitted, setPredictionSubmitted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const timerRef = useRef(null);
  
  useEffect(() => {
    const loadProblem = async () => {
      try {
        const res = await problemAPI.getById(problemId, 'autonomous');
        const data = res.data?.data || res.data;
        setProblem(data);
        setCode(getStarterCode(data));
      } catch (error) {
        console.error('Problem load error:', error);
        toast.error('Failed to load problem');
        navigate('/dashboard');
      }
      setLoading(false);
    };
    loadProblem();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [problemId, navigate]);
  
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);
  
  const getStarterCode = (prob) => {
    const category = prob?.category?.toLowerCase() || 'arrays';
    return `# Problem: ${prob?.title || 'Unknown'}
# Category: ${category}
# Difficulty: ${prob?.difficulty || 'Unknown'}
# 
# Write your complete solution below.
# You have full access to write any code you need.

def solve(input_data):
    """
    Your solution here.
    
    Args:
        input_data: The input for the problem
        
    Returns:
        The expected output
    """
    # TODO: Implement your solution
    pass

# Test your solution
if __name__ == "__main__":
    # Example test
    test_input = ${JSON.stringify(prob?.testCases?.[0]?.input || [1, 2, 3])}
    result = solve(test_input)
    print(f"Result: {result}")
`;
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handlePredictionSubmit = () => {
    if (!prediction.timeComplexity || !prediction.approach) {
      toast.warning('Please complete your prediction');
      return;
    }
    setPredictionSubmitted(true);
    setShowPredictionModal(false);
    setTimerActive(true);
    toast.info('[SYSTEM] Timer started. Good luck, Hunter.');
  };
  
  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);
    setTestResults([]);
    
    try {
      const res = await executionAPI.runCode({
        problemId,
        code,
        language: 'python'
      });
      
      const result = res.data?.data || res.data;
      setOutput(result);
      
      if (result.testResults) {
        setTestResults(result.testResults);
      }
    } catch (error) {
      setOutput({
        error: true,
        message: error.response?.data?.message || 'Execution failed',
        stderr: error.response?.data?.stderr || 'Unknown error'
      });
    }
    
    setIsRunning(false);
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setAttempts(prev => prev + 1);
    
    try {
      const res = await executionAPI.submitSolution({
        problemId,
        code,
        language: 'python',
        prediction: predictionSubmitted ? prediction : null,
        timeSpent: timer
      });
      
      const result = res.data?.data || res.data;
      
      if (result.allPassed) {
        setTimerActive(false);
        
        // Calculate XP based on performance
        let xp = problem?.xpReward || 100;
        if (attempts === 0) xp *= 1.5; // First try bonus
        if (timer < 300) xp *= 1.2; // Speed bonus (under 5 min)
        xp = Math.round(xp);
        
        setEarnedXP(xp);
        setShowCompletionModal(true);
        
        // Save progress
        await progressAPI.completeProblem(problemId, {
          code,
          timeSpent: timer,
          attempts: attempts + 1,
          prediction
        });
        
        addXP(xp);
        refreshUser();
        
        toast.success('[SYSTEM] Dungeon cleared!');
      } else {
        setTestResults(result.testResults || []);
        setOutput(result);
        toast.error('Some tests failed. Keep trying!');
      }
    } catch (error) {
      toast.error('Submission failed');
      setOutput({
        error: true,
        message: error.response?.data?.message || 'Submission failed'
      });
    }
    
    setIsSubmitting(false);
  };
  
  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };
  
  const timeComplexityOptions = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(2^n)'];
  const spaceComplexityOptions = ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'];
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-spin" />
            <span className="material-symbols-outlined text-3xl text-primary animate-pulse absolute inset-0 flex items-center justify-center">code_blocks</span>
          </div>
          <p className="text-gray-500 mt-6 font-mono text-sm">[SYSTEM] Loading autonomous mode...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[1800px] mx-auto h-[calc(100vh-120px)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 rounded-lg glass-panel flex items-center justify-center hover:bg-primary/20"
            >
              <span className="material-symbols-outlined text-primary">arrow_back</span>
            </button>
            <div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-mono">
                  PHASE 3 - AUTONOMOUS
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-sm text-gray-400">{problem?.category}</span>
              </div>
              <h1 className="text-xl font-bold mt-1">{problem?.title}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Timer */}
            <div className={`glass-panel px-4 py-2 rounded-lg flex items-center gap-2 ${
              timerActive ? 'border border-primary/50' : ''
            }`}>
              <span className={`material-symbols-outlined ${timerActive ? 'text-primary animate-pulse' : 'text-gray-500'}`}>
                timer
              </span>
              <span className={`font-mono ${timerActive ? 'text-primary' : 'text-gray-400'}`}>
                {formatTime(timer)}
              </span>
            </div>
            
            {/* Attempts */}
            <div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-400 text-sm">bolt</span>
              <span className="text-xs text-gray-400">Attempts: <span className="text-white">{attempts}</span></span>
            </div>
            
            {/* XP Reward */}
            <div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm">diamond</span>
              <span className="text-xs text-primary">+{problem?.xpReward || 100} XP</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
          {/* Left - Problem & Output */}
          <div className="flex flex-col gap-4 overflow-hidden">
            {/* Problem Description */}
            <div className="glass-panel rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-sm">description</span>
                <h3 className="text-sm text-gray-400 font-mono">DUNGEON OBJECTIVE</h3>
                <span className={`ml-auto text-xs px-2 py-1 rounded ${
                  problem?.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                  problem?.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {problem?.difficulty}
                </span>
              </div>
              <p className="text-gray-300 text-sm mb-4">{problem?.description}</p>
              
              {/* Constraints */}
              {problem?.constraints && (
                <div className="mt-3 p-3 bg-void/50 rounded-lg border border-gray-800">
                  <span className="text-xs text-gray-500">Constraints:</span>
                  <ul className="text-xs text-gray-400 mt-1 space-y-1">
                    {problem.constraints.map((c, idx) => (
                      <li key={idx}>• {c}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Examples */}
              {problem?.examples?.length > 0 && (
                <div className="mt-4 space-y-2">
                  <span className="text-xs text-gray-500">Examples:</span>
                  {problem.examples.slice(0, 2).map((ex, idx) => (
                    <div key={idx} className="bg-[#0D1117] rounded-lg p-3 font-mono text-xs">
                      <div className="text-cyan-400">Input: {JSON.stringify(ex.input)}</div>
                      <div className="text-green-400">Output: {JSON.stringify(ex.output)}</div>
                      {ex.explanation && (
                        <div className="text-gray-500 mt-1">Explanation: {ex.explanation}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Your Prediction */}
            {predictionSubmitted && (
              <div className="glass-panel rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-cyan-400 text-sm">psychology</span>
                  <h3 className="text-sm text-gray-400 font-mono">YOUR PREDICTION</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-gray-500">Time Complexity</span>
                    <p className="text-cyan-400 font-mono">{prediction.timeComplexity}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Space Complexity</span>
                    <p className="text-cyan-400 font-mono">{prediction.spaceComplexity || 'Not specified'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-gray-500">Approach</span>
                    <p className="text-gray-300">{prediction.approach}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Output & Test Results */}
            <div className="glass-panel rounded-xl p-5 flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">terminal</span>
                  <h3 className="text-sm text-gray-400 font-mono">OUTPUT</h3>
                </div>
                {testResults.length > 0 && (
                  <span className={`text-xs px-2 py-1 rounded ${
                    testResults.every(t => t.passed) 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {testResults.filter(t => t.passed).length}/{testResults.length} Passed
                  </span>
                )}
              </div>
              
              <div className="flex-1 bg-[#0D1117] rounded-lg p-4 overflow-auto font-mono text-sm">
                {isRunning || isSubmitting ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <span className="material-symbols-outlined">sync</span>
                    </motion.div>
                    <span>{isSubmitting ? 'Submitting...' : 'Running code...'}</span>
                  </div>
                ) : output ? (
                  <div className="space-y-3">
                    {output.error ? (
                      <div className="text-red-400">
                        <span className="text-red-500">Error: </span>
                        {output.message || output.stderr}
                      </div>
                    ) : (
                      <>
                        {output.stdout && (
                          <div>
                            <span className="text-gray-500">Output:</span>
                            <pre className="text-green-400 mt-1 whitespace-pre-wrap">{output.stdout}</pre>
                          </div>
                        )}
                        
                        {testResults.map((test, idx) => (
                          <div 
                            key={idx}
                            className={`p-3 rounded-lg border ${
                              test.passed 
                                ? 'border-green-500/30 bg-green-500/5' 
                                : 'border-red-500/30 bg-red-500/5'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`material-symbols-outlined text-sm ${
                                test.passed ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {test.passed ? 'check_circle' : 'cancel'}
                              </span>
                              <span className={test.passed ? 'text-green-400' : 'text-red-400'}>
                                Test Case {idx + 1}
                              </span>
                            </div>
                            {!test.passed && (
                              <div className="text-xs space-y-1">
                                <div><span className="text-gray-500">Input:</span> <span className="text-cyan-400">{JSON.stringify(test.input)}</span></div>
                                <div><span className="text-gray-500">Expected:</span> <span className="text-green-400">{JSON.stringify(test.expected)}</span></div>
                                <div><span className="text-gray-500">Got:</span> <span className="text-red-400">{JSON.stringify(test.actual)}</span></div>
                              </div>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-600 flex items-center gap-2">
                    <span className="material-symbols-outlined">code</span>
                    <span>Write your solution and run tests...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right - Code Editor */}
          <div className="flex flex-col gap-4 overflow-hidden">
            {/* Editor */}
            <div className="glass-panel rounded-xl overflow-hidden flex-1 flex flex-col">
              <div className="p-3 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-sm text-gray-400 font-mono">solution.py</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    FULL ACCESS
                  </span>
                  <span className="px-2 py-1 rounded bg-primary/20 text-primary text-xs">Python</span>
                </div>
              </div>
              
              <div className="flex-1">
                <Editor
                  height="100%"
                  language="python"
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  onMount={handleEditorMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    fontFamily: 'JetBrains Mono, Fira Code, monospace',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: true,
                    padding: { top: 16 },
                    renderLineHighlight: 'all',
                    automaticLayout: true
                  }}
                />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCode(getStarterCode(problem))}
                className="btn-system px-4 py-3 rounded-lg flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
                <span>Reset</span>
              </button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRunCode}
                disabled={isRunning || !predictionSubmitted}
                className="flex-1 py-3 rounded-lg btn-system font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isRunning ? (
                  <>
                    <motion.span 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="material-symbols-outlined"
                    >
                      sync
                    </motion.span>
                    Running...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">play_arrow</span>
                    Run Tests
                  </>
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isSubmitting || !predictionSubmitted}
                className="flex-1 py-3 rounded-lg btn-primary font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <motion.span 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="material-symbols-outlined"
                    >
                      sync
                    </motion.span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">send</span>
                    Submit Solution
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
        
        {/* Prediction Modal */}
        <AnimatePresence>
          {showPredictionModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-void/95 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="glass-panel-strong rounded-2xl p-8 max-w-lg w-full mx-4 border-2 border-primary/50"
              >
                <div className="text-center mb-6">
                  <span className="material-symbols-outlined text-5xl text-primary mb-3">psychology</span>
                  <h2 className="text-xl font-bold mb-2">[SYSTEM] Pre-Battle Analysis Required</h2>
                  <p className="text-sm text-gray-400">Before you begin, predict your approach.</p>
                </div>
                
                <div className="space-y-4">
                  {/* Time Complexity */}
                  <div>
                    <label className="text-xs text-gray-500 mb-2 block">Expected Time Complexity *</label>
                    <div className="flex flex-wrap gap-2">
                      {timeComplexityOptions.map(opt => (
                        <button
                          key={opt}
                          onClick={() => setPrediction(p => ({ ...p, timeComplexity: opt }))}
                          className={`px-3 py-2 rounded-lg text-sm transition-all ${
                            prediction.timeComplexity === opt
                              ? 'bg-primary/30 border border-primary text-primary'
                              : 'bg-void border border-gray-700 text-gray-400 hover:border-primary/50'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Space Complexity */}
                  <div>
                    <label className="text-xs text-gray-500 mb-2 block">Expected Space Complexity</label>
                    <div className="flex flex-wrap gap-2">
                      {spaceComplexityOptions.map(opt => (
                        <button
                          key={opt}
                          onClick={() => setPrediction(p => ({ ...p, spaceComplexity: opt }))}
                          className={`px-3 py-2 rounded-lg text-sm transition-all ${
                            prediction.spaceComplexity === opt
                              ? 'bg-primary/30 border border-primary text-primary'
                              : 'bg-void border border-gray-700 text-gray-400 hover:border-primary/50'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Approach */}
                  <div>
                    <label className="text-xs text-gray-500 mb-2 block">Describe Your Approach *</label>
                    <textarea
                      value={prediction.approach}
                      onChange={(e) => setPrediction(p => ({ ...p, approach: e.target.value }))}
                      placeholder="e.g., Use two pointers from both ends and swap elements..."
                      className="w-full h-24 px-4 py-3 rounded-lg bg-void border border-gray-700 text-white placeholder-gray-500 focus:border-primary focus:outline-none resize-none text-sm"
                    />
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePredictionSubmit}
                  className="w-full mt-6 py-4 rounded-xl btn-primary font-bold"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">play_arrow</span>
                    BEGIN DUNGEON
                  </span>
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Completion Modal */}
        <AnimatePresence>
          {showCompletionModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-void/95 flex items-center justify-center z-50"
            >
              {/* Shockwave effects */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{ duration: 1.5, repeat: 2, repeatDelay: 0.5 }}
                className="absolute w-40 h-40 border-4 border-primary rounded-full"
              />
              
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="glass-panel-strong rounded-2xl p-8 max-w-md w-full mx-4 text-center relative overflow-hidden"
              >
                {/* Background particles */}
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ y: '100%', x: `${Math.random() * 100}%`, opacity: 0 }}
                      animate={{ y: '-100%', opacity: [0, 1, 0] }}
                      transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
                      className="absolute w-1 h-1 bg-primary rounded-full"
                    />
                  ))}
                </div>
                
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 mx-auto mb-6 relative"
                  >
                    <div className="absolute inset-0 border-2 border-primary/30 rounded-full" />
                    <div className="absolute inset-2 border-2 border-primary/50 rounded-full" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-5xl text-primary">emoji_events</span>
                    </div>
                  </motion.div>
                  
                  <h2 className="text-2xl font-bold mb-2">[SYSTEM] DUNGEON CLEARED!</h2>
                  <p className="text-gray-400 mb-6">You have conquered this challenge.</p>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-3 bg-void rounded-lg">
                      <span className="text-xs text-gray-500">Time</span>
                      <p className="text-lg font-bold text-cyan-400">{formatTime(timer)}</p>
                    </div>
                    <div className="p-3 bg-void rounded-lg">
                      <span className="text-xs text-gray-500">Attempts</span>
                      <p className="text-lg font-bold text-yellow-400">{attempts}</p>
                    </div>
                    <div className="p-3 bg-void rounded-lg">
                      <span className="text-xs text-gray-500">XP Earned</span>
                      <p className="text-lg font-bold text-primary">+{earnedXP}</p>
                    </div>
                  </div>
                  
                  {/* Bonuses */}
                  <div className="space-y-2 mb-6">
                    {attempts === 1 && (
                      <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
                        <span className="material-symbols-outlined text-sm">star</span>
                        First Try Bonus!
                      </div>
                    )}
                    {timer < 300 && (
                      <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm">
                        <span className="material-symbols-outlined text-sm">bolt</span>
                        Speed Bonus!
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="flex-1 py-3 rounded-lg btn-system"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => navigate('/zones')}
                      className="flex-1 py-3 rounded-lg btn-primary font-bold"
                    >
                      Next Dungeon
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AutonomousCoding;
