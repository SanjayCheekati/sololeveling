const express = require('express');
const { auth } = require('../middleware/auth');
const { executePython, analyzeCode } = require('../utils/pythonExecutor');
const Problem = require('../models/Problem');
const Attempt = require('../models/Attempt');
const Progress = require('../models/Progress');
const User = require('../models/User');

const router = express.Router();

// @route   POST /api/execute/run
// @desc    Execute Python code (run without submission)
// @access  Private
router.post('/run', auth, async (req, res) => {
  try {
    const { code, problemId, testInput } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: '[SYSTEM] No code provided.'
      });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: '[SYSTEM] Problem not found.'
      });
    }

    // Execute against first test case or custom input
    const input = testInput || problem.testCases[0]?.input || '';
    
    const result = await executePython(code, input, {
      timeLimit: problem.constraints.timeLimit,
      memoryLimit: problem.constraints.memoryLimit
    });

    res.json({
      success: true,
      data: {
        output: result.output,
        error: result.error,
        executionTime: result.executionTime,
        memoryUsed: result.memoryUsed,
        status: result.status
      }
    });
  } catch (error) {
    console.error('[SYSTEM ERROR]', error);
    res.status(500).json({
      success: false,
      message: '[SYSTEM] Execution failed.'
    });
  }
});

