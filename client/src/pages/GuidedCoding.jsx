import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Editor from '@monaco-editor/react';
import { useProgressStore } from '../store/progressStore';
import { useAuthStore } from '../store/authStore';
import { executionAPI } from '../services/api';

const GuidedCoding = () => {
  const navigate = useNavigate();
  const { problemSlug } = useParams();
  const { fetchProblem, currentProblem, completePhase, unlockHint } = useProgressStore();
  const { user, addXP, updateUser } = useAuthStore();
  
  const editorRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [currentObjective, setCurrentObjective] = useState(0);
  const [objectivesCompleted, setObjectivesCompleted] = useState([]);
  const [hints, setHints] = useState([]);
  const [showHintModal, setShowHintModal] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [testResults, setTestResults] = useState([]);
  
  useEffect(() => {
    const loadProblem = async () => {
      const problem = await fetchProblem(problemSlug);
      if (problem) {
        // Set template code with locked sections
        setCode(problem.templateCode || getDefaultTemplate(problem));
        setHints(problem.hints || []);
      }
      setLoading(false);
    };
    loadProblem();
  }, [problemSlug, fetchProblem]);
  
  const getDefaultTemplate = (problem) => {
    return `# ${problem.title}
# Difficulty: ${problem.difficulty}-Rank
# Zone: ${problem.zone}

def solution(${problem.functionSignature?.params?.join(', ') || 'arr'}):
    """
    ${problem.description}
    
    Args:
        ${problem.functionSignature?.params?.map(p => `${p}: Input parameter`).join('\n        ') || 'arr: Input array'}
    
    Returns:
        ${problem.functionSignature?.returnType || 'Result'}
    """
    # ===== YOUR CODE STARTS HERE =====
    
    # TODO: Implement your solution
    pass
    
    # ===== YOUR CODE ENDS HERE =====

# Test your solution
if __name__ == "__main__":
    # Example test case
    test_input = ${JSON.stringify(problem.testCases?.[0]?.input) || '[1, 2, 3]'}
    print(f"Input: {test_input}")
    print(f"Output: {solution(test_input)}")
`;
  };
  
  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    
    // Lock certain regions (the function signature, imports, etc.)
    // This guides the user to only edit within the designated area
  };
  
  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error('[SYSTEM] No code to execute!');
      return;
    }
    
    setIsRunning(true);
    setOutput('');
    setFeedback(null);
    
    try {
      const response = await executionAPI.run(code, currentProblem?._id, null);
      const result = response.data?.data || response.data;
      
      setOutput(result.output || result.error || 'No output');
      
      if (result.success) {
        toast.success('[SYSTEM] Code executed successfully!');
        
        // Check if current objective is completed
        if (!objectivesCompleted.includes(currentObjective)) {
          setObjectivesCompleted([...objectivesCompleted, currentObjective]);
        }
      } else {
        setFeedback({
          type: 'error',
          message: result.error,
          suggestion: result.suggestion || 'Check your syntax and try again.'
        });
      }
    } catch (error) {
      setOutput(error.response?.data?.error || 'Execution failed');
      toast.error('[SYSTEM] Execution error!');
    }
    
    setIsRunning(false);
  };
  
  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('[SYSTEM] No code to submit!');
      return;
    }
    
    setIsRunning(true);
    setTestResults([]);
    
    try {
      const response = await executionAPI.submit(code, currentProblem?._id, 'guided', hints.filter(h => h.unlocked).length, 0);
      const result = response.data?.data || response.data;
      
      setTestResults(result.testResults || []);
      
      if (result.allPassed) {
        toast.success('[SYSTEM] All tests passed! Phase complete!');
        
        // Complete the guided phase
        await completePhase(currentProblem.zone, currentProblem._id, 'guided');
        await addXP(25);
        
        // Proceed to autonomous mode after delay
        setTimeout(() => {
          navigate(`/solve/${problemSlug}`);
        }, 2000);
      } else {
        const passedCount = result.testResults?.filter(t => t.passed).length || 0;
        const totalCount = result.testResults?.length || 0;
        
        toast.warning(`[SYSTEM] ${passedCount}/${totalCount} tests passed. Keep trying!`);
        
        // Provide feedback on first failed test
        const failedTest = result.testResults?.find(t => !t.passed);
        if (failedTest) {
          setFeedback({
            type: 'warning',
            message: `Test failed for input: ${JSON.stringify(failedTest.input)}`,
            expected: failedTest.expected,
            actual: failedTest.actual,
            suggestion: 'Review your logic and trace through the example.'
          });
        }
      }
    } catch (error) {
      toast.error('[SYSTEM] Submission failed!');
      setOutput(error.response?.data?.error || 'Submission error');
    }
    
    setIsRunning(false);
  };
  
  const handleUnlockHint = async (idx) => {
    const hint = hints[idx];
    if (hint.unlocked) return;
    
    if ((user?.gold || 0) < (hint.cost || 10)) {
      toast.error(`[SYSTEM] Not enough gold! Need ${hint.cost || 10} gold.`);
      return;
    }
    
    const result = await unlockHint(problemSlug, idx);
    if (result) {
      updateUser({ gold: user.gold - (hint.cost || 10) });
      setHints(prev => prev.map((h, i) => 
        i === idx ? { ...h, unlocked: true } : h
      ));
      toast.success('[SYSTEM] Hint unlocked!');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-purple-400 animate-pulse">
            school
          </span>
          <p className="text-gray-500 mt-4 font-mono">[SYSTEM] Loading guided mode...</p>
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
  
  const objectives = currentProblem.guidedObjectives || [
    'Understand the function signature',
    'Implement the core logic',
    'Handle edge cases',
    'Pass all test cases'
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
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
            <span className="text-xs text-purple-400 font-mono">PHASE 2: GUIDED CODING</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Hints Button */}
          <button
            onClick={() => setShowHintModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 glass-panel rounded-lg text-yellow-400 text-sm hover:bg-yellow-400/10"
          >
            <span className="material-symbols-outlined text-lg">lightbulb</span>
            Hints ({hints.filter(h => h.unlocked).length}/{hints.length})
          </button>
          
          {/* Gold Display */}
          <div className="flex items-center gap-2 text-yellow-400">
            <span className="material-symbols-outlined">paid</span>
            <span>{user?.gold || 0}</span>
          </div>
        </div>
      </motion.header>
      
      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Objectives & Instructions */}
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-80 glass-panel border-r border-gray-800 p-4 overflow-y-auto"
        >
          {/* Objectives */}
          <div className="mb-6">
            <h3 className="text-sm font-mono text-gray-500 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-purple-400">task_alt</span>
              OBJECTIVES
            </h3>
            <div className="space-y-2">
              {objectives.map((obj, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-sm transition-all ${
                    objectivesCompleted.includes(idx)
                      ? 'border-green-500/50 bg-green-500/10 text-green-400'
                      : idx === currentObjective
                        ? 'border-purple-500/50 bg-purple-500/10 text-purple-300'
                        : 'border-gray-700 text-gray-500'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm mt-0.5">
                      {objectivesCompleted.includes(idx) ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    {obj}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Instructions */}
          <div className="mb-6">
            <h3 className="text-sm font-mono text-gray-500 mb-3">INSTRUCTIONS</h3>
            <div className="p-4 bg-void/50 rounded-lg border border-gray-800 text-sm text-gray-400">
              <p className="mb-2">1. Read the function signature carefully</p>
              <p className="mb-2">2. Implement your solution in the marked area</p>
              <p className="mb-2">3. Click "Run" to test with a single case</p>
              <p>4. Click "Submit" when ready to check all tests</p>
            </div>
          </div>
          
          {/* Test Cases Preview */}
          <div>
            <h3 className="text-sm font-mono text-gray-500 mb-3">TEST CASES</h3>
            <div className="space-y-2">
              {currentProblem.testCases?.slice(0, 3).map((tc, idx) => (
                <div key={idx} className="p-3 bg-void/50 rounded-lg border border-gray-800">
                  <div className="text-xs text-gray-500 mb-1">Case {idx + 1}</div>
                  <div className="font-mono text-xs">
                    <span className="text-gray-400">Input: </span>
                    <span className="text-primary">{JSON.stringify(tc.input)}</span>
                  </div>
                  <div className="font-mono text-xs">
                    <span className="text-gray-400">Expected: </span>
                    <span className="text-green-400">{JSON.stringify(tc.expected)}</span>
                  </div>
                </div>
              ))}
              {(currentProblem.testCases?.length || 0) > 3 && (
                <p className="text-xs text-gray-600 text-center">
                  + {currentProblem.testCases.length - 3} hidden tests
                </p>
              )}
            </div>
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
                glyphMargin: true,
                folding: true,
                lineDecorationsWidth: 10,
                renderLineHighlight: 'all',
                wordWrap: 'on',
                padding: { top: 16 }
              }}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="p-4 glass-panel border-t border-gray-800 flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="px-6 py-2 glass-panel rounded-lg text-primary hover:bg-primary/10 flex items-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined">
                  {isRunning ? 'hourglass_empty' : 'play_arrow'}
                </span>
                Run
              </button>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={isRunning}
              className="px-8 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <span className="material-symbols-outlined">send</span>
              Submit
            </button>
          </div>
        </div>
        
        {/* Right Panel - Output */}
        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-96 glass-panel border-l border-gray-800 flex flex-col"
        >
          {/* Output Header */}
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-sm font-mono text-gray-500">OUTPUT CONSOLE</h3>
          </div>
          
          {/* Output Content */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
            {output ? (
              <pre className="whitespace-pre-wrap text-gray-300">{output}</pre>
            ) : (
              <p className="text-gray-600">Run your code to see output...</p>
            )}
          </div>
          
          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="p-4 border-t border-gray-800 max-h-48 overflow-y-auto">
              <h4 className="text-xs text-gray-500 mb-2">TEST RESULTS</h4>
              <div className="space-y-2">
                {testResults.map((result, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded text-xs ${
                      result.passed
                        ? 'bg-green-500/10 border border-green-500/30'
                        : 'bg-red-500/10 border border-red-500/30'
                    }`}
                  >
                    <span className={result.passed ? 'text-green-400' : 'text-red-400'}>
                      {result.passed ? '✓' : '✗'} Test {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Feedback */}
          {feedback && (
            <div className={`p-4 border-t ${
              feedback.type === 'error' ? 'border-red-500/30 bg-red-500/5' : 'border-yellow-500/30 bg-yellow-500/5'
            }`}>
              <p className={`text-sm ${feedback.type === 'error' ? 'text-red-400' : 'text-yellow-400'}`}>
                {feedback.message}
              </p>
              {feedback.suggestion && (
                <p className="text-xs text-gray-500 mt-2">
                  💡 {feedback.suggestion}
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Hints Modal */}
      <AnimatePresence>
        {showHintModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowHintModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel p-6 rounded-xl max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-yellow-400">lightbulb</span>
                  Hints
                </h2>
                <button onClick={() => setShowHintModal(false)} className="text-gray-400 hover:text-white">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {hints.map((hint, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      hint.unlocked
                        ? 'border-yellow-500/30 bg-yellow-500/5'
                        : 'border-gray-700 bg-void/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-gray-400">Hint {idx + 1}</span>
                      {!hint.unlocked && (
                        <button
                          onClick={() => handleUnlockHint(idx)}
                          className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">paid</span>
                          {hint.cost || 10}
                        </button>
                      )}
                    </div>
                    <p className={`mt-2 text-sm ${hint.unlocked ? 'text-gray-300' : 'text-gray-600 blur-sm select-none'}`}>
                      {hint.unlocked ? hint.content : 'This hint is locked. Spend gold to reveal.'}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GuidedCoding;
