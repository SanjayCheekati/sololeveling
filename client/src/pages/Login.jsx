import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('[SYSTEM] All fields are required');
      return;
    }
    
    setLoading(true);
    
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      toast.success(`[SYSTEM] Welcome back, Hunter ${result.user.hunterName}`);
      navigate('/dashboard');
    } else {
      toast.error(`[SYSTEM] ${result.message}`);
    }
    
    setLoading(false);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-void via-void to-primary/5" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-[100px]" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 grid-bg opacity-20" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-8 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="text-sm">Back to Gateway</span>
        </Link>
        
        {/* Login Card */}
        <div className="glass-panel-strong rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/20 border border-primary/50 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-3xl text-primary">
                shield_person
              </span>
            </motion.div>
            
            <h1 className="text-2xl font-bold mb-2">
              <span className="text-primary">HUNTER</span> LOGIN
            </h1>
            <p className="text-sm text-gray-500 font-mono">
              [SYSTEM] Verify your identity to continue
            </p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-primary">mail</span>
                  Hunter ID (Email)
                </span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="hunter@system.io"
                  className="w-full px-4 py-3 bg-void border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-primary">lock</span>
                  Access Code (Password)
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-void border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
            
            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-lg font-bold tracking-wider relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-dark via-primary to-primary-light" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-primary via-accent to-primary animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
              
              <span className="relative flex items-center justify-center gap-2 text-white">
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    AUTHENTICATING...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">login</span>
                    CONNECT TO SYSTEM
                  </>
                )}
              </span>
            </motion.button>
          </form>
          
          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-xs text-gray-600">OR</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>
          
          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Not awakened yet?{' '}
              <Link
                to="/register"
                className="text-primary hover:text-primary-light transition-colors font-semibold"
              >
                Begin Awakening
              </Link>
            </p>
          </div>
        </div>
        
        {/* System Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-gray-600 font-mono">
            [SYSTEM] Unauthorized access attempts will be logged
          </p>
        </motion.div>
      </motion.div>
      
      {/* Corner Decorations */}
      <div className="absolute top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-primary/20 rounded-tl-xl" />
      <div className="absolute top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-primary/20 rounded-tr-xl" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-primary/20 rounded-bl-xl" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-primary/20 rounded-br-xl" />
    </div>
  );
};

export default Login;
