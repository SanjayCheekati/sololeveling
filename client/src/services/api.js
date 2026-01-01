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
  getBySlug: (slug) => api.get(`/problems/${slug}`),
  getByZone: (zone) => api.get('/problems', { params: { zone } }),
  unlockHint: (slug, hintIndex) => api.post(`/problems/${slug}/hints/${hintIndex}`)
};

// Progress
export const progressAPI = {
  getByZone: (zone) => api.get(`/progress/${zone}`),
  completePhase: (zone, problemId, phase) => 
    api.post(`/progress/${zone}/complete-phase`, { problemId, phase }),
  savePrediction: (zone, problemId, prediction) =>
    api.post(`/progress/${zone}/prediction`, { problemId, prediction }),
  checkUnlock: (zone) => api.post(`/progress/${zone}/check-unlock`),
  getStats: (zone) => api.get(`/progress/${zone}/stats`)
};

// Code Execution
export const executionAPI = {
  run: (code, problemId, testInput) => 
    api.post('/execute/run', { code, problemId, testInput }),
  submit: (code, problemId, phase, hintsUsed, timeSpent) =>
    api.post('/execute/submit', { code, problemId, phase, hintsUsed, timeSpent }),
  validate: (code, problemId) =>
    api.post('/execute/validate', { code, problemId })
};

export default api;
