import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useProgressStore } from '../store/progressStore';
import { useAuthStore } from '../store/authStore';

const VisualLearning = () => {
  const navigate = useNavigate();
  const { problemSlug } = useParams();
  const { fetchProblem, currentProblem, completePhase } = useProgressStore();
  const { addXP } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [animationState, setAnimationState] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [showPrediction, setShowPrediction] = useState(false);
  const [prediction, setPrediction] = useState('');
  const [predictionSubmitted, setPredictionSubmitted] = useState(false);
  
  useEffect(() => {
    const loadProblem = async () => {
      await fetchProblem(problemSlug);
      setLoading(false);
    };
    loadProblem();
  }, [problemSlug, fetchProblem]);
  
  // Initialize animation state when problem loads
  useEffect(() => {
    if (currentProblem?.visualization?.initialState) {
      setAnimationState(currentProblem.visualization.initialState);
    }
  }, [currentProblem]);
  
  // Auto-advance steps
  useEffect(() => {
    if (!currentProblem || isPaused || !currentProblem.visualization?.steps) return;
    
    const steps = currentProblem.visualization.steps;
    if (step >= steps.length - 1) return;
    
    const timer = setTimeout(() => {
      setStep(prev => prev + 1);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [step, isPaused, currentProblem]);
  
  const handleStepChange = (newStep) => {
    if (!currentProblem?.visualization?.steps) return;
    setStep(newStep);
  };
  
  const handlePredictionSubmit = async () => {
    if (!prediction.trim()) {
      toast.error('[SYSTEM] Enter your prediction first!');
      return;
    }
    
    // Save prediction
    setPredictionSubmitted(true);
    toast.success('[SYSTEM] Prediction recorded. Move to Guided Phase to verify!');
  };
  
  const handleCompletePhase = async () => {
    if (!predictionSubmitted) {
      setShowPrediction(true);
      toast.info('[SYSTEM] Make a prediction before proceeding!');
      return;
    }
    
    const result = await completePhase(
      currentProblem.zone,
      currentProblem._id,
      'visual'
    );
    
    if (result) {
      await addXP(10);
      toast.success('[SYSTEM] Visual Phase Complete! +10 XP');
      navigate(`/guided/${problemSlug}`);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-primary animate-pulse">
            visibility
          </span>
          <p className="text-gray-500 mt-4 font-mono">[SYSTEM] Loading visualization...</p>
        </div>
      </div>
    );
  }
  
  if (!currentProblem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-red-400">
            error
          </span>
          <p className="text-gray-500 mt-4">Problem not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-primary hover:underline"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  const steps = currentProblem.visualization?.steps || [];
  const currentStepData = steps[step] || {};
  
  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex justify-between items-center mb-6"
      >
        <button
          onClick={() => navigate(`/zone/${currentProblem.zone}`)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Zone Map</span>
        </button>
        
        <div className="flex items-center gap-4">
          {/* Phase Indicator */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded text-blue-400 text-xs font-mono">
              PHASE 1: VISUAL
            </span>
          </div>
        </div>
      </motion.header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Problem Info */}
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="lg:col-span-1 space-y-4"
        >
          {/* Problem Title */}
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">
                  visibility
                </span>
              </div>
              <div>
                <h1 className="font-bold">{currentProblem.title}</h1>
                <span className="text-xs text-gray-500">{currentProblem.difficulty}-Rank</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-400 leading-relaxed">
              {currentProblem.description}
            </p>
          </div>
          
          {/* Objectives */}
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-sm font-mono text-gray-500 mb-4">
              <span className="material-symbols-outlined text-sm align-middle mr-1 text-primary">
                flag
              </span>
              LEARNING OBJECTIVES
            </h3>
            <ul className="space-y-2">
              {(currentProblem.objectives?.map(o => o.description) || ['Understand the problem', 'Watch the visualization', 'Make a prediction']).map((obj, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="material-symbols-outlined text-xs text-primary mt-1">
                    chevron_right
                  </span>
                  {obj}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Step Explanation */}
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-sm font-mono text-gray-500 mb-3">
              STEP {step + 1} OF {steps.length}
            </h3>
            <p className="text-sm text-gray-300">
              {currentStepData.explanation || 'Watch the visualization to understand the algorithm.'}
            </p>
          </div>
        </motion.div>
        
        {/* Center - Visualization Area */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-4"
        >
          {/* Visualization Canvas */}
          <div className="glass-panel p-8 rounded-xl min-h-[400px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <ArrayVisualization
                key={step}
                data={animationState}
                currentStep={step}
                stepData={currentStepData}
              />
            </AnimatePresence>
          </div>
          
          {/* Playback Controls */}
          <div className="glass-panel p-4 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleStepChange(Math.max(0, step - 1))}
                  disabled={step === 0}
                  className="p-2 glass-panel rounded-lg disabled:opacity-30"
                >
                  <span className="material-symbols-outlined">skip_previous</span>
                </button>
                
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-3 bg-primary rounded-full text-black"
                >
                  <span className="material-symbols-outlined">
                    {isPaused ? 'play_arrow' : 'pause'}
                  </span>
                </button>
                
                <button
                  onClick={() => handleStepChange(Math.min(steps.length - 1, step + 1))}
                  disabled={step >= steps.length - 1}
                  className="p-2 glass-panel rounded-lg disabled:opacity-30"
                >
                  <span className="material-symbols-outlined">skip_next</span>
                </button>
              </div>
              
              <span className="text-sm text-gray-500 font-mono">
                Step {step + 1} / {steps.length}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="h-2 bg-void rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>
            
            {/* Step Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStepChange(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === step
                      ? 'bg-primary w-6'
                      : idx < step
                        ? 'bg-primary/50'
                        : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Prediction Section */}
          <AnimatePresence>
            {(showPrediction || step >= steps.length - 1) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-panel p-6 rounded-xl border border-purple-500/30"
              >
                <h3 className="text-sm font-mono text-purple-400 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">psychology</span>
                  PREDICTION CHECKPOINT
                </h3>
                
                {!predictionSubmitted ? (
                  <>
                    <p className="text-sm text-gray-400 mb-4">
                      {currentProblem.predictions?.[0]?.question || 
                        'Based on what you observed, what do you think the output will be for the given input?'}
                    </p>
                    
                    <textarea
                      value={prediction}
                      onChange={(e) => setPrediction(e.target.value)}
                      placeholder="Enter your prediction..."
                      className="w-full h-24 bg-void border border-gray-700 rounded-lg p-4 text-white resize-none focus:border-purple-500 focus:outline-none"
                    />
                    
                    <button
                      onClick={handlePredictionSubmit}
                      className="mt-4 px-6 py-2 bg-purple-500/20 border border-purple-500 rounded-lg text-purple-400 hover:bg-purple-500/30 transition-all"
                    >
                      Submit Prediction
                    </button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <span className="material-symbols-outlined text-4xl text-green-400 mb-2">
                      check_circle
                    </span>
                    <p className="text-green-400">Prediction recorded!</p>
                    <p className="text-xs text-gray-500 mt-2">
                      You'll verify this in the Guided Phase
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Continue Button */}
          <div className="flex justify-end">
            <button
              onClick={handleCompletePhase}
              className={`px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${
                predictionSubmitted
                  ? 'bg-gradient-to-r from-primary to-blue-400 text-black hover:shadow-neon'
                  : 'glass-panel text-gray-400 hover:text-white'
              }`}
            >
              {predictionSubmitted ? (
                <>
                  <span>PROCEED TO GUIDED PHASE</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              ) : (
                <>
                  <span>MAKE PREDICTION FIRST</span>
                  <span className="material-symbols-outlined">psychology</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Array Visualization Component
const ArrayVisualization = ({ data, currentStep, stepData }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-gray-500 text-center">
        <span className="material-symbols-outlined text-4xl">view_array</span>
        <p className="mt-2">Visualization loading...</p>
      </div>
    );
  }
  
  const highlightIndex = stepData?.state?.index;
  const currentTotal = stepData?.state?.total;
  
  return (
    <div className="flex flex-col items-center">
      {/* Current State Display */}
      {currentTotal !== undefined && (
        <motion.div
          key={currentTotal}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8 glass-panel px-6 py-3 rounded-lg"
        >
          <span className="text-gray-400 text-sm">Running Total: </span>
          <span className="text-primary text-2xl font-bold">{currentTotal}</span>
        </motion.div>
      )}
      
      {/* Array Elements */}
      <div className="flex gap-2 flex-wrap justify-center">
        {data.map((value, idx) => {
          const isHighlighted = idx === highlightIndex;
          const isProcessed = idx < highlightIndex;
          
          return (
            <motion.div
              key={idx}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                y: isHighlighted ? -10 : 0
              }}
              transition={{ delay: idx * 0.05 }}
              className="relative"
            >
              {/* Pointer Arrow */}
              {isHighlighted && (
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                >
                  <span className="text-xs text-primary bg-primary/20 px-2 py-0.5 rounded">
                    i
                  </span>
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary mx-auto" />
                </motion.div>
              )}
              
              {/* Array Box */}
              <div
                className={`w-14 h-14 flex items-center justify-center rounded-lg font-mono text-lg font-bold transition-all ${
                  isHighlighted
                    ? 'bg-primary text-black shadow-neon'
                    : isProcessed
                      ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                      : 'glass-panel text-white'
                }`}
              >
                {value}
              </div>
              
              {/* Index Label */}
              <div className="text-xs text-gray-600 text-center mt-1">
                [{idx}]
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-8 flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 bg-primary rounded" />
          Current
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500/50 rounded" />
          Processed
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 glass-panel rounded" />
          Pending
        </span>
      </div>
    </div>
  );
};

export default VisualLearning;
