const { spawn } = require('child_process');
const path = require('path');

/**
 * Execute Python code with time and memory limits
 */
async function executePython(code, input, options = {}) {
  const { timeLimit = 5000, memoryLimit = 128 } = options;

  return new Promise((resolve) => {
    const startTime = Date.now();
    let output = '';
    let error = '';
    let killed = false;

    // Wrap code with execution harness
    const wrappedCode = `
import sys
import resource
import signal

# Set memory limit (in bytes)
try:
    resource.setrlimit(resource.RLIMIT_AS, (${memoryLimit * 1024 * 1024}, ${memoryLimit * 1024 * 1024}))
except:
    pass  # Windows doesn't support resource limits

# Timeout handler
def timeout_handler(signum, frame):
    print("TIMEOUT_ERROR", file=sys.stderr)
    sys.exit(1)

try:
    signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(${Math.ceil(timeLimit / 1000)})
except:
    pass  # Windows doesn't support SIGALRM

# User code
try:
${code.split('\n').map(line => '    ' + line).join('\n')}
except MemoryError:
    print("MEMORY_ERROR", file=sys.stderr)
    sys.exit(1)
except Exception as e:
    print(f"RUNTIME_ERROR: {type(e).__name__}: {e}", file=sys.stderr)
    sys.exit(1)
`;

    const pythonProcess = spawn(process.env.PYTHON_PATH || 'python', ['-c', wrappedCode]);

    // Send input
    if (input) {
      pythonProcess.stdin.write(input);
      pythonProcess.stdin.end();
    }

    // Set timeout
    const timeout = setTimeout(() => {
      killed = true;
      pythonProcess.kill('SIGKILL');
    }, timeLimit + 1000); // Extra buffer

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (exitCode) => {
      clearTimeout(timeout);
      const executionTime = Date.now() - startTime;

      if (killed) {
        resolve({
          output: null,
          error: 'Time Limit Exceeded',
          executionTime: timeLimit,
          memoryUsed: 0,
          status: 'timeout'
        });
        return;
      }

      if (error.includes('TIMEOUT_ERROR')) {
        resolve({
          output: null,
          error: 'Time Limit Exceeded',
          executionTime: timeLimit,
          memoryUsed: 0,
          status: 'timeout'
        });
        return;
      }

      if (error.includes('MEMORY_ERROR')) {
        resolve({
          output: null,
          error: 'Memory Limit Exceeded',
          executionTime,
          memoryUsed: memoryLimit,
          status: 'memory'
        });
        return;
      }

      if (error.includes('RUNTIME_ERROR')) {
        resolve({
          output: null,
          error: error.replace('RUNTIME_ERROR: ', ''),
          executionTime,
          memoryUsed: 0,
          status: 'runtime_error'
        });
        return;
      }

      resolve({
        output: output.trim(),
        error: error || null,
        executionTime,
        memoryUsed: 0, // Would need psutil for accurate memory tracking
        status: exitCode === 0 ? 'success' : 'error'
      });
    });

    pythonProcess.on('error', (err) => {
      clearTimeout(timeout);
      resolve({
        output: null,
        error: `Execution Error: ${err.message}`,
        executionTime: 0,
        memoryUsed: 0,
        status: 'error'
      });
    });
  });
}

/**
 * Analyze submitted code for common mistakes
 */
function analyzeCode(code, testResults, problem) {
  const feedback = {
    message: '',
    suggestions: [],
    conceptsToReview: []
  };

  let mistakeType = 'none';
  let mistakeDetails = '';

  // Check for common mistake patterns
  const codeLower = code.toLowerCase();

  // Off-by-one errors
  if (codeLower.includes('range(len') && !codeLower.includes('range(len(') ||
      codeLower.includes('< len') && codeLower.includes('<=')) {
    mistakeType = 'off-by-one';
    mistakeDetails = 'Possible off-by-one error in loop bounds';
    feedback.suggestions.push('Check your loop boundaries carefully');
    feedback.conceptsToReview.push('Array indexing');
  }

  // Null/None checks
  if ((problem.zone === 'binary-trees' || problem.zone === 'recursion') &&
      !codeLower.includes('if not') && !codeLower.includes('is none') &&
      !codeLower.includes('== none')) {
    mistakeType = 'null-check';
    mistakeDetails = 'Missing null/None check for edge cases';
    feedback.suggestions.push('Add base case checks for None/null values');
    feedback.conceptsToReview.push('Base cases in recursion');
  }

  // Check test results for patterns
  const failedTests = testResults.filter(r => !r.passed);
  
  if (failedTests.length > 0) {
    // Check if it's an edge case failure
    if (failedTests.some(t => t.actualOutput === '' || t.actualOutput === 'None')) {
      if (mistakeType === 'none') {
        mistakeType = 'edge-case';
        mistakeDetails = 'Edge case handling issue';
      }
      feedback.suggestions.push('Consider edge cases like empty inputs');
    }

    // Check for logic errors
    if (failedTests.every(t => t.actualOutput && t.actualOutput !== t.expectedOutput)) {
      if (mistakeType === 'none') {
        mistakeType = 'logic';
        mistakeDetails = 'Algorithm logic error';
      }
      feedback.suggestions.push('Review your algorithm logic step by step');
    }
  }

  // Check for runtime errors
  if (testResults.some(r => r.error?.includes('RUNTIME_ERROR'))) {
    const errorTest = testResults.find(r => r.error?.includes('RUNTIME_ERROR'));
    
    if (errorTest.error.includes('IndexError')) {
      mistakeType = 'logic';
      mistakeDetails = 'Array index out of bounds';
      feedback.suggestions.push('Check array bounds before accessing elements');
    } else if (errorTest.error.includes('TypeError')) {
      mistakeType = 'syntax';
      mistakeDetails = 'Type mismatch error';
      feedback.suggestions.push('Verify variable types match expected operations');
    }
  }

  // Generate feedback message
  if (testResults.every(r => r.passed)) {
    feedback.message = 'Excellent work, Hunter! All test cases passed.';
  } else {
    const passedCount = testResults.filter(r => r.passed).length;
    feedback.message = `${passedCount}/${testResults.length} test cases passed. Keep analyzing!`;
  }

  return {
    mistakeType,
    mistakeDetails,
    feedback
  };
}

module.exports = {
  executePython,
  analyzeCode
};
