import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { problemAPI, progressAPI } from '../services/api';
import { toast } from 'react-toastify';

const VisualLearning = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuthStore();
  
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animationStep, setAnimationStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showPrediction, setShowPrediction] = useState(false);
  const [userPrediction, setUserPrediction] = useState('');
  const [predictionResult, setPredictionResult] = useState(null);
  const [predictionsMade, setPredictionsMade] = useState([]);
  const [visualizationData, setVisualizationData] = useState(null);
  const [canProceed, setCanProceed] = useState(false);
  const animationRef = useRef(null);
  
  useEffect(() => {
    const loadProblem = async () => {
      try {
        const res = await problemAPI.getById(problemId, 'visualization');
        const data = res.data?.data || res.data;
        setProblem(data);
        initializeVisualization(data);
      } catch (error) {
        console.error('Problem load error:', error);
        toast.error('Failed to load problem');
        navigate('/dashboard');
      }
      setLoading(false);
    };
    loadProblem();
  }, [problemId, navigate]);
  
  const initializeVisualization = (prob) => {
    // Generate visualization steps based on problem type
    const testCase = prob.testCases?.[0] || { input: [1, 2, 3, 4, 5], expected: [5, 4, 3, 2, 1] };
    const category = prob.category?.toLowerCase() || 'arrays';
    
    let steps = [];
    
    if (category === 'arrays') {
      // Array visualization with pointer movements
      const arr = parseInput(testCase.input);
      steps = generateArraySteps(arr, prob.title);
    } else if (category === 'stacks') {
      steps = generateStackSteps(testCase);
    } else if (category === 'recursion') {
      steps = generateRecursionSteps(testCase);
    } else if (category === 'binary-trees') {
      steps = generateTreeSteps(testCase);
    } else {
      steps = generateGenericSteps(testCase);
    }
    
    // Add prediction checkpoints at key steps
    const checkpoints = [
      Math.floor(steps.length * 0.3),
      Math.floor(steps.length * 0.6),
      Math.floor(steps.length * 0.9)
    ];
    
    steps = steps.map((step, idx) => ({
      ...step,
      hasPrediction: checkpoints.includes(idx),
      stepNumber: idx + 1,
      totalSteps: steps.length
    }));
    
    setVisualizationData({ steps, checkpoints });
  };
  
  const parseInput = (input) => {
    if (Array.isArray(input)) return input;
    if (typeof input === 'string') {
      try { return JSON.parse(input); } catch { return input.split(',').map(x => x.trim()); }
    }
    return [input];
  };
  
  const generateArraySteps = (arr, title) => {
    const steps = [];
    const workingArr = [...arr];
    
    // Initial state
    steps.push({
      type: 'init',
      description: 'Initialize array',
      array: [...workingArr],
      highlights: [],
      pointers: {},
      explanation: 'This is our starting array. We need to solve the problem by manipulating these elements.',
      code: 'arr = [' + workingArr.join(', ') + ']'
    });
    
    if (title.toLowerCase().includes('reverse')) {
      // Reverse array visualization
      let left = 0, right = workingArr.length - 1;
      
      steps.push({
        type: 'setup',
        description: 'Set up two pointers',
        array: [...workingArr],
        highlights: [0, workingArr.length - 1],
        pointers: { left: 0, right: workingArr.length - 1 },
        explanation: 'We use two pointers: one at the start (left) and one at the end (right).',
        code: 'left, right = 0, len(arr) - 1'
      });
      
      while (left < right) {
        steps.push({
          type: 'compare',
          description: `Compare elements at positions ${left} and ${right}`,
          array: [...workingArr],
          highlights: [left, right],
          pointers: { left, right },
          explanation: `Checking elements: arr[${left}] = ${workingArr[left]}, arr[${right}] = ${workingArr[right]}`,
          code: `# arr[${left}] = ${workingArr[left]}, arr[${right}] = ${workingArr[right]}`
        });
        
        // Swap
        [workingArr[left], workingArr[right]] = [workingArr[right], workingArr[left]];
        
        steps.push({
          type: 'swap',
          description: `Swap elements`,
          array: [...workingArr],
          highlights: [left, right],
          pointers: { left, right },
          explanation: `Swapped! Now arr[${left}] = ${workingArr[left]}, arr[${right}] = ${workingArr[right]}`,
          code: `arr[${left}], arr[${right}] = arr[${right}], arr[${left}]`
        });
        
        left++;
        right--;
        
        if (left < right) {
          steps.push({
            type: 'move',
            description: 'Move pointers inward',
            array: [...workingArr],
            highlights: [left, right],
            pointers: { left, right },
            explanation: 'Move left pointer forward, right pointer backward.',
            code: 'left += 1; right -= 1'
          });
        }
      }
    } else {
      // Generic array traversal
      for (let i = 0; i < Math.min(workingArr.length, 5); i++) {
        steps.push({
          type: 'traverse',
          description: `Visit index ${i}`,
          array: [...workingArr],
          highlights: [i],
          pointers: { i },
          explanation: `Processing element at index ${i}: value = ${workingArr[i]}`,
          code: `for i in range(len(arr)):  # i = ${i}`
        });
      }
    }
    
    steps.push({
      type: 'complete',
      description: 'Algorithm complete',
      array: [...workingArr],
      highlights: [],
      pointers: {},
      explanation: 'The algorithm has finished. Final result is ready.',
      code: 'return arr'
    });
    
    return steps;
  };
  
  const generateStackSteps = (testCase) => {
    const steps = [];
    const stack = [];
    const input = parseInput(testCase.input);
    
    steps.push({
      type: 'init',
      description: 'Initialize empty stack',
      stack: [],
      highlights: [],
      explanation: 'We start with an empty stack (LIFO - Last In First Out).',
      code: 'stack = []'
    });
    
    input.slice(0, 6).forEach((item, idx) => {
      stack.push(item);
      steps.push({
        type: 'push',
        description: `Push ${item} onto stack`,
        stack: [...stack],
        highlights: [stack.length - 1],
        explanation: `Adding ${item} to the top of the stack.`,
        code: `stack.append(${typeof item === 'string' ? `'${item}'` : item})`
      });
    });
    
    if (stack.length > 0) {
      const popped = stack.pop();
      steps.push({
        type: 'pop',
        description: `Pop ${popped} from stack`,
        stack: [...stack],
        highlights: [],
        explanation: `Removing ${popped} from the top of the stack (LIFO).`,
        code: `top = stack.pop()  # ${popped}`
      });
    }
    
    return steps;
  };
  
  const generateRecursionSteps = (testCase) => {
    const steps = [];
    const n = parseInt(parseInput(testCase.input)[0]) || 5;
    
    const generateRecursiveCalls = (depth, value) => {
      if (depth > 4 || value <= 1) return;
      
      steps.push({
        type: 'call',
        description: `Recursive call: f(${value})`,
        callStack: steps.filter(s => s.type === 'call').map(s => s.value).concat(value),
        depth,
        value,
        explanation: `Entering recursive call with n = ${value}. Depth: ${depth}`,
        code: `def f(${value}):  # call depth ${depth}`
      });
      
      if (value <= 1) {
        steps.push({
          type: 'base',
          description: 'Base case reached',
          callStack: steps.filter(s => s.type === 'call').map(s => s.value),
          depth,
          value,
          explanation: 'Base case! Stop recursion and return.',
          code: `if n <= 1: return ${value}`
        });
      } else {
        generateRecursiveCalls(depth + 1, value - 1);
        
        steps.push({
          type: 'return',
          description: `Return from f(${value})`,
          callStack: steps.filter(s => s.type === 'call').slice(0, -1).map(s => s.value),
          depth,
          value,
          explanation: `Returning from f(${value}). Unwinding call stack.`,
          code: `return result  # from f(${value})`
        });
      }
    };
    
    generateRecursiveCalls(1, Math.min(n, 5));
    
    return steps;
  };
  
  const generateTreeSteps = (testCase) => {
    const steps = [];
    // Simplified tree traversal visualization
    const treeValues = [1, 2, 3, 4, 5, 6, 7];
    
    steps.push({
      type: 'init',
      description: 'Initialize binary tree',
      tree: treeValues,
      currentNode: null,
      visited: [],
      explanation: 'A binary tree where each node has at most 2 children.',
      code: '# Tree structure initialized'
    });
    
    // Simulate inorder traversal
    const visited = [];
    const traverse = (idx, path) => {
      if (idx >= treeValues.length) return;
      
      steps.push({
        type: 'visit',
        description: `Visit node ${treeValues[idx]}`,
        tree: treeValues,
        currentNode: idx,
        visited: [...visited],
        explanation: `Currently at node with value ${treeValues[idx]}.`,
        code: `# Visiting node: ${treeValues[idx]}`
      });
      
      visited.push(idx);
    };
    
    [0, 1, 3, 4, 2, 5, 6].slice(0, 5).forEach(idx => traverse(idx, []));
    
    return steps;
  };
  
  const generateGenericSteps = (testCase) => {
    return [{
      type: 'init',
      description: 'Starting algorithm',
      explanation: 'Beginning the algorithm visualization.',
      code: '# Algorithm starts'
    }];
  };
  
  // Playback controls
  useEffect(() => {
    if (isPlaying && visualizationData) {
      const step = visualizationData.steps[animationStep];
      
      if (step?.hasPrediction && !predictionsMade.includes(animationStep)) {
        setIsPlaying(false);
        setShowPrediction(true);
        return;
      }
      
      animationRef.current = setTimeout(() => {
        if (animationStep < visualizationData.steps.length - 1) {
          setAnimationStep(prev => prev + 1);
        } else {
          setIsPlaying(false);
          checkCompletion();
        }
      }, 1500 / playbackSpeed);
    }
    
    return () => clearTimeout(animationRef.current);
  }, [isPlaying, animationStep, playbackSpeed, visualizationData, predictionsMade]);
  
  const checkCompletion = () => {
    const requiredPredictions = visualizationData?.checkpoints?.length || 3;
    const correctPredictions = predictionsMade.filter(p => p.correct).length;
    
    if (predictionsMade.length >= requiredPredictions && correctPredictions >= Math.ceil(requiredPredictions / 2)) {
      setCanProceed(true);
      toast.success('Phase 1 Complete! Guided coding unlocked.');
    }
  };
  
  const handlePrediction = () => {
    const currentStep = visualizationData.steps[animationStep];
    // Simple prediction validation (in real app, this would be more sophisticated)
    const isCorrect = userPrediction.toLowerCase().includes('swap') || 
                      userPrediction.toLowerCase().includes('move') ||
                      userPrediction.length > 10;
    
    setPredictionResult({
      correct: isCorrect,
      message: isCorrect 
        ? 'Correct! Your understanding is growing.' 
        : 'Not quite. Watch the visualization carefully.'
    });
    
    setPredictionsMade(prev => [...prev, { step: animationStep, correct: isCorrect }]);
    
    setTimeout(() => {
      setShowPrediction(false);
      setPredictionResult(null);
      setUserPrediction('');
      setIsPlaying(true);
    }, 2000);
  };
  
  const handleProceedToGuided = async () => {
    try {
      // Use zone from problem data
      const zone = problem?.zone || 'arrays';
      await progressAPI.completeVisualization(zone);
      refreshUser();
      navigate(`/guided/${problemId}`);
    } catch (error) {
      console.error('Progress save error:', error);
      // Still allow navigation even if progress save fails
      navigate(`/guided/${problemId}`);
    }
  };
  
  const currentStep = visualizationData?.steps?.[animationStep];
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-spin" />
            <span className="material-symbols-outlined text-3xl text-primary animate-pulse absolute inset-0 flex items-center justify-center">visibility</span>
          </div>
          <p className="text-gray-500 mt-6 font-mono text-sm">[SYSTEM] Loading visualization...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 rounded-lg glass-panel flex items-center justify-center hover:bg-primary/20"
            >
              <span className="material-symbols-outlined text-primary">arrow_back</span>
            </button>
            <div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-mono">
                  PHASE 1 - VISUALIZATION
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-sm text-gray-400">{problem?.category}</span>
              </div>
              <h1 className="text-2xl font-bold mt-1">{problem?.title}</h1>
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center gap-4">
            <div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-3">
              <span className="text-xs text-gray-500">Predictions:</span>
              <span className="text-primary font-bold">{predictionsMade.filter(p => p.correct).length}/{visualizationData?.checkpoints?.length || 3}</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Visualization Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visualization Canvas */}
            <div className="glass-panel-strong rounded-2xl p-8 min-h-[400px] relative overflow-hidden">
              {/* Background grid */}
              <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'linear-gradient(to right, #8B5CF6 1px, transparent 1px), linear-gradient(to bottom, #8B5CF6 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }} />
              
              <div className="relative">
                {/* Step description */}
                <div className="text-center mb-8">
                  <motion.div
                    key={animationStep}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30"
                  >
                    <span className="text-xs text-gray-400">Step {animationStep + 1}/{visualizationData?.steps?.length || 0}</span>
                    <span className="text-primary font-mono">{currentStep?.description}</span>
                  </motion.div>
                </div>
                
                {/* Array Visualization */}
                {currentStep?.array && (
                  <div className="flex justify-center items-end gap-3 my-8">
                    {currentStep.array.map((val, idx) => (
                      <motion.div
                        key={idx}
                        layout
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ 
                          scale: 1, 
                          opacity: 1,
                          y: currentStep.highlights?.includes(idx) ? -10 : 0
                        }}
                        transition={{ duration: 0.3 }}
                        className={`
                          relative w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold
                          transition-all duration-300
                          ${currentStep.highlights?.includes(idx) 
                            ? 'bg-primary/30 border-2 border-primary shadow-neon' 
                            : 'bg-void/80 border border-gray-700'
                          }
                        `}
                      >
                        {val}
                        {/* Index label */}
                        <span className="absolute -bottom-6 text-xs text-gray-500">{idx}</span>
                        {/* Pointer labels */}
                        {Object.entries(currentStep.pointers || {}).map(([name, pos]) => (
                          pos === idx && (
                            <motion.span 
                              key={name}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-8 px-2 py-1 rounded bg-primary/20 text-primary text-xs font-mono"
                            >
                              {name}
                            </motion.span>
                          )
                        ))}
                      </motion.div>
                    ))}
                  </div>
                )}
                
                {/* Stack Visualization */}
                {currentStep?.stack && (
                  <div className="flex flex-col-reverse items-center gap-2 my-8">
                    {currentStep.stack.map((val, idx) => (
                      <motion.div
                        key={idx}
                        layout
                        initial={{ scale: 0.8, x: -50, opacity: 0 }}
                        animate={{ scale: 1, x: 0, opacity: 1 }}
                        exit={{ scale: 0.8, x: 50, opacity: 0 }}
                        className={`
                          w-32 h-12 rounded-lg flex items-center justify-center font-bold
                          ${currentStep.highlights?.includes(idx)
                            ? 'bg-primary/30 border-2 border-primary'
                            : 'bg-void/80 border border-gray-700'
                          }
                        `}
                      >
                        {val}
                      </motion.div>
                    ))}
                    <div className="w-40 h-4 bg-gray-800 rounded mt-2">
                      <span className="text-xs text-gray-500 block text-center mt-2">Stack Bottom</span>
                    </div>
                  </div>
                )}
                
                {/* Recursion Call Stack Visualization */}
                {currentStep?.callStack && (
                  <div className="flex flex-col items-center gap-2 my-8">
                    <p className="text-xs text-gray-500 mb-4">Call Stack</p>
                    {currentStep.callStack.map((val, idx) => (
                      <motion.div
                        key={idx}
                        layout
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`
                          px-6 py-3 rounded-lg font-mono
                          ${idx === currentStep.callStack.length - 1
                            ? 'bg-primary/30 border-2 border-primary'
                            : 'bg-void/80 border border-gray-700'
                          }
                        `}
                      >
                        f({val})
                      </motion.div>
                    ))}
                  </div>
                )}
                
                {/* Explanation text */}
                <motion.div
                  key={`exp-${animationStep}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center mt-8 p-4 rounded-lg bg-void/50 border border-gray-800"
                >
                  <p className="text-gray-300">{currentStep?.explanation}</p>
                </motion.div>
              </div>
            </div>
            
            {/* Playback Controls */}
            <div className="glass-panel rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAnimationStep(0)}
                    className="w-10 h-10 rounded-lg bg-void flex items-center justify-center hover:bg-primary/20 transition-colors"
                    disabled={isPlaying}
                  >
                    <span className="material-symbols-outlined text-gray-400">skip_previous</span>
                  </button>
                  <button
                    onClick={() => setAnimationStep(Math.max(0, animationStep - 1))}
                    className="w-10 h-10 rounded-lg bg-void flex items-center justify-center hover:bg-primary/20 transition-colors"
                    disabled={isPlaying || animationStep === 0}
                  >
                    <span className="material-symbols-outlined text-gray-400">fast_rewind</span>
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors border border-primary/50"
                  >
                    <span className="material-symbols-outlined text-primary text-3xl">
                      {isPlaying ? 'pause' : 'play_arrow'}
                    </span>
                  </button>
                  <button
                    onClick={() => setAnimationStep(Math.min((visualizationData?.steps?.length || 1) - 1, animationStep + 1))}
                    className="w-10 h-10 rounded-lg bg-void flex items-center justify-center hover:bg-primary/20 transition-colors"
                    disabled={isPlaying || animationStep === (visualizationData?.steps?.length || 1) - 1}
                  >
                    <span className="material-symbols-outlined text-gray-400">fast_forward</span>
                  </button>
                  <button
                    onClick={() => setAnimationStep((visualizationData?.steps?.length || 1) - 1)}
                    className="w-10 h-10 rounded-lg bg-void flex items-center justify-center hover:bg-primary/20 transition-colors"
                    disabled={isPlaying}
                  >
                    <span className="material-symbols-outlined text-gray-400">skip_next</span>
                  </button>
                </div>
                
                {/* Progress bar */}
                <div className="flex-1 mx-6">
                  <div className="h-2 bg-void rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-cyan-500"
                      style={{ width: `${((animationStep + 1) / (visualizationData?.steps?.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>
                
                {/* Speed control */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Speed:</span>
                  {[0.5, 1, 1.5, 2].map(speed => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        playbackSpeed === speed 
                          ? 'bg-primary/30 text-primary' 
                          : 'bg-void text-gray-400 hover:bg-primary/10'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Panel - Code Display (Locked) & Info */}
          <div className="space-y-6">
            {/* Locked Code Panel */}
            <div className="glass-panel rounded-2xl overflow-hidden relative">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-500">code</span>
                  <span className="text-sm text-gray-400">Python Code</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30">
                  <span className="material-symbols-outlined text-red-400 text-sm">lock</span>
                  <span className="text-xs text-red-400 font-mono">LOCKED BY SYSTEM</span>
                </div>
              </div>
              
              <div className="p-4 bg-[#0D1117] relative">
                {/* Blur overlay */}
                <div className="absolute inset-0 backdrop-blur-md bg-void/50 flex items-center justify-center z-10">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-5xl text-primary/50 mb-3">lock</span>
                    <p className="text-sm text-gray-500 font-mono">[SYSTEM]</p>
                    <p className="text-xs text-gray-600">CODE ACCESS LOCKED</p>
                    <p className="text-xs text-gray-600 mt-2">Complete visualization to unlock</p>
                  </div>
                </div>
                
                {/* Blurred code preview */}
                <pre className="font-mono text-xs text-gray-400 filter blur-sm select-none">
{`def solve(arr):
    # Solution code
    left, right = 0, len(arr) - 1
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1
    return arr`}
                </pre>
              </div>
            </div>
            
            {/* Current Code Step */}
            <div className="glass-panel rounded-2xl p-4">
              <h3 className="text-xs text-gray-500 font-mono mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">terminal</span>
                CURRENT LINE
              </h3>
              <div className="bg-[#0D1117] rounded-lg p-4">
                <code className="font-mono text-sm text-cyan-400">
                  {currentStep?.code || '# Waiting...'}
                </code>
              </div>
            </div>
            
            {/* Problem Info */}
            <div className="glass-panel rounded-2xl p-4">
              <h3 className="text-xs text-gray-500 font-mono mb-3">PROBLEM INFO</h3>
              <p className="text-sm text-gray-400 mb-4">{problem?.description}</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Difficulty</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    problem?.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                    problem?.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {problem?.difficulty}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">XP Reward</span>
                  <span className="text-xs text-primary">+{problem?.xpReward || 50} XP</span>
                </div>
              </div>
            </div>
            
            {/* Proceed Button */}
            {canProceed && (
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleProceedToGuided}
                className="w-full py-4 rounded-xl btn-primary font-bold flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined">arrow_forward</span>
                PROCEED TO GUIDED CODING
              </motion.button>
            )}
          </div>
        </div>
        
        {/* Prediction Modal */}
        <AnimatePresence>
          {showPrediction && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-void/90 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="glass-panel-strong rounded-2xl p-8 max-w-md w-full mx-4 border-2 border-primary/50"
              >
                <div className="text-center mb-6">
                  <span className="material-symbols-outlined text-5xl text-primary mb-4">psychology</span>
                  <h2 className="text-xl font-bold mb-2">[SYSTEM] Prediction Checkpoint</h2>
                  <p className="text-sm text-gray-400">What do you think happens next?</p>
                </div>
                
                {!predictionResult ? (
                  <>
                    <textarea
                      value={userPrediction}
                      onChange={(e) => setUserPrediction(e.target.value)}
                      placeholder="Describe what you think the next step will be..."
                      className="w-full h-32 px-4 py-3 rounded-lg bg-void border border-gray-700 text-white placeholder-gray-500 focus:border-primary focus:outline-none resize-none mb-4"
                    />
                    <button
                      onClick={handlePrediction}
                      disabled={!userPrediction.trim()}
                      className="w-full py-3 rounded-lg btn-primary font-bold disabled:opacity-50"
                    >
                      Submit Prediction
                    </button>
                  </>
                ) : (
                  <div className={`text-center p-6 rounded-lg ${
                    predictionResult.correct ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
                  }`}>
                    <span className={`material-symbols-outlined text-4xl ${
                      predictionResult.correct ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {predictionResult.correct ? 'check_circle' : 'cancel'}
                    </span>
                    <p className={`mt-2 ${predictionResult.correct ? 'text-green-400' : 'text-red-400'}`}>
                      {predictionResult.message}
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VisualLearning;
