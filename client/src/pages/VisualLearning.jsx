import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { problemAPI, progressAPI } from '../services/api';
import { toast } from 'react-toastify';

const VisualLearning = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuthStore();
  
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPrediction, setShowPrediction] = useState(false);
  const [userPrediction, setUserPrediction] = useState('');
  const [predictionResult, setPredictionResult] = useState(null);
  const [predictionsMade, setPredictionsMade] = useState([]);
  const [visualizationData, setVisualizationData] = useState(null);
  const [canProceed, setCanProceed] = useState(false);
  const [selectedPredictionOption, setSelectedPredictionOption] = useState(null);
  const contentRef = useRef(null);
  
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
    // Get tutorial content from problem or generate default
    const tutorialContent = prob.tutorialContent || generateDefaultTutorial(prob);
    
    // Create learning steps from tutorial content
    const steps = tutorialContent.sections.map((section, idx) => ({
      ...section,
      stepNumber: idx + 1,
      totalSteps: tutorialContent.sections.length,
      hasPrediction: section.hasPrediction || false
    }));
    
    // Add prediction checkpoints at specific steps if not already defined
    const checkpoints = steps.filter(s => s.hasPrediction).map((s, i) => i);
    
    setVisualizationData({ 
      steps, 
      checkpoints: checkpoints.length > 0 ? checkpoints : [Math.floor(steps.length * 0.7)],
      predictions: prob.predictions || tutorialContent.predictions || []
    });
  };
  
  const generateDefaultTutorial = (prob) => {
    const category = prob.category?.toLowerCase() || prob.zone || 'python-basics';
    
    // Default Python basics tutorial content
    return {
      sections: [
        {
          title: 'What is this problem about?',
          content: prob.description || 'Let\'s learn something new!',
          type: 'intro'
        },
        {
          title: 'Understanding the Concept',
          content: `In this lesson, we'll learn step by step. Don't worry if it seems hard at first - everyone starts somewhere! 🌟`,
          type: 'explanation'
        },
        {
          title: 'Example',
          content: prob.examples?.[0]?.explanation || 'Let\'s see how this works with an example.',
          code: prob.examples?.[0]?.input ? `Input: ${prob.examples[0].input}\nOutput: ${prob.examples[0].output}` : '',
          type: 'example'
        },
        {
          title: 'Your Turn!',
          content: 'Now let\'s check if you understood the concept.',
          type: 'checkpoint',
          hasPrediction: true
        }
      ],
      predictions: prob.predictions || []
    };
  };
  
  // Navigation controls
  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < (visualizationData?.steps?.length || 0)) {
      setCurrentStep(stepIndex);
      
      // Check if this step has a prediction
      const step = visualizationData.steps[stepIndex];
      if (step?.hasPrediction && !predictionsMade.find(p => p.step === stepIndex)) {
        setShowPrediction(true);
      }
    }
  };
  
  const nextStep = () => {
    const nextIdx = currentStep + 1;
    if (nextIdx < (visualizationData?.steps?.length || 0)) {
      goToStep(nextIdx);
    } else {
      checkCompletion();
    }
  };
  
  const prevStep = () => {
    goToStep(currentStep - 1);
  };
  
  const checkCompletion = () => {
    // Allow proceeding after viewing all steps OR making at least one prediction
    const viewedAllSteps = currentStep >= (visualizationData?.steps?.length || 1) - 1;
    const madePredictions = predictionsMade.length > 0;
    
    if (viewedAllSteps || madePredictions) {
      setCanProceed(true);
      toast.success('🎉 Great job! You can now proceed to coding!');
    }
  };
  
  const handlePrediction = (selectedOption) => {
    const prediction = visualizationData?.predictions?.[0] || problem?.predictions?.[0];
    
    if (!prediction) {
      // No prediction defined, just mark as done
      setPredictionsMade(prev => [...prev, { step: currentStep, correct: true, skipped: false }]);
      setShowPrediction(false);
      setCanProceed(true);
      return;
    }
    
    const isCorrect = selectedOption === prediction.correctAnswer;
    
    setPredictionResult({
      correct: isCorrect,
      message: isCorrect 
        ? '✅ Correct! You\'re understanding this well!' 
        : `❌ Not quite. The correct answer is: ${prediction.correctAnswer}`,
      explanation: prediction.explanation
    });
    
    setPredictionsMade(prev => [...prev, { step: currentStep, correct: isCorrect, skipped: false }]);
    
    setTimeout(() => {
      setShowPrediction(false);
      setPredictionResult(null);
      setUserPrediction('');
      setSelectedPredictionOption(null);
      setCanProceed(true);
    }, 2500);
  };
  
  const handleSkipPrediction = () => {
    setPredictionsMade(prev => [...prev, { step: currentStep, correct: false, skipped: true }]);
    setShowPrediction(false);
    setCanProceed(true);
    toast.info('Prediction skipped. You can still proceed!');
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
  
  const step = visualizationData?.steps?.[currentStep];
  
  // Format content with markdown-like rendering
  const formatContent = (content) => {
    if (!content) return null;
    
    // Split into paragraphs and format
    return content.split('\n').map((line, i) => {
      // Handle code blocks
      if (line.startsWith('```')) return null;
      if (line.trim().startsWith('#')) {
        const level = line.match(/^#+/)[0].length;
        const text = line.replace(/^#+\s*/, '');
        if (level === 1) return <h2 key={i} className="text-xl font-bold text-primary mb-2">{text}</h2>;
        if (level === 2) return <h3 key={i} className="text-lg font-bold text-cyan-400 mb-2">{text}</h3>;
        return <h4 key={i} className="text-md font-bold text-gray-300 mb-1">{text}</h4>;
      }
      // Handle bullet points
      if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
        return <li key={i} className="ml-4 text-gray-300">{line.replace(/^[-•]\s*/, '')}</li>;
      }
      // Handle bold text
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary">$1</strong>');
      return line.trim() ? <p key={i} className="text-gray-300 mb-2" dangerouslySetInnerHTML={{ __html: formattedLine }} /> : null;
    }).filter(Boolean);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-spin" />
            <span className="material-symbols-outlined text-3xl text-primary absolute inset-0 flex items-center justify-center">visibility</span>
          </div>
          <p className="text-gray-500 mt-6 font-mono text-sm">[SYSTEM] Loading lesson...</p>
        </div>
      </div>
    );
  }
  
  const currentPrediction = visualizationData?.predictions?.[0] || problem?.predictions?.[0];
  
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-[1200px] mx-auto">
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
                  📚 LEARNING MODE
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-sm text-gray-400">{problem?.zone || 'Python Basics'}</span>
              </div>
              <h1 className="text-2xl font-bold mt-1">{problem?.title}</h1>
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center gap-4">
            <div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-3">
              <span className="text-xs text-gray-500">Progress:</span>
              <span className="text-primary font-bold">{currentStep + 1}/{visualizationData?.steps?.length || 1}</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Learning Content Card */}
            <div className="glass-panel-strong rounded-2xl p-8 min-h-[400px]" ref={contentRef}>
              {/* Step Title */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold">{currentStep + 1}</span>
                </div>
                <h2 className="text-xl font-bold text-white">
                  {step?.title || `Step ${currentStep + 1}`}
                </h2>
              </div>
              
              {/* Main Content */}
              <div className="prose prose-invert max-w-none">
                {step?.content && (
                  <div className="text-gray-300 text-lg leading-relaxed mb-6">
                    {formatContent(step.content)}
                  </div>
                )}
                
                {/* Explanation with kid-friendly styling */}
                {step?.explanation && (
                  <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 mb-6">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💡</span>
                      <div>
                        <h4 className="text-primary font-bold mb-2">Easy Explanation:</h4>
                        <p className="text-gray-300">{step.explanation}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Code Example */}
                {step?.code && (
                  <div className="bg-[#0D1117] rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-cyan-400 text-sm">code</span>
                      <span className="text-xs text-cyan-400 font-mono">Python Example</span>
                    </div>
                    <pre className="font-mono text-sm text-green-400 whitespace-pre-wrap overflow-x-auto">
                      {step.code}
                    </pre>
                  </div>
                )}
                
                {/* Visual Array Display (if exists) */}
                {step?.array && (
                  <div className="flex justify-center items-end gap-3 my-8">
                    {step.array.map((val, idx) => (
                      <div
                        key={idx}
                        className={`
                          relative w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold
                          ${step.highlights?.includes(idx) 
                            ? 'bg-primary/30 border-2 border-primary shadow-lg shadow-primary/30' 
                            : 'bg-void/80 border border-gray-700'
                          }
                        `}
                      >
                        {val}
                        <span className="absolute -bottom-6 text-xs text-gray-500">[{idx}]</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Try It Yourself Box */}
                {step?.tryIt && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🎯</span>
                      <div>
                        <h4 className="text-green-400 font-bold mb-2">Try It Yourself:</h4>
                        <p className="text-gray-300">{step.tryIt}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Navigation Controls - Static Buttons */}
            <div className="glass-panel rounded-xl p-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-void hover:bg-primary/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-gray-400">arrow_back</span>
                  <span className="text-gray-400">Previous</span>
                </button>
                
                {/* Step dots */}
                <div className="flex items-center gap-2">
                  {visualizationData?.steps?.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToStep(idx)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        idx === currentStep 
                          ? 'bg-primary scale-125' 
                          : idx < currentStep 
                            ? 'bg-primary/50' 
                            : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
                
                <button
                  onClick={nextStep}
                  disabled={currentStep >= (visualizationData?.steps?.length || 1) - 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed border border-primary/50"
                >
                  <span className="text-primary">Next</span>
                  <span className="material-symbols-outlined text-primary">arrow_forward</span>
                </button>
              </div>
              
              {/* Progress bar */}
              <div className="mt-4">
                <div className="h-2 bg-void rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-cyan-500 transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / (visualizationData?.steps?.length || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Panel - Quick Reference & Tips */}
          <div className="space-y-6">
            {/* Quick Reference Card */}
            <div className="glass-panel rounded-2xl p-4">
              <h3 className="text-xs text-gray-500 font-mono mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">menu_book</span>
                QUICK REFERENCE
              </h3>
              <div className="space-y-3 text-sm">
                <a 
                  href="https://www.w3schools.com/python/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-lg bg-void/50 hover:bg-primary/10 transition-colors"
                >
                  <span className="text-green-400">🌐</span>
                  <span className="text-gray-300">W3Schools Python</span>
                  <span className="material-symbols-outlined text-gray-500 text-sm ml-auto">open_in_new</span>
                </a>
                <a 
                  href="https://www.codewithharry.com/tutorial/python/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-lg bg-void/50 hover:bg-primary/10 transition-colors"
                >
                  <span className="text-orange-400">📚</span>
                  <span className="text-gray-300">CodeWithHarry</span>
                  <span className="material-symbols-outlined text-gray-500 text-sm ml-auto">open_in_new</span>
                </a>
              </div>
            </div>
            
            {/* Tips Card */}
            <div className="glass-panel rounded-2xl p-4">
              <h3 className="text-xs text-gray-500 font-mono mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-400 text-sm">lightbulb</span>
                TIPS FOR BEGINNERS
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Read each step carefully</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Try typing the code yourself</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Don't skip! Practice makes perfect</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Ask questions if confused</span>
                </li>
              </ul>
            </div>
            
            {/* Problem Info */}
            <div className="glass-panel rounded-2xl p-4">
              <h3 className="text-xs text-gray-500 font-mono mb-3">LESSON INFO</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Difficulty</span>
                  <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">
                    {problem?.difficulty || 'Beginner'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">XP Reward</span>
                  <span className="text-xs text-primary">+{problem?.xpReward || 50} XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Category</span>
                  <span className="text-xs text-cyan-400">{problem?.zone || 'Python Basics'}</span>
                </div>
              </div>
            </div>
            
            {/* Proceed Button */}
            {canProceed && (
              <button
                onClick={handleProceedToGuided}
                className="w-full py-4 rounded-xl btn-primary font-bold flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform"
              >
                <span className="material-symbols-outlined">code</span>
                START CODING
              </button>
            )}
          </div>
        </div>
        
        {/* Prediction Modal - Simplified with Skip Button */}
        {showPrediction && (
          <div className="fixed inset-0 bg-void/90 flex items-center justify-center z-50">
            <div className="glass-panel-strong rounded-2xl p-8 max-w-lg w-full mx-4 border-2 border-primary/50">
              <div className="text-center mb-6">
                <span className="text-5xl mb-4 block">🤔</span>
                <h2 className="text-xl font-bold mb-2">Quick Question!</h2>
                <p className="text-sm text-gray-400">Let's check what you learned</p>
              </div>
              
              {!predictionResult ? (
                <>
                  {currentPrediction ? (
                    <>
                      <p className="text-center text-lg text-gray-300 mb-6">
                        {currentPrediction.question}
                      </p>
                      
                      {/* Multiple Choice Options */}
                      {currentPrediction.options && (
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          {currentPrediction.options.map((option, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedPredictionOption(option)}
                              className={`p-4 rounded-lg border-2 transition-all ${
                                selectedPredictionOption === option
                                  ? 'border-primary bg-primary/20 text-white'
                                  : 'border-gray-700 bg-void hover:border-primary/50 text-gray-300'
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex gap-3">
                        <button
                          onClick={handleSkipPrediction}
                          className="flex-1 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold transition-colors"
                        >
                          Skip →
                        </button>
                        <button
                          onClick={() => handlePrediction(selectedPredictionOption)}
                          disabled={!selectedPredictionOption}
                          className="flex-1 py-3 rounded-lg btn-primary font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Submit Answer
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-center text-gray-300 mb-6">
                        What do you think happens next in this code?
                      </p>
                      <textarea
                        value={userPrediction}
                        onChange={(e) => setUserPrediction(e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full h-24 px-4 py-3 rounded-lg bg-void border border-gray-700 text-white placeholder-gray-500 focus:border-primary focus:outline-none resize-none mb-4"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={handleSkipPrediction}
                          className="flex-1 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold transition-colors"
                        >
                          Skip →
                        </button>
                        <button
                          onClick={() => handlePrediction(userPrediction)}
                          disabled={!userPrediction.trim()}
                          className="flex-1 py-3 rounded-lg btn-primary font-bold disabled:opacity-50"
                        >
                          Submit
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className={`text-center p-6 rounded-lg ${
                  predictionResult.correct ? 'bg-green-500/10 border border-green-500/30' : 'bg-orange-500/10 border border-orange-500/30'
                }`}>
                  <span className="text-4xl block mb-3">
                    {predictionResult.correct ? '🎉' : '💪'}
                  </span>
                  <p className={`text-lg font-bold ${predictionResult.correct ? 'text-green-400' : 'text-orange-400'}`}>
                    {predictionResult.message}
                  </p>
                  {predictionResult.explanation && (
                    <p className="text-gray-400 mt-3 text-sm">
                      {predictionResult.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualLearning;
