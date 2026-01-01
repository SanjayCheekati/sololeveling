import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      loading: true,
      
      // Actions
      setLoading: (loading) => set({ loading }),
      
      login: async (email, password) => {
        try {
          const response = await api.post('/auth/login', { email, password });
          const { token, user } = response.data.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
            loading: false
          });
          
          // Set token for future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          return { success: true, user };
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed';
          return { success: false, message };
        }
      },
      
      register: async (hunterName, email, password) => {
        try {
          const response = await api.post('/auth/register', {
            username: hunterName.toLowerCase().replace(/\s+/g, '_'),
            hunterName,
            email,
            password
          });
          const { token, user } = response.data.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
            loading: false
          });
          
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          return { success: true, user };
        } catch (error) {
          const message = error.response?.data?.message || 'Registration failed';
          return { success: false, message };
        }
      },
      
      logout: () => {
        delete api.defaults.headers.common['Authorization'];
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false
        });
      },
      
      fetchProfile: async () => {
        const token = get().token;
        if (!token) {
          set({ loading: false });
          return;
        }
        
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/users/profile');
          const userData = response.data?.data?.user || response.data?.user || response.data;
          set({
            user: userData,
            isAuthenticated: true,
            loading: false
          });
        } catch (error) {
          // Token invalid/expired
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false
          });
        }
      },
      
      updateUser: (updates) => {
        set((state) => ({
          user: { ...state.user, ...updates }
        }));
      },
      
      addXP: async (amount) => {
        try {
          const response = await api.post('/users/xp', { amount });
          set({ user: response.data.user });
          return response.data;
        } catch (error) {
          console.error('Failed to add XP:', error);
          return null;
        }
      },
      
      addStats: async (stats) => {
        try {
          const response = await api.post('/users/stats', stats);
          set({ user: response.data });
          return response.data;
        } catch (error) {
          console.error('Failed to add stats:', error);
          return null;
        }
      },
      
      // Computed values
      getRankColor: () => {
        const rank = get().user?.rank || 'E';
        const colors = {
          'E': '#6b7280', // Gray
          'D': '#22c55e', // Green
          'C': '#3b82f6', // Blue
          'B': '#a855f7', // Purple
          'A': '#f97316', // Orange
          'S': '#ef4444'  // Red
        };
        return colors[rank] || colors['E'];
      },
      
      getXPProgress: () => {
        const user = get().user;
        if (!user) return 0;
        const xpForNext = user.xpForNextLevel || user.xpToNextLevel || 100;
        const currentXP = user.currentXP || user.xp || 0;
        return Math.min((currentXP / xpForNext) * 100, 100);
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

// Initialize auth on app load
const initAuth = async () => {
  const state = useAuthStore.getState();
  if (state.token) {
    await state.fetchProfile();
  } else {
    state.setLoading(false);
  }
};

initAuth();

export default useAuthStore;
