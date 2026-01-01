const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },

  // Attempt Details
  phase: {
    type: String,
    enum: ['visualization', 'guided', 'autonomous'],
    required: true
  },
  code: {
    type: String,
    required: true
  },

  // Results
  status: {
    type: String,
    enum: ['pending', 'running', 'accepted', 'wrong-answer', 'time-limit', 'memory-limit', 'runtime-error', 'compilation-error'],
    default: 'pending'
  },
  
  // Test Case Results
  testResults: [{
    testCaseIndex: Number,
    passed: Boolean,
    actualOutput: String,
    expectedOutput: String,
    executionTime: Number,
    memoryUsed: Number,
    error: String
  }],

  // Overall Metrics
  totalTestCases: { type: Number, default: 0 },
  passedTestCases: { type: Number, default: 0 },
  executionTime: { type: Number, default: 0 }, // Total time in ms
  memoryUsed: { type: Number, default: 0 }, // Max memory in MB

  // Learning Metrics
  predictionsAttempted: { type: Number, default: 0 },
  predictionsCorrect: { type: Number, default: 0 },
  hintsUsed: { type: Number, default: 0 },
  timeToSolve: { type: Number, default: 0 }, // Time from start to submission

  // Mistake Analysis
  mistakeType: {
    type: String,
    enum: ['none', 'logic', 'syntax', 'edge-case', 'time-complexity', 'space-complexity', 'off-by-one', 'null-check'],
    default: 'none'
  },
  mistakeDetails: String,

  // Feedback
  feedback: {
    message: String,
    suggestions: [String],
    conceptsToReview: [String]
  },

  // XP Earned
  xpEarned: { type: Number, default: 0 },
  goldEarned: { type: Number, default: 0 },

  // Timestamps
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date, default: Date.now }

}, {
  timestamps: true
});

// Index for user's attempt history
attemptSchema.index({ user: 1, problem: 1, createdAt: -1 });
attemptSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Attempt', attemptSchema);
