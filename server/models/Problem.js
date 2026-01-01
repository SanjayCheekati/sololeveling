const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
  explanation: String
});

const problemSchema = new mongoose.Schema({
  // Basic Info
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },

  // Categorization
  zone: {
    type: String,
    required: true,
    enum: ['arrays', 'stacks', 'binary-trees', 'recursion']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['tutorial', 'easy', 'medium', 'hard', 'boss']
  },
  rank: {
    type: String,
    required: true,
    enum: ['E', 'D', 'C', 'B', 'A', 'S'],
    default: 'E'
  },

  // Learning Phase Requirements
  availableInPhases: [{
    type: String,
    enum: ['visualization', 'guided', 'autonomous']
  }],

  // Problem Content
  starterCode: {
    type: String,
    required: true
  },
  lockedCode: {
    // Code that cannot be edited in guided mode
    type: String,
    default: ''
  },
  solutionCode: {
    type: String,
    required: true
  },
  
  // Test Cases
  testCases: [testCaseSchema],

  // Hints (cost gold to unlock)
  hints: [{
    text: String,
    cost: { type: Number, default: 50 }
  }],

  // Constraints
  constraints: {
    timeLimit: { type: Number, default: 2000 }, // milliseconds
    memoryLimit: { type: Number, default: 128 }, // MB
    inputConstraints: [String]
  },

  // Examples (visible in problem description)
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],

  // Visualization Data
  visualization: {
    type: {
      type: String,
      enum: ['array', 'stack', 'tree', 'recursion-tree', 'none'],
      default: 'none'
    },
    initialState: mongoose.Schema.Types.Mixed,
    steps: [{
      action: String,
      state: mongoose.Schema.Types.Mixed,
      explanation: String
    }]
  },

  // Prediction Requirements
  predictions: [{
    question: String,
    correctAnswer: String,
    options: [String], // For multiple choice
    explanation: String,
    step: Number // At which step this prediction is required
  }],

  // Objectives (for guided mode)
  objectives: [{
    description: String,
    order: Number,
    hint: String
  }],

  // XP & Rewards
  xpReward: { type: Number, default: 100 },
  goldReward: { type: Number, default: 50 },
  firstTimeBonus: { type: Number, default: 50 },

  // Stats Gained on Completion
  statsGain: {
    strength: { type: Number, default: 0 },
    intelligence: { type: Number, default: 1 },
    agility: { type: Number, default: 0 },
    endurance: { type: Number, default: 0 },
    sense: { type: Number, default: 0 }
  },

  // Order in zone progression
  order: { type: Number, default: 0 },

  // Prerequisites
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem'
  }],

  // Metadata
  tags: [String],
  isActive: { type: Boolean, default: true },
  isBossBattle: { type: Boolean, default: false },

  // Stats
  totalAttempts: { type: Number, default: 0 },
  totalSolved: { type: Number, default: 0 },
  averageTime: { type: Number, default: 0 } // in seconds

}, {
  timestamps: true
});

// Calculate acceptance rate
problemSchema.virtual('acceptanceRate').get(function() {
  if (this.totalAttempts === 0) return 0;
  return ((this.totalSolved / this.totalAttempts) * 100).toFixed(1);
});

// Index for efficient queries
problemSchema.index({ zone: 1, difficulty: 1, order: 1 });
problemSchema.index({ rank: 1 });
problemSchema.index({ slug: 1 });

module.exports = mongoose.model('Problem', problemSchema);
