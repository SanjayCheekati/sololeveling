const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Info
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  hunterName: {
    type: String,
    default: function() { return this.username; }
  },
  avatarUrl: {
    type: String,
    default: ''
  },

  // Rank & Progression
  rank: {
    type: String,
    enum: ['E', 'D', 'C', 'B', 'A', 'S'],
    default: 'E'
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  currentXP: {
    type: Number,
    default: 0
  },
  totalXP: {
    type: Number,
    default: 0
  },

  // Stats (Solo Leveling style)
  stats: {
    strength: { type: Number, default: 10 },     // Problem solving power
    intelligence: { type: Number, default: 10 }, // Algorithm understanding
    agility: { type: Number, default: 10 },      // Speed of solving
    endurance: { type: Number, default: 10 },    // Consistency
    sense: { type: Number, default: 10 }         // Pattern recognition
  },

  // Learning Progress
  currentPhase: {
    type: String,
    enum: ['visualization', 'guided', 'autonomous'],
    default: 'visualization'
  },

  // Zone/Topic Progress
  zonesUnlocked: [{
    type: String,
    enum: ['arrays', 'stacks', 'binary-trees', 'recursion']
  }],
  currentZone: {
    type: String,
    default: 'arrays'
  },

  // Skills unlocked
  skills: [{
    skillId: String,
    name: String,
    description: String,
    unlockedAt: { type: Date, default: Date.now }
  }],

  // Tracking
  totalProblemsAttempted: { type: Number, default: 0 },
  totalProblemsSolved: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: Date.now },

  // Mistake Tracking (System remembers)
  mistakePatterns: [{
    type: {
      type: String,
      enum: ['logic', 'syntax', 'edge-case', 'time-complexity', 'space-complexity', 'off-by-one', 'null-check']
    },
    count: { type: Number, default: 0 },
    lastOccurred: Date
  }],

  // Daily Quest Progress
  dailyQuests: {
    problemsSolved: { type: Number, default: 0 },
    visualizationsCompleted: { type: Number, default: 0 },
    predictionsCorrect: { type: Number, default: 0 },
    lastReset: { type: Date, default: Date.now }
  },

  // Currency
  gold: { type: Number, default: 100 },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate XP needed for next level
userSchema.methods.getXPForNextLevel = function() {
  return Math.floor(1000 * Math.pow(1.5, this.level - 1));
};

// Calculate rank thresholds
userSchema.statics.getRankRequirements = function() {
  return {
    E: { minLevel: 1, maxLevel: 10, zones: ['arrays'] },
    D: { minLevel: 11, maxLevel: 25, zones: ['arrays', 'stacks'] },
    C: { minLevel: 26, maxLevel: 50, zones: ['arrays', 'stacks', 'binary-trees', 'recursion'] },
    B: { minLevel: 51, maxLevel: 80, zones: ['all'] },
    A: { minLevel: 81, maxLevel: 100, zones: ['all'] },
    S: { minLevel: 100, maxLevel: Infinity, zones: ['all'] }
  };
};

// Initialize new user with starting zones
userSchema.pre('save', function(next) {
  if (this.isNew) {
    this.zonesUnlocked = ['arrays'];
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
