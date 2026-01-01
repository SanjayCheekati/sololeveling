const express = require('express');
const { auth } = require('../middleware/auth');
const Problem = require('../models/Problem');
const Progress = require('../models/Progress');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/problems
// @desc    Get all problems (filtered by user's access)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { zone, difficulty, phase } = req.query;
    const user = req.user;

    // Build query
    const query = { isActive: true };
    
    if (zone) {
      // Check if user has access to zone
      if (!user.zonesUnlocked.includes(zone)) {
        return res.status(403).json({
          success: false,
          message: `[SYSTEM] Zone "${zone}" is locked. Complete previous zones first.`
        });
      }
      query.zone = zone;
    } else {
      // Only show problems from unlocked zones
      query.zone = { $in: user.zonesUnlocked };
    }

    if (difficulty) query.difficulty = difficulty;
    if (phase) query.availableInPhases = phase;

    const problems = await Problem.find(query)
      .select('title slug zone difficulty rank xpReward order isBossBattle')
      .sort({ zone: 1, order: 1 });

    // Get user's progress to mark solved problems
    const progress = await Progress.findOne({ user: user._id });
    const solvedIds = progress?.solvedProblems.map(p => p.problem.toString()) || [];

    const problemsWithStatus = problems.map(p => ({
      ...p.toObject(),
      solved: solvedIds.includes(p._id.toString())
    }));

    res.json({
      success: true,
      data: {
        problems: problemsWithStatus,
        count: problems.length
      }
    });
  } catch (error) {
    console.error('[SYSTEM ERROR]', error);
    res.status(500).json({
      success: false,
      message: '[SYSTEM] Failed to fetch problems.'
    });
  }
});

// @route   GET /api/problems/zone/:zone
// @desc    Get problems by zone with detailed progress
// @access  Private
router.get('/zone/:zone', auth, async (req, res) => {
  try {
    const { zone } = req.params;
    const user = req.user;

    if (!user.zonesUnlocked.includes(zone)) {
      return res.status(403).json({
        success: false,
        message: `[SYSTEM] Zone "${zone}" is locked.`
      });
    }

    const problems = await Problem.find({ zone, isActive: true })
      .select('title slug difficulty rank xpReward order isBossBattle availableInPhases')
      .sort({ order: 1 });

    const progress = await Progress.findOne({ user: user._id });
    const zoneProgress = progress?.zoneProgress[zone] || {};
    const solvedIds = progress?.solvedProblems.map(p => p.problem.toString()) || [];

    const problemsWithStatus = problems.map(p => ({
      ...p.toObject(),
      solved: solvedIds.includes(p._id.toString()),
      locked: !canAccessProblem(p, zoneProgress, user.currentPhase)
    }));

    res.json({
      success: true,
      data: {
        zone,
        problems: problemsWithStatus,
        progress: zoneProgress,
        currentPhase: user.currentPhase
      }
    });
  } catch (error) {
    console.error('[SYSTEM ERROR]', error);
    res.status(500).json({
      success: false,
      message: '[SYSTEM] Failed to fetch zone problems.'
    });
  }
});

// Helper to check problem access
function canAccessProblem(problem, zoneProgress, userPhase) {
  const phaseOrder = ['visualization', 'guided', 'autonomous'];
  const userPhaseIndex = phaseOrder.indexOf(userPhase);
  
  // Check if any available phase is accessible
  return problem.availableInPhases.some(phase => {
    const requiredPhaseIndex = phaseOrder.indexOf(phase);
    return userPhaseIndex >= requiredPhaseIndex;
  });
}

// @route   GET /api/problems/:slug
// @desc    Get single problem by slug
// @access  Private
router.get('/:slug', auth, async (req, res) => {
  try {
    const { slug } = req.params;
    const { phase } = req.query;
    const user = req.user;

    const problem = await Problem.findOne({ slug, isActive: true });
    
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: '[SYSTEM] Problem not found.'
      });
    }

    // Check zone access
    if (!user.zonesUnlocked.includes(problem.zone)) {
      return res.status(403).json({
        success: false,
        message: `[SYSTEM] Complete previous zones first.`
      });
    }

    // Check phase access
    const progress = await Progress.findOne({ user: user._id });
    const zoneProgress = progress?.zoneProgress[problem.zone] || {};
    
    if (phase && !problem.availableInPhases.includes(phase)) {
      return res.status(403).json({
        success: false,
        message: `[SYSTEM] This problem is not available in ${phase} phase.`
      });
    }

    // Build response based on phase
    let responseData = {
      _id: problem._id,
      title: problem.title,
      slug: problem.slug,
      description: problem.description,
      zone: problem.zone,
      difficulty: problem.difficulty,
      rank: problem.rank,
      constraints: problem.constraints,
      examples: problem.examples,
      xpReward: problem.xpReward,
      goldReward: problem.goldReward,
      availableInPhases: problem.availableInPhases,
      objectives: problem.objectives,
      isBossBattle: problem.isBossBattle
    };

    // Add visualization data
    if (phase === 'visualization' || !phase) {
      responseData.visualization = problem.visualization;
      responseData.predictions = problem.predictions;
    }

    // Add code for guided/autonomous
    if (phase === 'guided') {
      responseData.starterCode = problem.starterCode;
      responseData.lockedCode = problem.lockedCode;
    }

    if (phase === 'autonomous') {
      responseData.starterCode = problem.starterCode;
    }

    // Add test cases (non-hidden only)
    responseData.testCases = problem.testCases.filter(tc => !tc.isHidden);

    // Get user's attempts on this problem
    const Attempt = require('../models/Attempt');
    const attempts = await Attempt.find({ 
      user: user._id, 
      problem: problem._id 
    }).sort({ createdAt: -1 }).limit(5);

    responseData.attempts = attempts;
    responseData.solved = progress?.solvedProblems.some(
      p => p.problem.toString() === problem._id.toString()
    );

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('[SYSTEM ERROR]', error);
    res.status(500).json({
      success: false,
      message: '[SYSTEM] Failed to fetch problem.'
    });
  }
});

// @route   POST /api/problems/:id/hint
// @desc    Unlock a hint (costs gold)
// @access  Private
router.post('/:id/hint', auth, async (req, res) => {
  try {
    const { hintIndex } = req.body;
    const user = await User.findById(req.user._id);
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: '[SYSTEM] Problem not found.'
      });
    }

    if (!problem.hints[hintIndex]) {
      return res.status(400).json({
        success: false,
        message: '[SYSTEM] Invalid hint index.'
      });
    }

    const hint = problem.hints[hintIndex];
    
    if (user.gold < hint.cost) {
      return res.status(400).json({
        success: false,
        message: `[SYSTEM] Insufficient gold. Need ${hint.cost}G.`
      });
    }

    user.gold -= hint.cost;
    await user.save();

    res.json({
      success: true,
      message: '[SYSTEM] Hint unlocked.',
      data: {
        hint: hint.text,
        goldRemaining: user.gold
      }
    });
  } catch (error) {
    console.error('[SYSTEM ERROR]', error);
    res.status(500).json({
      success: false,
      message: '[SYSTEM] Failed to unlock hint.'
    });
  }
});

module.exports = router;
