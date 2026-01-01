import { create } from 'zustand';
import api from '../services/api';

export const useProgressStore = create((set, get) => ({
  // State
  progress: {},
  currentProblem: null,
  currentPhase: 'visual',
  loading: false,
  error: null,
  
  // Zone Management
  zones: {
    arrays: { name: 'Arrays Zone', icon: 'grid_view', unlocked: true },
    stacks: { name: 'Stacks Zone', icon: 'layers', unlocked: true },
    'binary-trees': { name: 'Binary Trees Zone', icon: 'account_tree', unlocked: false },
    recursion: { name: 'Recursion Zone', icon: 'all_inclusive', unlocked: false }
  },
  
  // Actions
  fetchProgress: async (zone) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/progress/${zone}`);
      const data = response.data?.data || response.data;
      set((state) => ({
        progress: { ...state.progress, [zone]: data },
        loading: false
      }));
      return data;
    } catch (error) {
      set({ loading: false, error: error.response?.data?.message });
      return null;
    }
  },
  
  fetchAllProgress: async () => {
    set({ loading: true });
    const zones = ['arrays', 'stacks', 'binary-trees', 'recursion'];
    
    const progressMap = {};
    for (const zone of zones) {
      try {
        const response = await api.get(`/progress/${zone}`);
        progressMap[zone] = response.data;
      } catch (error) {
        progressMap[zone] = null;
      }
    }
    
    set({ progress: progressMap, loading: false });
    return progressMap;
  },
  
  // Phase Management
  setCurrentPhase: (phase) => set({ currentPhase: phase }),
  
  completePhase: async (zone, problemId, phase) => {
    try {
      const response = await api.post(`/progress/${zone}/complete-phase`, {
        problemId,
        phase
      });
      
      // Update local progress
      set((state) => ({
        progress: {
          ...state.progress,
          [zone]: response.data.progress
        }
      }));
      
      return response.data;
    } catch (error) {
      console.error('Failed to complete phase:', error);
      return null;
    }
  },
  
  // Problem Management
  setCurrentProblem: (problem) => set({ currentProblem: problem }),
  
  fetchProblems: async (zone) => {
    try {
      const response = await api.get(`/problems?zone=${zone}`);
      return response.data?.data?.problems || response.data?.problems || [];
    } catch (error) {
      console.error('Failed to fetch problems:', error);
      return [];
    }
  },
  
  fetchProblem: async (slug) => {
    set({ loading: true });
    try {
      const response = await api.get(`/problems/${slug}`);
      const data = response.data?.data || response.data;
      set({ currentProblem: data, loading: false });
      return data;
    } catch (error) {
      set({ loading: false, error: error.response?.data?.message });
      return null;
    }
  },
  
  // Prediction Tracking
  savePrediction: async (zone, problemId, prediction) => {
    try {
      const response = await api.post(`/progress/${zone}/prediction`, {
        problemId,
        prediction
      });
      return response.data;
    } catch (error) {
      console.error('Failed to save prediction:', error);
      return null;
    }
  },
  
  // Analytics
  getZoneStats: (zone) => {
    const progress = get().progress[zone];
    if (!progress) return null;
    
    return {
      totalProblems: progress.totalProblems || 0,
      solvedProblems: progress.solvedProblems?.length || 0,
      completionRate: progress.completionRate || 0,
      avgAttempts: progress.analytics?.averageAttempts || 0,
      avgTimeSpent: progress.analytics?.averageTimeSpent || 0
    };
  },
  
  // Zone Unlock Check
  checkZoneUnlock: async (zone) => {
    try {
      const response = await api.post(`/progress/${zone}/check-unlock`);
      
      if (response.data.unlocked) {
        set((state) => ({
          zones: {
            ...state.zones,
            [zone]: { ...state.zones[zone], unlocked: true }
          }
        }));
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to check zone unlock:', error);
      return { unlocked: false };
    }
  },
  
  // Hint Management
  unlockHint: async (problemSlug, hintIndex) => {
    try {
      const response = await api.post(`/problems/${problemSlug}/hints/${hintIndex}`);
      
      // Update current problem with unlocked hint
      set((state) => ({
        currentProblem: {
          ...state.currentProblem,
          hints: state.currentProblem.hints.map((h, i) =>
            i === hintIndex ? { ...h, unlocked: true } : h
          )
        }
      }));
      
      return response.data;
    } catch (error) {
      console.error('Failed to unlock hint:', error);
      return null;
    }
  },
  
  // Reset
  resetProgress: () => set({
    progress: {},
    currentProblem: null,
    currentPhase: 'visual',
    loading: false,
    error: null
  })
}));

export default useProgressStore;
