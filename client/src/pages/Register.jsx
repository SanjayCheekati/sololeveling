import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    hunterName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [awakeningComplete, setAwakeningComplete] = useState(false);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleStep1 = (e) => {
    e.preventDefault();
    if (!formData.hunterName.trim()) {
      toast.error('[SYSTEM] Hunter name is required');
      return;
    }
    if (formData.hunterName.length < 3) {
      toast.error('[SYSTEM] Hunter name must be at least 3 characters');
      return;
    }
    setStep(2);
  };
  
  const handleStep2 = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('[SYSTEM] All fields are required');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('[SYSTEM] Password must be at least 6 characters');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('[SYSTEM] Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    const result = await register(formData.hunterName, formData.email, formData.password);
    
    if (result.success) {
      setAwakeningComplete(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } else {
      toast.error(`[SYSTEM] ${result.message}`);
    }
    
    setLoading(false);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-void via-void to-primary/5" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-[100px]" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 grid-bg opacity-20" />
      
      {/* Awakening Complete Animation */}
      <AnimatePresence>
        {awakeningComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-void flex items-center justify-center"
          >
            <div className="text-center">
              {/* Shockwave Effect */}
              <div className="relative">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 rounded-full border-2 border-primary"
                    initial={{ width: 0, height: 0, x: '-50%', y: '-50%', opacity: 1 }}
                    animate={{ 
                      width: [0, 400], 
                      height: [0, 400], 
                      opacity: [1, 0] 
                    }}
                    transition={{ 
                      duration: 1.5, 
                      delay: i * 0.3,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                  />
                ))}
                
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.8, type: "spring" }}
                  className="w-32 h-32 mx-auto rounded-2xl bg-primary/20 border-2 border-primary flex items-center justify-center shadow-neon-strong"
                >
                  <span className="material-symbols-outlined text-6xl text-primary neon-text">
                    flash_on
                  </span>
                </motion.div>
              </div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-4xl font-bold mt-8 mb-4"
              >
                <span className="text-primary neon-text-strong">AWAKENING</span>
                <span className="text-white"> COMPLETE</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-gray-400 font-mono"
              >
                [SYSTEM] Welcome, Hunter {formData.hunterName}
              </motion.p>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-sm text-primary mt-4"
              >
                Initializing Hunter Dashboard...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
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
        
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-gray-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-primary bg-primary/20' : 'border-gray-700'}`}>
              {step > 1 ? (
                <span className="material-symbols-outlined text-sm">check</span>
              ) : (
                <span className="text-sm font-bold">1</span>
              )}
            </div>
            <span className="text-sm">Identity</span>
          </div>
          
          <div className={`w-8 h-px ${step >= 2 ? 'bg-primary' : 'bg-gray-700'}`} />
          
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-gray-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-primary bg-primary/20' : 'border-gray-700'}`}>
              <span className="text-sm font-bold">2</span>
            </div>
            <span className="text-sm">Access</span>
          </div>
        </div>
        
        {/* Registration Card */}
        <div className="glass-panel-strong rounded-2xl p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/20 border border-primary/50 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-3xl text-primary">
                      person_add
                    </span>
                  </motion.div>
                  
                  <h1 className="text-2xl font-bold mb-2">
                    <span className="text-primary">HUNTER</span> REGISTRATION
                  </h1>
                  <p className="text-sm text-gray-500 font-mono">
                    [SYSTEM] Step 1: Choose your Hunter identity
                  </p>
                </div>
                
                {/* Form */}
                <form onSubmit={handleStep1} className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-primary">badge</span>
                        Hunter Name
                      </span>
                    </label>
                    <input
                      type="text"
                      name="hunterName"
                      value={formData.hunterName}
                      onChange={handleChange}
                      placeholder="Enter your Hunter name"
                      className="w-full px-4 py-3 bg-void border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                      maxLength={20}
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      This will be your identity in the System
                    </p>
                  </div>
                  
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-lg font-bold tracking-wider relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-dark via-primary to-primary-light" />
                    <span className="relative flex items-center justify-center gap-2 text-white">
                      CONTINUE
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </span>
                  </motion.button>
                </form>
              </motion.div>
            )}
            
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/20 border border-primary/50 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-3xl text-primary">
                      security
                    </span>
                  </motion.div>
                  
                  <h1 className="text-2xl font-bold mb-2">
                    Welcome, <span className="text-primary">{formData.hunterName}</span>
                  </h1>
                  <p className="text-sm text-gray-500 font-mono">
                    [SYSTEM] Step 2: Secure your access
                  </p>
                </div>
                
                {/* Form */}
                <form onSubmit={handleStep2} className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-primary">mail</span>
                        Email Address
                      </span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="hunter@system.io"
                      className="w-full px-4 py-3 bg-void border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-primary">lock</span>
                        Password
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
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-primary">lock</span>
                        Confirm Password
                      </span>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-void border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-4 rounded-lg glass-panel border-gray-700 text-gray-400 hover:text-white hover:border-primary/30 transition-all"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back
                      </span>
                    </button>
                    
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-[2] py-4 rounded-lg font-bold tracking-wider relative overflow-hidden group disabled:opacity-50"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-dark via-primary to-primary-light" />
                      <span className="relative flex items-center justify-center gap-2 text-white">
                        {loading ? (
                          <>
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                            AWAKENING...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined">flash_on</span>
                            COMPLETE AWAKENING
                          </>
                        )}
                      </span>
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-xs text-gray-600">OR</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>
          
          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Already awakened?{' '}
              <Link
                to="/login"
                className="text-primary hover:text-primary-light transition-colors font-semibold"
              >
                Return to System
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
            [SYSTEM] By registering, you accept the System's authority
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

export default Register;