// @route   POST /api/execute/submit
// @desc    Submit solution for evaluation
// @access  Private
router.post('/submit', auth, async (req, res) => {
  try {
    const { code, problemId, phase, predictionsCorrect, hintsUsed, timeSpent } = req.body;

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: '[SYSTEM] Problem not found.'
      });
    }

    const user = await User.findById(req.user._id);

    // Verify user can access this phase
    if (!problem.availableInPhases.includes(phase)) {
      return res.status(403).json({
        success: false,
        message: '[SYSTEM] This problem is not available in your current phase.'
      });
    }

    // Create attempt record
    const attempt = new Attempt({
      user: req.user._id,
      problem: problemId,
      phase,
      code,
      predictionsAttempted: predictionsCorrect?.total || 0,
      predictionsCorrect: predictionsCorrect?.correct || 0,
      hintsUsed: hintsUsed || 0,
      timeToSolve: timeSpent || 0,
      startedAt: new Date(Date.now() - (timeSpent || 0))
    });

    // Run against all test cases
    const testResults = [];
    let allPassed = true;
    let totalTime = 0;
    let maxMemory = 0;

    for (let i = 0; i < problem.testCases.length; i++) {
      const testCase = problem.testCases[i];
      
      const result = await executePython(code, testCase.input, {
        timeLimit: problem.constraints.timeLimit,
        memoryLimit: problem.constraints.memoryLimit
      });

      const passed = result.output?.trim() === testCase.expectedOutput.trim();
      
      testResults.push({
        testCaseIndex: i,
        passed,
        actualOutput: result.output,
        expectedOutput: testCase.expectedOutput,
        executionTime: result.executionTime,
        memoryUsed: result.memoryUsed,
        error: result.error
      });

      if (!passed) allPassed = false;
      totalTime += result.executionTime || 0;
      maxMemory = Math.max(maxMemory, result.memoryUsed || 0);

      // Stop on first failure for time efficiency
      if (!passed && result.status !== 'success') break;
    }

    // Analyze code for mistakes
    const analysis = analyzeCode(code, testResults, problem);

    // Update attempt
    attempt.testResults = testResults;
    attempt.totalTestCases = problem.testCases.length;
    attempt.passedTestCases = testResults.filter(r => r.passed).length;
    attempt.executionTime = totalTime;
    attempt.memoryUsed = maxMemory;
    attempt.status = allPassed ? 'accepted' : 
                    testResults.some(r => r.error?.includes('timeout')) ? 'time-limit' :
                    testResults.some(r => r.error?.includes('memory')) ? 'memory-limit' :
                    testResults.some(r => r.error) ? 'runtime-error' : 'wrong-answer';
    attempt.mistakeType = analysis.mistakeType;
    attempt.mistakeDetails = analysis.mistakeDetails;
    attempt.feedback = analysis.feedback;

    // Calculate rewards
    let xpEarned = 0;
    let goldEarned = 0;

    if (allPassed) {
      xpEarned = problem.xpReward;
      goldEarned = problem.goldReward;

      // Check if first time solving
      const progress = await Progress.findOne({ user: req.user._id });
      const alreadySolved = progress?.solvedProblems.some(
        p => p.problem.toString() === problemId
      );

      if (!alreadySolved) {
        xpEarned += problem.firstTimeBonus;
        
        // Add to solved problems
        progress.solvedProblems.push({
          problem: problemId,
          attempts: 1,
          bestTime: totalTime,
          bestMemory: maxMemory,
          phase
        });

        // Update zone progress
        if (progress.zoneProgress[problem.zone]) {
          progress.zoneProgress[problem.zone].problemsSolved += 1;
        }

        await progress.save();

        // Update user stats
        user.totalProblemsSolved += 1;
        user.stats.strength += problem.statsGain.strength;
        user.stats.intelligence += problem.statsGain.intelligence;
        user.stats.agility += problem.statsGain.agility;
        user.stats.endurance += problem.statsGain.endurance;
        user.stats.sense += problem.statsGain.sense;
      }

      // Penalty for hints
      if (hintsUsed > 0) {
        xpEarned = Math.floor(xpEarned * (1 - (hintsUsed * 0.1)));
      }

      // Update user XP and gold
      user.currentXP += xpEarned;
      user.totalXP += xpEarned;
      user.gold += goldEarned;
      user.dailyQuests.problemsSolved += 1;

      // Check for level up
      const xpNeeded = user.getXPForNextLevel();
      while (user.currentXP >= xpNeeded) {
        user.currentXP -= xpNeeded;
        user.level += 1;
      }

      await user.save();
    } else {
      // Track mistake
      if (analysis.mistakeType !== 'none') {
        const existingMistake = user.mistakePatterns.find(
          m => m.type === analysis.mistakeType
        );
        if (existingMistake) {
          existingMistake.count += 1;
          existingMistake.lastOccurred = new Date();
        } else {
          user.mistakePatterns.push({
            type: analysis.mistakeType,
            count: 1,
            lastOccurred: new Date()
          });
        }
        await user.save();
      }
    }

    attempt.xpEarned = xpEarned;
    attempt.goldEarned = goldEarned;
    await attempt.save();

    // Update problem stats
    problem.totalAttempts += 1;
    if (allPassed) problem.totalSolved += 1;
    await problem.save();

    res.json({
      success: true,
      message: allPassed 
        ? '[SYSTEM] All test cases passed! Victory!' 
        : '[SYSTEM] Some test cases failed. Analyze and retry.',
      data: {
        status: attempt.status,
        passed: allPassed,
        testResults: testResults.map(r => ({
          ...r,
          expectedOutput: r.passed ? r.expectedOutput : undefined // Hide expected on failure
        })),
        passedCount: attempt.passedTestCases,
        totalCount: attempt.totalTestCases,
        executionTime: totalTime,
        memoryUsed: maxMemory,
        feedback: analysis.feedback,
        rewards: {
          xpEarned,
          goldEarned,
          statsGained: allPassed ? problem.statsGain : null
        },
        user: {
          level: user.level,
          currentXP: user.currentXP,
          xpForNextLevel: user.getXPForNextLevel(),
          gold: user.gold,
          totalProblemsSolved: user.totalProblemsSolved
        }
      }
    });
  } catch (error) {
    console.error('[SYSTEM ERROR]', error);
    res.status(500).json({
      success: false,
      message: '[SYSTEM] Submission failed.'
    });
  }
});

// @route   POST /api/execute/validate
// @desc    Validate code structure (for guided mode)
// @access  Private
router.post('/validate', auth, async (req, res) => {
  try {
    const { code, problemId, step } = req.body;

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: '[SYSTEM] Problem not found.'
      });
    }

    // Basic syntax check
    const syntaxResult = await executePython(`
import ast
try:
    ast.parse('''${code.replace(/'/g, "\\'")}''')
    print("VALID")
except SyntaxError as e:
    print(f"SYNTAX_ERROR:{e.lineno}:{e.msg}")
`, '', { timeLimit: 5000 });

    const isValid = syntaxResult.output?.trim() === 'VALID';
    let syntaxError = null;

    if (!isValid && syntaxResult.output?.startsWith('SYNTAX_ERROR')) {
      const parts = syntaxResult.output.split(':');
      syntaxError = {
        line: parseInt(parts[1]),
        message: parts.slice(2).join(':')
      };
    }

    res.json({
      success: true,
      data: {
        valid: isValid,
        syntaxError
      }
    });
  } catch (error) {
    console.error('[SYSTEM ERROR]', error);
    res.status(500).json({
      success: false,
      message: '[SYSTEM] Validation failed.'
    });
  }
});

module.exports = router;
