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
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };
  
  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email required';
    if (!formData.password) newErrors.password = 'Password required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    const result = await login(formData.email, formData.password);
    setLoading(false);
    
    if (result.success) {
      toast.success('[SYSTEM] Identity verified. Welcome back, Hunter.');
      navigate('/dashboard');
    } else {
      toast.error(`[SYSTEM] ${result.message}`);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 mx-auto mb-6 glass-panel rounded-full flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-4xl text-primary">
              shield_person
            </span>
          </motion.div>
          
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-primary">HUNTER</span> LOGIN
          </h1>
          <p className="text-gray-500 text-sm font-mono">
            [SYSTEM] Verify your identity
          </p>
        </div>
        
        {/* Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="glass-panel p-8 rounded-xl"
        >
          {/* Email */}
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2 font-mono">
              <span className="material-symbols-outlined text-sm align-middle mr-1">
                mail
              </span>
              EMAIL
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full bg-void border ${
                errors.email ? 'border-red-500' : 'border-gray-700'
              } rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors`}
              placeholder="hunter@example.com"
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          
          {/* Password */}
          <div className="mb-8">
            <label className="block text-sm text-gray-400 mb-2 font-mono">
              <span className="material-symbols-outlined text-sm align-middle mr-1">
                lock
              </span>
              PASSWORD
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full bg-void border ${
                errors.password ? 'border-red-500' : 'border-gray-700'
              } rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password}</p>
            )}
          </div>
          
          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-primary to-blue-400 rounded-lg font-bold text-black tracking-wider hover:shadow-neon transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin">
                  progress_activity
                </span>
                VERIFYING...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">login</span>
                ENTER SYSTEM
              </>
            )}
          </button>
        </motion.form>
        
        {/* Footer Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-gray-500 text-sm">
            New Hunter?{' '}
            <Link 
              to="/register" 
              className="text-primary hover:underline"
            >
              Awaken Now
            </Link>
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-400 text-sm mt-4"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Landing
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
