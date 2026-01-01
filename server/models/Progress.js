const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Problem Progress by Zone
  zoneProgress: {
    arrays: {
      visualizationComplete: { type: Boolean, default: false },
      guidedComplete: { type: Boolean, default: false },
      autonomousComplete: { type: Boolean, default: false },
      problemsSolved: { type: Number, default: 0 },
      totalProblems: { type: Number, default: 0 },
      currentProblemIndex: { type: Number, default: 0 }
    },
    stacks: {
      visualizationComplete: { type: Boolean, default: false },
      guidedComplete: { type: Boolean, default: false },
      autonomousComplete: { type: Boolean, default: false },
      problemsSolved: { type: Number, default: 0 },
      totalProblems: { type: Number, default: 0 },
      currentProblemIndex: { type: Number, default: 0 }
    },
    'binary-trees': {
      visualizationComplete: { type: Boolean, default: false },
      guidedComplete: { type: Boolean, default: false },
      autonomousComplete: { type: Boolean, default: false },
      problemsSolved: { type: Number, default: 0 },
      totalProblems: { type: Number, default: 0 },
      currentProblemIndex: { type: Number, default: 0 }
    },
    recursion: {
      visualizationComplete: { type: Boolean, default: false },
      guidedComplete: { type: Boolean, default: false },
      autonomousComplete: { type: Boolean, default: false },
      problemsSolved: { type: Number, default: 0 },
      totalProblems: { type: Number, default: 0 },
      currentProblemIndex: { type: Number, default: 0 }
    }
  },

  // Individual Problem Status
  solvedProblems: [{
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
    solvedAt: { type: Date, default: Date.now },
    attempts: { type: Number, default: 1 },
    bestTime: Number,
    bestMemory: Number,
    phase: String
  }],

  // Problem Unlock Status
  unlockedProblems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem'
  }],

  // Current Learning State
  currentZone: { type: String, default: 'arrays' },
  currentPhase: { type: String, default: 'visualization' },
  currentProblem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },

  // Boss Battle Progress
  bossesDefeated: [{
    zone: String,
    defeatedAt: Date,
    attempts: Number
  }],

  // Performance Analytics
  analytics: {
    averageAttempts: { type: Number, default: 0 },
    averageTimePerProblem: { type: Number, default: 0 },
    accuracyRate: { type: Number, default: 0 },
    predictionAccuracy: { type: Number, default: 0 },
    
    // Time distribution
    timeSpentPerZone: {
      arrays: { type: Number, default: 0 },
      stacks: { type: Number, default: 0 },
      'binary-trees': { type: Number, default: 0 },
      recursion: { type: Number, default: 0 }
    },
    
    // Mistake distribution
    mistakesByType: {
      logic: { type: Number, default: 0 },
      syntax: { type: Number, default: 0 },
      'edge-case': { type: Number, default: 0 },
      'time-complexity': { type: Number, default: 0 },
      'space-complexity': { type: Number, default: 0 },
      'off-by-one': { type: Number, default: 0 },
      'null-check': { type: Number, default: 0 }
    }
  },

  // Adaptive Difficulty
  difficultyModifier: { type: Number, default: 1.0 }, // 0.5 = easier, 1.5 = harder

  // Timestamps
  lastUpdated: { type: Date, default: Date.now }

}, {
  timestamps: true
});

// Check if user can access a phase
progressSchema.methods.canAccessPhase = function(zone, phase) {
  const zoneData = this.zoneProgress[zone];
  if (!zoneData) return false;

  switch(phase) {
    case 'visualization':
      return true;
    case 'guided':
      return zoneData.visualizationComplete;
    case 'autonomous':
      return zoneData.guidedComplete;
    default:
      return false;
  }
};

// Check if zone is unlocked
progressSchema.methods.isZoneUnlocked = async function(zone, userId) {
  const User = mongoose.model('User');
  const user = await User.findById(userId);
  return user.zonesUnlocked.includes(zone);
};

progressSchema.index({ user: 1 });

module.exports = mongoose.model('Progress', progressSchema);
