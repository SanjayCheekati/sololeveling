const express = require('express');
const { auth } = require('../middleware/auth');
const Progress = require('../models/Progress');
const User = require('../models/User');
const Problem = require('../models/Problem');

const router = express.Router();

// @route   GET /api/progress/:zone
// @desc    Get user's progress for a specific zone
// @access  Private
router.get('/:zone', auth, async (req, res) => {
  try {
    const { zone } = req.params;
    const user = req.user;

    // Validate zone
    const validZones = ['arrays', 'stacks', 'binary-trees', 'recursion'];
    if (!validZones.includes(zone)) {
      return res.status(400).json({
        success: false,
        message: '[SYSTEM] Invalid zone specified.'
      });
    }

    let progress = await Progress.findOne({ user: user._id });
    if (!progress) {
      progress = new Progress({ user: user._id });
      await progress.save();
    }

    // Get zone-specific data
    const zoneProgress = progress.zoneProgress?.[zone] || {
      visualizationComplete: false,
      guidedComplete: false,
      problemsSolved: 0
    };

    // Get solved problems for this zone
    const solvedInZone = progress.solvedProblems
      .filter(sp => sp.zone === zone)
      .map(sp => sp.problem.toString());

    res.json({
      success: true,
      data: {
        zone,
        zoneProgress,
        solvedProblems: solvedInZone,
        currentPhase: user.currentPhase,
        zonesUnlocked: user.zonesUnlocked
      }
    });
  } catch (error) {
    console.error('[SYSTEM ERROR]', error);
    res.status(500).json({
      success: false,
      message: '[SYSTEM] Failed to fetch zone progress.'
    });
  }
});

// @route   GET /api/progress
// @desc    Get user's overall progress
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let progress = await Progress.findOne({ user: req.user._id })
      .populate('solvedProblems.problem', 'title slug zone difficulty')
      .populate('currentProblem', 'title slug zone');

    if (!progress) {
      progress = new Progress({ user: req.user._id });
      await progress.save();
    }

    const user = await User.findById(req.user._id).select('-password');

    res.json({
      success: true,
      data: {
        progress,
        user: {
          rank: user.rank,
          level: user.level,
          currentXP: user.currentXP,
          xpForNextLevel: user.getXPForNextLevel(),
          currentPhase: user.currentPhase,
          zonesUnlocked: user.zonesUnlocked
        }
      }
    });
  } catch (error) {
    console.error('[SYSTEM ERROR]', error);
    res.status(500).json({
      success: false,
      message: '[SYSTEM] Failed to fetch progress.'
    });
  }
});

// @route   POST /api/progress/complete-visualization
// @desc    Mark visualization phase complete for a zone
// @access  Private
router.post('/complete-visualization', auth, async (req, res) => {
  try {
    const { zone } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.zonesUnlocked.includes(zone)) {
      return res.status(403).json({
        success: false,
        message: '[SYSTEM] Zone is locked.'
      });
    }

    const progress = await Progress.findOne({ user: req.user._id });
    
    if (!progress.zoneProgress[zone]) {
      progress.zoneProgress[zone] = {};
    }
    
    progress.zoneProgress[zone].visualizationComplete = true;
    await progress.save();

    // Update user's phase if this is their current zone
    if (user.currentZone === zone && user.currentPhase === 'visualization') {
      user.currentPhase = 'guided';
      await user.save();
    }

    // Add XP for completing visualization
    user.currentXP += 100;
    user.totalXP += 100;
    await user.save();

    res.json({
      success: true,
      message: '[SYSTEM] Visualization phase complete. Guided coding unlocked.',
      data: {
        zoneProgress: progress.zoneProgress[zone],
        currentPhase: user.currentPhase,
        xpGained: 100
      }
    });
  } catch (error) {
    console.error('[SYSTEM ERROR]', error);
    res.status(500).json({
      success: false,
      message: '[SYSTEM] Failed to update progress.'
    });
  }
});

