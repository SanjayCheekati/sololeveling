const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Progress = require('../models/Progress');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get detailed user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const progress = await Progress.findOne({ user: req.user._id })
      .populate('currentProblem', 'title slug zone difficulty');

    const xpForNextLevel = user.getXPForNextLevel();

    res.json({
      success: true,
      data: {
        user: {
          ...user.toObject(),
          xpForNextLevel,
          xpProgress: Math.round((user.currentXP / xpForNextLevel) * 100)
        },
        progress
      }
    });
  } catch (error) {
    console.error('[SYSTEM ERROR]', error);
    res.status(500).json({
      success: false,
      message: '[SYSTEM] Failed to retrieve profile.'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { hunterName, avatarUrl } = req.body;
    
    const updateData = {};
    if (hunterName) updateData.hunterName = hunterName;
    if (avatarUrl) updateData.avatarUrl = avatarUrl;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: '[SYSTEM] Profile updated.',
      data: { user }
    });
  } catch (error) {
    console.error('[SYSTEM ERROR]', error);
    res.status(500).json({
      success: false,
      message: '[SYSTEM] Failed to update profile.'
    });
  }
});

// @route   POST /api/users/add-xp
// @desc    Add XP to user (internal use)
// @access  Private
router.post('/add-xp', auth, async (req, res) => {
  try {
    const { amount, source } = req.body;
    const user = await User.findById(req.user._id);

    user.currentXP += amount;
    user.totalXP += amount;

    // Check for level up
    let leveledUp = false;
    let newLevel = user.level;
    let xpForNext = user.getXPForNextLevel();

    while (user.currentXP >= xpForNext) {
      user.currentXP -= xpForNext;
      user.level += 1;
      newLevel = user.level;
      leveledUp = true;
      xpForNext = user.getXPForNextLevel();
    }

    // Check for rank up
    let rankedUp = false;
    let newRank = user.rank;
    const rankRequirements = User.getRankRequirements();
    
    for (const [rank, req] of Object.entries(rankRequirements)) {
      if (user.level >= req.minLevel && user.level <= req.maxLevel && user.rank !== rank) {
        const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S'];
        if (rankOrder.indexOf(rank) > rankOrder.indexOf(user.rank)) {
          user.rank = rank;
          newRank = rank;
          rankedUp = true;
          
          // Unlock new zones based on rank
          req.zones.forEach(zone => {
            if (!user.zonesUnlocked.includes(zone) && zone !== 'all') {
              user.zonesUnlocked.push(zone);
            }
          });
        }
      }
    }

    await user.save();

    res.json({
      success: true,
      message: leveledUp ? '[SYSTEM] Level Up!' : '[SYSTEM] XP gained.',
      data: {
        xpGained: amount,
        source,
        currentXP: user.currentXP,
        totalXP: user.totalXP,
        level: user.level,
        rank: user.rank,
        leveledUp,
        newLevel: leveledUp ? newLevel : null,
        rankedUp,
        newRank: rankedUp ? newRank : null,
        zonesUnlocked: user.zonesUnlocked
      }
    });
  } catch (error) {
    console.error('[SYSTEM ERROR]', error);
    res.status(500).json({
      success: false,
      message: '[SYSTEM] Failed to add XP.'
    });
  }
});

// @route   POST /api/users/add-stats
// @desc    Add stats to user
// @access  Private
router.post('/add-stats', auth, async (req, res) => {
  try {
    const { stats } = req.body;
    const user = await User.findById(req.user._id);

    if (stats.strength) user.stats.strength += stats.strength;
    if (stats.intelligence) user.stats.intelligence += stats.intelligence;
    if (stats.agility) user.stats.agility += stats.agility;
    if (stats.endurance) user.stats.endurance += stats.endurance;
    if (stats.sense) user.stats.sense += stats.sense;

    await user.save();

    res.json({
      success: true,
      message: '[SYSTEM] Stats increased.',
      data: { stats: user.stats }
    });
  } catch (error) {
    console.error('[SYSTEM ERROR]', error);
    res.status(500).json({
      success: false,
      message: '[SYSTEM] Failed to update stats.'
    });
  }
});

// @route   GET /api/users/daily-quests
// @desc    Get daily quest status
// @access  Private
router.get('/daily-quests', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Reset daily quests if needed (new day)
    const lastReset = new Date(user.dailyQuests.lastReset);
    const today = new Date();
    if (lastReset.toDateString() !== today.toDateString()) {
      user.dailyQuests = {
        problemsSolved: 0,
        visualizationsCompleted: 0,
        predictionsCorrect: 0,
        lastReset: today
      };
      await user.save();
    }

    // Calculate time until reset
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilReset = tomorrow - today;

    res.json({
      success: true,
      data: {
        quests: [
          {
            id: 'solve-problems',
            title: 'Solve 3 Problems',
            description: 'Complete any 3 DSA problems',
            current: user.dailyQuests.problemsSolved,
            target: 3,
            xpReward: 150,
            complete: user.dailyQuests.problemsSolved >= 3
          },
          {
            id: 'visualizations',
            title: 'Complete 5 Visualizations',
            description: 'Watch and interact with 5 visualizations',
            current: user.dailyQuests.visualizationsCompleted,
            target: 5,
            xpReward: 100,
            complete: user.dailyQuests.visualizationsCompleted >= 5
          },
          {
            id: 'predictions',
            title: 'Get 10 Predictions Right',
            description: 'Correctly predict algorithm outputs',
            current: user.dailyQuests.predictionsCorrect,
            target: 10,
            xpReward: 200,
            complete: user.dailyQuests.predictionsCorrect >= 10
          }
        ],
        timeUntilReset: Math.floor(timeUntilReset / 1000) // seconds
      }
    });
  } catch (error) {
    console.error('[SYSTEM ERROR]', error);
    res.status(500).json({
      success: false,
      message: '[SYSTEM] Failed to fetch daily quests.'
    });
  }
});

module.exports = router;
