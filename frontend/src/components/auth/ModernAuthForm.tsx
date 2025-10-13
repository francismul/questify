'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  GraduationCap,
  BookOpen,
  Rocket,
  Trophy,
  Star,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/context/AuthContext';

interface ModernAuthFormProps {
  mode: 'login' | 'register';
  onModeChange?: (mode: 'login' | 'register') => void;
}

export const ModernAuthForm: React.FC<ModernAuthFormProps> = ({
  mode: initialMode,
  onModeChange
}) => {
  const router = useRouter();
  const { login, register, isLoading: authLoading } = useAuthContext();
  
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleModeChange = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setSelectedRole(null);
    onModeChange?.(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (mode === 'login') {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          setSuccess('Welcome back! Redirecting...');
          router.refresh();
          setTimeout(() => router.push('/'), 500);
        } else {
          setError(result.error || 'Invalid credentials');
        }
      } else {
        if (!formData.firstName || !formData.lastName || !selectedRole) {
          setError('Please fill in all fields and select a role');
          return;
        }
        
        const result = await register(
          formData.email, 
          formData.password, 
          formData.firstName, 
          formData.lastName, 
          selectedRole
        );
        
        if (result.success) {
          setSuccess('Account created! Redirecting...');
          router.refresh();
          setTimeout(() => router.push('/'), 500);
        } else {
          setError(result.error || 'Registration failed');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-lg"
          >
            {/* Logo/Brand */}
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-8"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Rocket className="w-10 h-10" />
            </motion.div>

            <h1 className="text-5xl font-bold mb-4">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200">Questify</span>
            </h1>
            <p className="text-xl text-blue-100 mb-12">
              {mode === 'login' 
                ? 'Continue your learning journey with interactive courses and achievements'
                : 'Start your adventure in education with gamified learning experiences'
              }
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 gap-4 text-left">
              {[
                { icon: Trophy, text: 'Earn achievements and rewards' },
                { icon: Star, text: 'Track your progress' },
                { icon: BookOpen, text: 'Interactive course content' },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <span className="text-white/90">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Form Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                {mode === 'login' 
                  ? 'Sign in to continue your learning journey'
                  : 'Join thousands of learners worldwide'
                }
              </p>
            </div>

            {/* Error/Success Messages */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm"
                >
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200 text-sm flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Role Selection for Registration */}
            {mode === 'register' && !selectedRole && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6"
              >
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  I am a...
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedRole('student')}
                    className="p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-400 transition-colors group"
                  >
                    <GraduationCap className="w-8 h-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                    <div className="font-semibold text-slate-900 dark:text-white">Student</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Learn and grow</div>
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedRole('teacher')}
                    className="p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors group"
                  >
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                    <div className="font-semibold text-slate-900 dark:text-white">Teacher</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Create courses</div>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Form */}
            {(mode === 'login' || (mode === 'register' && selectedRole)) && (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Fields for Registration */}
                {mode === 'register' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        First Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          placeholder="John"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Last Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          placeholder="Doe"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full pl-10 pr-12 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                {mode === 'login' && (
                  <div className="text-right">
                    <button
                      type="button"
                      className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading || authLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading || authLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Processing...
                    </span>
                  ) : (
                    mode === 'login' ? 'Sign In' : 'Create Account'
                  )}
                </motion.button>
              </form>
            )}

            {/* Toggle Mode */}
            <div className="mt-6 text-center">
              <p className="text-slate-600 dark:text-slate-400">
                {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                {' '}
                <button
                  type="button"
                  onClick={() => handleModeChange(mode === 'login' ? 'register' : 'login')}
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold"
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>

            {/* Back button for role selection */}
            {mode === 'register' && selectedRole && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setSelectedRole(null)}
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center gap-1 mx-auto"
                >
                  ← Change role
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </div>
    </div>
  );
};
