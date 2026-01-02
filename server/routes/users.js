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

// @route   GET /api/users/check-rank
// @desc    Check if user is eligible for rank up
// @access  Private
router.get('/check-rank', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const progress = await Progress.findOne({ user: req.user._id });
    
    const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S'];
    const currentRankIndex = rankOrder.indexOf(user.rank);
    
    if (currentRankIndex >= rankOrder.length - 1) {
      return res.json({
        success: true,
        data: {
          eligible: false,
          currentRank: user.rank,
          nextRank: null,
          message: '[SYSTEM] Maximum rank achieved.'
        }
      });
    }

    const nextRank = rankOrder[currentRankIndex + 1];
    
    // Rank requirements
    const requirements = {
      'D': { level: 5, problemsSolved: 5, bossesDefeated: ['arrays'] },
      'C': { level: 10, problemsSolved: 15, bossesDefeated: ['arrays', 'stacks'] },
      'B': { level: 20, problemsSolved: 30, bossesDefeated: ['arrays', 'stacks', 'recursion'] },
      'A': { level: 35, problemsSolved: 50, bossesDefeated: ['arrays', 'stacks', 'recursion', 'binary-trees'] },
      'S': { level: 50, problemsSolved: 100, bossesDefeated: ['arrays', 'stacks', 'recursion', 'binary-trees', 'graphs', 'dp'] }
    };

    const req = requirements[nextRank];
    const bossesDefeated = progress?.bossesDefeated?.map(b => b.zone) || [];
    
    const meetsLevel = user.level >= req.level;
    const meetsProblems = user.totalProblemsSolved >= req.problemsSolved;
    const meetsBosses = req.bossesDefeated.every(zone => bossesDefeated.includes(zone));
    
    const eligible = meetsLevel && meetsProblems && meetsBosses;

    res.json({
      success: true,
      data: {
        eligible,
        currentRank: user.rank,
        nextRank,
        requirements: {
          level: { required: req.level, current: user.level, met: meetsLevel },
          problemsSolved: { required: req.problemsSolved, current: user.totalProblemsSolved, met: meetsProblems },
          bossesDefeated: { required: req.bossesDefeated, current: bossesDefeated, met: meetsBosses }
        },
        message: eligible 
          ? `[SYSTEM] You are eligible for Rank ${nextRank}! Complete the rank-up ceremony.`
          : `[SYSTEM] Continue training to reach Rank ${nextRank}.`
      }
    });
  } catch (error) {
    console.error('[SYSTEM ERROR]', error);
    res.status(500).json({
      success: false,
      message: '[SYSTEM] Failed to check rank eligibility.'
    });
  }
});

// @route   POST /api/users/rank-up
// @desc    Perform rank up ceremony
// @access  Private
router.post('/rank-up', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const progress = await Progress.findOne({ user: req.user._id });
    
    const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S'];
    const currentRankIndex = rankOrder.indexOf(user.rank);
    
    if (currentRankIndex >= rankOrder.length - 1) {
      return res.status(400).json({
        success: false,
        message: '[SYSTEM] Already at maximum rank.'
      });
    }

    const nextRank = rankOrder[currentRankIndex + 1];
    
    // Verify eligibility (same check as /check-rank)
    const requirements = {
      'D': { level: 5, problemsSolved: 5, bossesDefeated: ['arrays'] },
      'C': { level: 10, problemsSolved: 15, bossesDefeated: ['arrays', 'stacks'] },
      'B': { level: 20, problemsSolved: 30, bossesDefeated: ['arrays', 'stacks', 'recursion'] },
      'A': { level: 35, problemsSolved: 50, bossesDefeated: ['arrays', 'stacks', 'recursion', 'binary-trees'] },
      'S': { level: 50, problemsSolved: 100, bossesDefeated: ['arrays', 'stacks', 'recursion', 'binary-trees', 'graphs', 'dp'] }
    };

    const req = requirements[nextRank];
    const bossesDefeated = progress?.bossesDefeated?.map(b => b.zone) || [];
    
    const meetsLevel = user.level >= req.level;
    const meetsProblems = user.totalProblemsSolved >= req.problemsSolved;
    const meetsBosses = req.bossesDefeated.every(zone => bossesDefeated.includes(zone));
    
    if (!meetsLevel || !meetsProblems || !meetsBosses) {
      return res.status(403).json({
        success: false,
        message: '[SYSTEM] Requirements not met for rank up.'
      });
    }

    // Grant rank bonuses
    const rankBonuses = {
      'D': { str: 5, int: 5, agi: 5, end: 5, sen: 5, gold: 500, skill: 'Enhanced Focus' },
      'C': { str: 10, int: 10, agi: 10, end: 10, sen: 10, gold: 1000, skill: 'Pattern Recognition' },
      'B': { str: 15, int: 15, agi: 15, end: 15, sen: 15, gold: 2500, skill: 'Code Intuition' },
      'A': { str: 20, int: 20, agi: 20, end: 20, sen: 20, gold: 5000, skill: 'Algorithm Mastery' },
      'S': { str: 30, int: 30, agi: 30, end: 30, sen: 30, gold: 10000, skill: 'Shadow Monarch' }
    };

    const bonus = rankBonuses[nextRank];
    const oldRank = user.rank;
    
    // Update user
    user.rank = nextRank;
    user.stats.strength += bonus.str;
    user.stats.intelligence += bonus.int;
    user.stats.agility += bonus.agi;
    user.stats.endurance += bonus.end;
    user.stats.sense += bonus.sen;
    user.gold += bonus.gold;
    
    // Add new skill
    if (bonus.skill && !user.skills.some(s => s.name === bonus.skill)) {
      user.skills.push({
        name: bonus.skill,
        description: `Rank ${nextRank} ability`,
        rank: nextRank,
        unlockedAt: new Date()
      });
    }

    // Unlock zones for new rank
    const zoneUnlocks = {
      'D': ['stacks'],
      'C': ['recursion'],
      'B': ['binary-trees'],
      'A': ['graphs'],
      'S': ['dp', 'advanced']
    };
    
    if (zoneUnlocks[nextRank]) {
      zoneUnlocks[nextRank].forEach(zone => {
        if (!user.zonesUnlocked.includes(zone)) {
          user.zonesUnlocked.push(zone);
        }
      });
    }

    await user.save();

    res.json({
      success: true,
      message: `[SYSTEM] RANK UP! Welcome to Rank ${nextRank}, Hunter!`,
      data: {
        oldRank,
        newRank: nextRank,
        statsGained: {
          strength: bonus.str,
          intelligence: bonus.int,
          agility: bonus.agi,
          endurance: bonus.end,
          sense: bonus.sen
        },
        goldGained: bonus.gold,
        skillUnlocked: bonus.skill,
        zonesUnlocked: zoneUnlocks[nextRank] || [],
        user: {
          rank: user.rank,
          stats: user.stats,
          gold: user.gold,
          skills: user.skills,
          zonesUnlocked: user.zonesUnlocked
        }
      }
    });
  } catch (error) {
    console.error('[SYSTEM ERROR]', error);
    res.status(500).json({
      success: false,
      message: '[SYSTEM] Failed to perform rank up.'
    });
  }
});

module.exports = router;