// @route   POST /api/progress/complete-guided
// @desc    Mark guided phase complete for a zone
// @access  Private
router.post('/complete-guided', auth, async (req, res) => {
  try {
    const { zone } = req.body;
    const user = await User.findById(req.user._id);

    const progress = await Progress.findOne({ user: req.user._id });
    
    if (!progress.zoneProgress[zone]?.visualizationComplete) {
      return res.status(403).json({
        success: false,
        message: '[SYSTEM] Complete visualization phase first.'
      });
    }
    
    progress.zoneProgress[zone].guidedComplete = true;
    await progress.save();

    // Update user's phase
    if (user.currentZone === zone && user.currentPhase === 'guided') {
      user.currentPhase = 'autonomous';
      await user.save();
    }

    // Add XP
    user.currentXP += 200;
    user.totalXP += 200;
    await user.save();

    res.json({
      success: true,
      message: '[SYSTEM] Guided phase complete. Autonomous coding unlocked.',
      data: {
        zoneProgress: progress.zoneProgress[zone],
        currentPhase: user.currentPhase,
        xpGained: 200
      }
    });
  } catch (error) {
    console.error('[SYSTEM ERROR]', error);
    res.status(500).json({
      success: false,
      message: '[SYSTEM] Failed to update progress.'
    });
  }
});

// @route   POST /api/progress/prediction
// @desc    Record prediction attempt
// @access  Private
router.post('/prediction', auth, async (req, res) => {
  try {
    const { problemId, predictionIndex, answer, correct } = req.body;
    const user = await User.findById(req.user._id);
    const progress = await Progress.findOne({ user: req.user._id });

    // Update prediction accuracy
    if (!progress.analytics) {
      progress.analytics = { predictionAccuracy: 0 };
    }
    
    // Track in daily quests
    if (correct) {
      user.dailyQuests.predictionsCorrect += 1;
    }
    await user.save();

    // Penalty for wrong predictions (to prevent random guessing)
    let xpChange = 0;
    if (correct) {
      xpChange = 10;
      user.currentXP += 10;
    } else {
      // Small penalty to discourage guessing
      xpChange = -5;
      user.currentXP = Math.max(0, user.currentXP - 5);
    }
    await user.save();

    await progress.save();

    res.json({
      success: true,
      message: correct ? '[SYSTEM] Correct prediction!' : '[SYSTEM] Incorrect. Think carefully.',
      data: {
        correct,
        xpChange,
        currentXP: user.currentXP
      }
    });
  } catch (error) {
    console.error('[SYSTEM ERROR]', error);
    res.status(500).json({
      success: false,
      message: '[SYSTEM] Failed to record prediction.'
    });
  }
});

// @route   POST /api/progress/unlock-zone
// @desc    Unlock a new zone (after completing boss battle)
// @access  Private
router.post('/unlock-zone', auth, async (req, res) => {
  try {
    const { zone } = req.body;
    const user = await User.findById(req.user._id);

    const zoneOrder = ['arrays', 'stacks', 'binary-trees', 'recursion'];
    const zoneIndex = zoneOrder.indexOf(zone);

    if (zoneIndex === -1) {
      return res.status(400).json({
        success: false,
        message: '[SYSTEM] Invalid zone.'
      });
    }

    // Check if previous zone is complete
    if (zoneIndex > 0) {
      const prevZone = zoneOrder[zoneIndex - 1];
      const progress = await Progress.findOne({ user: req.user._id });
      
      if (!progress.bossesDefeated.some(b => b.zone === prevZone)) {
        return res.status(403).json({
          success: false,
          message: `[SYSTEM] Defeat the ${prevZone} boss first.`
        });
      }
    }

    if (!user.zonesUnlocked.includes(zone)) {
      user.zonesUnlocked.push(zone);
      user.currentZone = zone;
      user.currentPhase = 'visualization'; // Start at visualization for new zone
      await user.save();
    }

    res.json({
      success: true,
      message: `[SYSTEM] Zone "${zone}" unlocked!`,
      data: {
        zonesUnlocked: user.zonesUnlocked,
        currentZone: user.currentZone,
        currentPhase: user.currentPhase
      }
    });
  } catch (error) {
    console.error('[SYSTEM ERROR]', error);
    res.status(500).json({
      success: false,
      message: '[SYSTEM] Failed to unlock zone.'
    });
  }
});

// @route   GET /api/progress/stats
// @desc    Get detailed analytics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const progress = await Progress.findOne({ user: req.user._id });
    const user = await User.findById(req.user._id);

    const Attempt = require('../models/Attempt');
    
    // Get recent attempts
    const recentAttempts = await Attempt.find({ user: req.user._id })
      .populate('problem', 'title zone difficulty')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate stats
    const totalAttempts = await Attempt.countDocuments({ user: req.user._id });
    const successfulAttempts = await Attempt.countDocuments({ 
      user: req.user._id, 
      status: 'accepted' 
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalProblemsSolved: user.totalProblemsSolved,
          totalAttempts,
          successRate: totalAttempts > 0 
            ? ((successfulAttempts / totalAttempts) * 100).toFixed(1) 
            : 0,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak
        },
        analytics: progress?.analytics || {},
        mistakePatterns: user.mistakePatterns,
        recentAttempts
      }
    });
  } catch (error) {
    console.error('[SYSTEM ERROR]', error);
    res.status(500).json({
      success: false,
      message: '[SYSTEM] Failed to fetch stats.'
    });
  }
});

