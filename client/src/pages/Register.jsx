import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  
  const [formData, setFormData] = useState({
    hunterName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [awakeningPhase, setAwakeningPhase] = useState(0);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.hunterName) {
      newErrors.hunterName = 'Hunter name required';
    } else if (formData.hunterName.length < 3) {
      newErrors.hunterName = 'Min 3 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Min 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setAwakeningPhase(1);
    
    // Simulate awakening sequence
    await new Promise(r => setTimeout(r, 1000));
    setAwakeningPhase(2);
    await new Promise(r => setTimeout(r, 800));
    setAwakeningPhase(3);
    
    const result = await register(
      formData.hunterName,
      formData.email,
      formData.password
    );
    
    setLoading(false);
    
    if (result.success) {
      setAwakeningPhase(4);
      toast.success('[SYSTEM] Awakening complete. Welcome, Hunter!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } else {
      setAwakeningPhase(0);
      toast.error(`[SYSTEM] ${result.message}`);
    }
  };
  
  const awakeningMessages = [
    '',
    '[SYSTEM] Initializing neural link...',
    '[SYSTEM] Calibrating stats...',
    '[SYSTEM] Assigning rank...',
    '[SYSTEM] AWAKENING COMPLETE!'
  ];
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Awakening Overlay */}
        {awakeningPhase > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-void/95 z-50 flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: awakeningPhase === 4 ? 360 : 0
                }}
                transition={{ 
                  scale: { duration: 1, repeat: awakeningPhase < 4 ? Infinity : 0 },
                  rotate: { duration: 0.5 }
                }}
                className="w-24 h-24 mx-auto mb-8 glass-panel rounded-full flex items-center justify-center border-2 border-primary"
              >
                <span className="material-symbols-outlined text-5xl text-primary">
                  {awakeningPhase === 4 ? 'check_circle' : 'settings'}
                </span>
              </motion.div>
              
              <p className="text-primary font-mono text-lg animate-pulse">
                {awakeningMessages[awakeningPhase]}
              </p>
              
              {awakeningPhase === 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <p className="text-2xl font-bold">
                    Welcome, <span className="text-primary">{formData.hunterName}</span>
                  </p>
                  <p className="text-gray-400 mt-2">Rank: <span className="text-gray-300">E</span></p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
        
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 mx-auto mb-6 glass-panel rounded-full flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-4xl text-primary">
              flash_on
            </span>
          </motion.div>
          
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-primary">HUNTER</span> REGISTRATION
          </h1>
          <p className="text-gray-500 text-sm font-mono">
            [SYSTEM] Begin awakening protocol
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
          {/* Hunter Name */}
          <div className="mb-5">
            <label className="block text-sm text-gray-400 mb-2 font-mono">
              <span className="material-symbols-outlined text-sm align-middle mr-1">
                badge
              </span>
              HUNTER NAME
            </label>
            <input
              type="text"
              name="hunterName"
              value={formData.hunterName}
              onChange={handleChange}
              className={`w-full bg-void border ${
                errors.hunterName ? 'border-red-500' : 'border-gray-700'
              } rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors`}
              placeholder="SungJinWoo"
            />
            {errors.hunterName && (
              <p className="text-red-400 text-xs mt-1">{errors.hunterName}</p>
            )}
          </div>
          
          {/* Email */}
          <div className="mb-5">
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
          <div className="mb-5">
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
          
          {/* Confirm Password */}
          <div className="mb-8">
            <label className="block text-sm text-gray-400 mb-2 font-mono">
              <span className="material-symbols-outlined text-sm align-middle mr-1">
                lock
              </span>
              CONFIRM PASSWORD
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full bg-void border ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-700'
              } rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
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
                AWAKENING...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">flash_on</span>
                BEGIN AWAKENING
              </>
            )}
          </button>
          
          {/* Initial Stats Preview */}
          <div className="mt-6 p-4 bg-void/50 rounded-lg border border-gray-800">
            <p className="text-xs text-gray-500 font-mono mb-3">
              [SYSTEM] Initial Stats Preview
            </p>
            <div className="grid grid-cols-5 gap-2 text-center">
              {['STR', 'INT', 'AGI', 'END', 'SENSE'].map((stat) => (
                <div key={stat} className="text-xs">
                  <span className="text-gray-500">{stat}</span>
                  <p className="text-primary font-bold">10</p>
                </div>
              ))}
            </div>
          </div>
        </motion.form>
        
        {/* Footer Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-gray-500 text-sm">
            Already awakened?{' '}
            <Link 
              to="/login" 
              className="text-primary hover:underline"
            >
              Login Here
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

export default Register;
