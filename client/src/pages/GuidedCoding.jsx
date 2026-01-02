import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { useAuthStore } from '../store/authStore';
import { problemAPI, executionAPI, progressAPI } from '../services/api';
import { toast } from 'react-toastify';

const GuidedCoding = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuthStore();
  const editorRef = useRef(null);
  
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [skeletonCode, setSkeletonCode] = useState('');
  const [editableLines, setEditableLines] = useState([]);
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [canProceed, setCanProceed] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  useEffect(() => {
    const loadProblem = async () => {
      try {
        const res = await problemAPI.getById(problemId, 'guided');
        const data = res.data?.data || res.data;
        setProblem(data);
        initializeGuidedCode(data);
      } catch (error) {
        console.error('Problem load error:', error);
        toast.error('Failed to load problem');
        navigate('/dashboard');
      }
      setLoading(false);
    };
    loadProblem();
  }, [problemId, navigate]);
  
  const initializeGuidedCode = (prob) => {
    // Generate skeleton code with locked sections
    const category = prob.category?.toLowerCase() || 'arrays';
    let skeleton = '';
    let editable = [];
    
    if (category === 'arrays' && prob.title?.toLowerCase().includes('reverse')) {
      skeleton = `# [SYSTEM] GUIDED MODE - Only highlighted lines are editable
# Problem: ${prob.title}

def reverse_array(arr):
    """
    Reverse the array in-place using two pointers.
    Time: O(n), Space: O(1)
    """
    # Initialize pointers
    left = ___  # TODO: Set left pointer starting position
    right = ___  # TODO: Set right pointer starting position
    
    # Swap until pointers meet
    while ___:  # TODO: Loop condition
        # Swap elements
        arr[left], arr[right] = ___  # TODO: Complete the swap
        
        # Move pointers
        left += ___  # TODO: Update left pointer
        right -= ___  # TODO: Update right pointer
    
    return arr

# Test your solution
if __name__ == "__main__":
    test_arr = [1, 2, 3, 4, 5]
    print(f"Original: {test_arr}")
    result = reverse_array(test_arr.copy())
    print(f"Reversed: {result}")`;
      editable = [10, 11, 14, 16, 19, 20]; // Line numbers that are editable (1-indexed)
    } else if (category === 'stacks') {
      skeleton = `# [SYSTEM] GUIDED MODE - Only highlighted lines are editable
# Problem: ${prob.title}

def is_valid_parentheses(s):
    """
    Check if parentheses string is valid.
    Time: O(n), Space: O(n)
    """
    # Initialize stack
    stack = ___  # TODO: Initialize empty stack
    
    # Mapping of closing to opening brackets
    mapping = {')': '(', '}': '{', ']': '['}
    
    for char in s:
        if char in mapping:
            # Pop element or use dummy
            top = ___  # TODO: Pop from stack (handle empty case)
            
            # Check if matching
            if ___:  # TODO: Compare with mapping
                return False
        else:
            # Push opening bracket
            ___  # TODO: Push to stack
    
    return ___  # TODO: Final check

# Test
if __name__ == "__main__":
    test_cases = ["()", "()[]{}", "(]", "([)]"]
    for tc in test_cases:
        print(f"{tc}: {is_valid_parentheses(tc)}")`;
      editable = [10, 18, 21, 24, 26];
    } else {
      // Generic skeleton
      skeleton = `# [SYSTEM] GUIDED MODE - Only highlighted lines are editable
# Problem: ${prob.title}

def solve(input_data):
    """
    Solve the problem.
    """
    result = ___  # TODO: Initialize result
    
    # Process input
    for item in input_data:
        # TODO: Your logic here
        ___
    
    return ___  # TODO: Return result

# Test
if __name__ == "__main__":
    print(solve([1, 2, 3, 4, 5]))`;
      editable = [8, 13, 15];
    }
    
    setSkeletonCode(skeleton);
    setCode(skeleton);
    setEditableLines(editable);
  };
  
  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Configure editor for locked lines
    editor.onDidChangeModelContent((e) => {
      const model = editor.getModel();
      if (!model) return;
      
      // Check if change is in locked area
      e.changes.forEach(change => {
        const lineNumber = change.range.startLineNumber;
        if (!editableLines.includes(lineNumber) && change.text !== '') {
          // Revert unauthorized changes - this is simplified
          // In production, you'd use decorations and more sophisticated locking
        }
      });
    });
    
    // Add decorations for editable lines
    const decorations = editableLines.map(line => ({
      range: new monaco.Range(line, 1, line, 1),
      options: {
        isWholeLine: true,
        className: 'editable-line-decoration',
        glyphMarginClassName: 'editable-line-glyph',
        linesDecorationsClassName: 'editable-line-decoration-margin'
      }
    }));
    
    editor.deltaDecorations([], decorations);
  };
  
  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);
    setTestResults([]);
    setAttempts(prev => prev + 1);
    
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
        
        const allPassed = result.testResults.every(t => t.passed);
        if (allPassed) {
          setCanProceed(true);
          setShowSuccessModal(true);
          toast.success('All tests passed! Phase 2 Complete!');
        }
      }
    } catch (error) {
      setOutput({
        error: true,
        message: error.response?.data?.message || 'Execution failed',
        stderr: error.response?.data?.stderr || 'Unknown error'
      });
      toast.error('Code execution failed');
    }
    
    setIsRunning(false);
  };
  
  const hints = problem?.hints || [
    'Think about the base cases first.',
    'Consider the loop termination condition.',
    'Make sure to update both pointers.',
    'Check for edge cases like empty input.'
  ];
  
  const handleProceedToAutonomous = async () => {
    try {
      const zone = problem?.zone || 'arrays';
      await progressAPI.completeGuided(zone);
      refreshUser();
      navigate(`/autonomous/${problemId}`);
    } catch (error) {
      console.error('Progress save error:', error);
      // Still allow navigation even if progress save fails
      navigate(`/autonomous/${problemId}`);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-spin" />
            <span className="material-symbols-outlined text-3xl text-primary animate-pulse absolute inset-0 flex items-center justify-center">code</span>
          </div>
          <p className="text-gray-500 mt-6 font-mono text-sm">[SYSTEM] Loading guided mode...</p>
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
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-mono">
                  PHASE 2 - GUIDED CODING
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-sm text-gray-400">{problem?.category}</span>
              </div>
              <h1 className="text-xl font-bold mt-1">{problem?.title}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-400 text-sm">warning</span>
              <span className="text-xs text-gray-400">Attempts: <span className="text-white">{attempts}</span></span>
            </div>
            <button
              onClick={() => setShowHint(true)}
              className="btn-system px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">lightbulb</span>
              <span className="text-sm">Hint</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
          {/* Left - Problem & Tests */}
          <div className="flex flex-col gap-4 overflow-hidden">
            {/* Problem Description */}
            <div className="glass-panel rounded-xl p-5 flex-shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-sm">description</span>
                <h3 className="text-sm text-gray-400 font-mono">PROBLEM</h3>
              </div>
              <p className="text-gray-300 text-sm">{problem?.description}</p>
              
              {problem?.examples?.length > 0 && (
                <div className="mt-4 space-y-2">
                  <span className="text-xs text-gray-500">Example:</span>
                  {problem.examples.slice(0, 2).map((ex, idx) => (
                    <div key={idx} className="bg-void/50 rounded-lg p-3 font-mono text-xs">
                      <div className="text-cyan-400">Input: {JSON.stringify(ex.input)}</div>
                      <div className="text-green-400">Output: {JSON.stringify(ex.output)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Instructions */}
            <div className="glass-panel rounded-xl p-5 flex-shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-sm">info</span>
                <h3 className="text-sm text-gray-400 font-mono">GUIDED MODE INSTRUCTIONS</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-start gap-2">
                  <span className="text-primary">1.</span>
                  <span>Lines highlighted in <span className="text-primary">violet</span> are editable</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">2.</span>
                  <span>Replace <code className="text-yellow-400">___</code> with your solution</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">3.</span>
                  <span>Locked lines contain the algorithm structure</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">4.</span>
                  <span>Run code to test your solution</span>
                </div>
              </div>
            </div>
            
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
                {isRunning ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <span className="material-symbols-outlined">sync</span>
                    </motion.div>
                    <span>Running code...</span>
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
                            <div className="text-xs space-y-1">
                              <div><span className="text-gray-500">Input:</span> <span className="text-cyan-400">{JSON.stringify(test.input)}</span></div>
                              <div><span className="text-gray-500">Expected:</span> <span className="text-green-400">{JSON.stringify(test.expected)}</span></div>
                              <div><span className="text-gray-500">Got:</span> <span className={test.passed ? 'text-green-400' : 'text-red-400'}>{JSON.stringify(test.actual)}</span></div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-600 flex items-center gap-2">
                    <span className="material-symbols-outlined">play_arrow</span>
                    <span>Run your code to see output...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right - Code Editor */}
          <div className="flex flex-col gap-4 overflow-hidden">
            {/* Editor Header */}
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
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Language:</span>
                  <span className="px-2 py-1 rounded bg-primary/20 text-primary text-xs">Python</span>
                </div>
              </div>
              
              {/* Monaco Editor */}
              <div className="flex-1 relative">
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
                    glyphMargin: true,
                    folding: false,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    padding: { top: 16 },
                    renderLineHighlight: 'all',
                    scrollbar: {
                      vertical: 'auto',
                      horizontal: 'auto'
                    }
                  }}
                />
                
                {/* Editable lines legend */}
                <div className="absolute bottom-4 right-4 glass-panel rounded-lg px-3 py-2 flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-primary/50" />
                  <span className="text-xs text-gray-400">Editable Line</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCode(skeletonCode)}
                className="btn-system px-4 py-3 rounded-lg flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
                <span>Reset Code</span>
              </button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRunCode}
                disabled={isRunning}
                className="flex-1 py-3 rounded-lg btn-primary font-bold flex items-center justify-center gap-2 disabled:opacity-50"
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
                    Run Code
                  </>
                )}
              </motion.button>
              
              {canProceed && (
                <motion.button
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={handleProceedToAutonomous}
                  className="px-6 py-3 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400 font-bold flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">arrow_forward</span>
                  Next Phase
                </motion.button>
              )}
            </div>
          </div>
        </div>
        
        {/* Hint Modal */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-void/90 flex items-center justify-center z-50"
              onClick={() => setShowHint(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
                className="glass-panel-strong rounded-2xl p-6 max-w-md w-full mx-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-yellow-400">lightbulb</span>
                    <h2 className="font-bold">Hint {currentHint + 1}/{hints.length}</h2>
                  </div>
                  <button
                    onClick={() => setShowHint(false)}
                    className="w-8 h-8 rounded-lg bg-void flex items-center justify-center hover:bg-primary/20"
                  >
                    <span className="material-symbols-outlined text-gray-400">close</span>
                  </button>
                </div>
                
                <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30 mb-4">
                  <p className="text-gray-300">{hints[currentHint]}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentHint(Math.max(0, currentHint - 1))}
                    disabled={currentHint === 0}
                    className="btn-system px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentHint(Math.min(hints.length - 1, currentHint + 1))}
                    disabled={currentHint === hints.length - 1}
                    className="btn-system px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    Next Hint
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Success Modal */}
        <AnimatePresence>
          {showSuccessModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-void/90 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                {/* Shockwave effect */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 1 }}
                  animate={{ scale: 3, opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="absolute inset-0 border-4 border-primary rounded-full"
                />
                
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="glass-panel-strong rounded-2xl p-8 max-w-md"
                >
                  <span className="material-symbols-outlined text-6xl text-green-400 mb-4">check_circle</span>
                  <h2 className="text-2xl font-bold mb-2">[SYSTEM] Phase 2 Complete!</h2>
                  <p className="text-gray-400 mb-6">You've mastered the guided coding phase.</p>
                  
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/30 mb-6">
                    <p className="text-sm text-primary">+{problem?.xpReward || 50} XP earned</p>
                  </div>
                  
                  <button
                    onClick={handleProceedToAutonomous}
                    className="w-full py-3 rounded-lg btn-primary font-bold"
                  >
                    Proceed to Autonomous Mode
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Custom styles for editable lines */}
      <style>{`
        .editable-line-decoration {
          background: rgba(139, 92, 246, 0.1) !important;
          border-left: 3px solid #8B5CF6 !important;
        }
        .editable-line-glyph {
          background: #8B5CF6;
          border-radius: 2px;
          margin-left: 3px;
        }
      `}</style>
    </div>
  );
};

export default GuidedCoding;
