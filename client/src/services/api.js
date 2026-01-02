import axios from 'axios';

// Create axios instance with base config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 second timeout for code execution
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Token is added in authStore after login
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - clear auth and redirect
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }
      
      if (status === 403) {
        // Forbidden - typically phase/rank restriction
        console.warn('[SYSTEM] Access denied:', data.message);
      }
      
      if (status === 429) {
        // Rate limited
        console.warn('[SYSTEM] Rate limited. Please wait.');
      }
    } else if (error.request) {
      // Network error
      console.error('[SYSTEM] Network error - server unreachable');
    }
    
    return Promise.reject(error);
  }
);

// API Methods

// Auth
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (hunterName, email, password) => api.post('/auth/register', { 
    username: hunterName.toLowerCase().replace(/\s+/g, '_'), 
    hunterName, 
    email, 
    password 
  }),
  getProfile: () => api.get('/users/profile')
};

// Users
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  addXP: (amount, source) => api.post('/users/add-xp', { amount, source }),
  addStats: (stats) => api.post('/users/add-stats', { stats }),
  getDailyQuests: () => api.get('/users/daily-quests')
};

// Problems
export const problemAPI = {
  getAll: (params) => api.get('/problems', { params }),
  getById: (slug, phase) => api.get(`/problems/${slug}`, { params: { phase } }),
  getBySlug: (slug, phase) => api.get(`/problems/${slug}`, { params: { phase } }),
  getByZone: (zone) => api.get(`/problems/zone/${zone}`),
  unlockHint: (id, hintIndex) => api.post(`/problems/${id}/hint`, { hintIndex })
};

// Progress
export const progressAPI = {
  getAll: () => api.get('/progress'),
  getByZone: (zone) => api.get(`/progress/${zone}`),
  completeVisualization: (zone) => 
    api.post('/progress/complete-visualization', { zone }),
  completeGuided: (zone) => 
    api.post('/progress/complete-guided', { zone }),
  // Generic method for completing any phase (routes to specific endpoints)
  completePhase: (problemSlug, phase, zone) => {
    if (phase === 'visualization') {
      return api.post('/progress/complete-visualization', { zone, problemSlug });
    } else if (phase === 'guided') {
      return api.post('/progress/complete-guided', { zone, problemSlug });
    }
    return api.post('/progress/complete-autonomous', { zone, problemSlug });
  },
  savePrediction: (problemId, predictionIndex, answer, correct) =>
    api.post('/progress/prediction', { problemId, predictionIndex, answer, correct }),
  unlockZone: (zone) => api.post('/progress/unlock-zone', { zone }),
  defeatBoss: (zone, bossId, timeToDefeat, hintsUsed) =>
    api.post('/progress/defeat-boss', { zone, bossId, timeToDefeat, hintsUsed }),
  getStats: () => api.get('/progress/stats')
};

// Code Execution (routes are /api/execute/*)
export const executionAPI = {
  runCode: (data) => api.post('/execute/run', data),
  submitSolution: (data) => api.post('/execute/submit', data),
  run: (code, problemId, testInput) => 
    api.post('/execute/run', { code, problemId, testInput }),
  submit: (code, problemId, phase, hintsUsed, timeSpent, predictionsCorrect) =>
    api.post('/execute/submit', { code, problemId, phase, hintsUsed, timeSpent, predictionsCorrect }),
  validate: (code, problemId) =>
    api.post('/execute/validate', { code, problemId })
};

// Boss Battles
export const bossAPI = {
  getBoss: (zoneId) => api.get(`/problems/zone/${zoneId}`, { params: { isBossBattle: true } }),
  submitBossAttempt: (code, problemId, phase, timeSpent) =>
    api.post('/execute/submit', { code, problemId, phase, timeSpent })
};

// Rank System
export const rankAPI = {
  checkRankUp: () => api.get('/users/check-rank'),
  performRankUp: () => api.post('/users/rank-up')
};

// Zone Management  
export const zoneAPI = {
  getAll: () => api.get('/problems/zones'),
  unlock: (zone) => api.post('/progress/unlock-zone', { zone }),
  getProgress: (zone) => api.get(`/progress/${zone}`)
};

export default api;