// @route   POST /api/progress/defeat-boss
// @desc    Record boss defeat
// @access  Private
router.post('/defeat-boss', auth, async (req, res) => {
  try {
    const { zone, bossId, timeToDefeat, hintsUsed } = req.body;
    const user = await User.findById(req.user._id);
    let progress = await Progress.findOne({ user: req.user._id });

    if (!progress) {
      progress = new Progress({ user: req.user._id });
    }

    // Check if boss already defeated
    const alreadyDefeated = progress.bossesDefeated?.some(b => b.zone === zone);
    
    if (alreadyDefeated) {
      return res.json({
        success: true,
        message: '[SYSTEM] Boss already defeated. No additional rewards.',
        data: { alreadyDefeated: true }
      });
    }

    // Initialize if needed
    if (!progress.bossesDefeated) {
      progress.bossesDefeated = [];
    }

    // Record boss defeat
    progress.bossesDefeated.push({
      zone,
      defeatedAt: new Date(),
      timeToDefeat: timeToDefeat || 0,
      hintsUsed: hintsUsed || 0
    });

    // Mark zone as complete
    if (!progress.zoneProgress[zone]) {
      progress.zoneProgress[zone] = {};
    }
    progress.zoneProgress[zone].bossDefeated = true;
    progress.zoneProgress[zone].completedAt = new Date();

    await progress.save();

    // Boss rewards
    const bossRewards = {
      'arrays': { xp: 500, gold: 200, statsBoost: { str: 3, int: 3, agi: 3, end: 3, sen: 3 } },
      'stacks': { xp: 750, gold: 350, statsBoost: { str: 4, int: 4, agi: 4, end: 4, sen: 4 } },
      'recursion': { xp: 1000, gold: 500, statsBoost: { str: 5, int: 5, agi: 5, end: 5, sen: 5 } },
      'binary-trees': { xp: 1250, gold: 650, statsBoost: { str: 6, int: 6, agi: 6, end: 6, sen: 6 } },
      'graphs': { xp: 1500, gold: 800, statsBoost: { str: 8, int: 8, agi: 8, end: 8, sen: 8 } },
      'dp': { xp: 2000, gold: 1000, statsBoost: { str: 10, int: 10, agi: 10, end: 10, sen: 10 } }
    };

    const reward = bossRewards[zone] || bossRewards['arrays'];

    // Apply rewards
    user.currentXP += reward.xp;
    user.totalXP += reward.xp;
    user.gold += reward.gold;
    user.stats.strength += reward.statsBoost.str;
    user.stats.intelligence += reward.statsBoost.int;
    user.stats.agility += reward.statsBoost.agi;
    user.stats.endurance += reward.statsBoost.end;
    user.stats.sense += reward.statsBoost.sen;

    // Check for level up
    let xpNeeded = user.getXPForNextLevel();
    let leveledUp = false;
    while (user.currentXP >= xpNeeded) {
      user.currentXP -= xpNeeded;
      user.level += 1;
      leveledUp = true;
      xpNeeded = user.getXPForNextLevel();
    }

    await user.save();

    // Determine next zone to unlock
    const zoneOrder = ['arrays', 'stacks', 'recursion', 'binary-trees', 'graphs', 'dp'];
    const currentIndex = zoneOrder.indexOf(zone);
    const nextZone = currentIndex < zoneOrder.length - 1 ? zoneOrder[currentIndex + 1] : null;

    res.json({
      success: true,
      message: `[SYSTEM] BOSS DEFEATED! ${zone.toUpperCase()} zone cleared!`,
      data: {
        zone,
        rewards: {
          xp: reward.xp,
          gold: reward.gold,
          statsBoost: reward.statsBoost
        },
        leveledUp,
        newLevel: user.level,
        nextZone,
        canUnlockNext: nextZone && !user.zonesUnlocked.includes(nextZone),
        user: {
          level: user.level,
          currentXP: user.currentXP,
          xpForNextLevel: user.getXPForNextLevel(),
          gold: user.gold,
          stats: user.stats
        }
      }
    });
  } catch (error) {
    console.error('[SYSTEM ERROR]', error);
    res.status(500).json({
      success: false,
      message: '[SYSTEM] Failed to record boss defeat.'
    });
  }
});

module.exports = router;
