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
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useAuthContext } from '@/context/AuthContext';

interface AuthFormProps {
  mode: 'login' | 'register';
  onModeChange: (mode: 'login' | 'register') => void;
  onRoleSelect?: (role: 'student' | 'teacher') => void;
  onSubmit?: (data: AuthFormData) => void;
  className?: string;
}

interface AuthFormData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: 'student' | 'teacher';
}

export const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  onModeChange,
  onRoleSelect,
  onSubmit,
  className
}) => {
  const router = useRouter();
  const { login, register, isLoading: authLoading } = useAuthContext();
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: undefined
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleRoleSelect = (role: 'student' | 'teacher') => {
    setSelectedRole(role);
    setFormData(prev => ({ ...prev, role }));
    setStep('form');
    onRoleSelect?.(role);
  };

  const handleBackToRole = () => {
    setStep('role');
    setSelectedRole(null);
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
          setSuccess('Login successful! Redirecting...');
          // Force a full page reload to ensure cookies are properly set
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        } else {
          setError(result.error || 'Login failed');
        }
      } else {
        if (!formData.firstName || !formData.lastName) {
          setError('First name and last name are required');
          return;
        }
        
        const result = await register(
          formData.email, 
          formData.password, 
          formData.firstName, 
          formData.lastName, 
          formData.role || 'student'
        );
        if (result.success) {
          setSuccess('Registration successful! Redirecting...');
          // Force a full page reload to ensure cookies are properly set
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
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

  const roleCards = [
    {
      role: 'student' as const,
      title: 'Student',
      description: 'Start your learning journey',
      icon: GraduationCap,
      gradient: 'from-blue-500 to-cyan-500',
      glow: 'shadow-blue-500/25',
      particles: 'from-blue-400/20'
    },
    {
      role: 'teacher' as const,
      title: 'Teacher',
      description: 'Share knowledge & create courses',
      icon: BookOpen,
      gradient: 'from-purple-500 to-pink-500',
      glow: 'shadow-purple-500/25',
      particles: 'from-purple-400/20'
    }
  ];

  return (
    <div className={cn("relative w-full max-w-md mx-auto", className)}>
      {/* Background glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Main form container */}
      <motion.div
        className="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                "absolute w-1 h-1 rounded-full",
                selectedRole === 'student' ? "bg-gradient-to-r from-blue-400/40 to-cyan-400/40" :
                selectedRole === 'teacher' ? "bg-gradient-to-r from-purple-400/40 to-pink-400/40" :
                "bg-gradient-to-r from-slate-400/40 to-slate-300/40"
              )}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Header */}
        <div className="relative text-center mb-8">
          <motion.div
            className="inline-flex items-center gap-2 mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 25 }}
          >
            <Sparkles className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Questify
            </h1>
            <Sparkles className="w-6 h-6 text-pink-400" />
          </motion.div>
          
          <motion.p
            className="text-slate-400 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {mode === 'login' ? 'Welcome back to your learning journey' : 'Start your learning adventure'}
          </motion.p>
        </div>

        {/* Role Selection Step */}
        <AnimatePresence mode="wait">
          {step === 'role' && mode === 'register' && (
            <motion.div
              key="role-selection"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-white mb-6 text-center">
                Choose your role
              </h2>
              
              <div className="space-y-4">
                {roleCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <motion.button
                      key={card.role}
                      className={cn(
                        "w-full p-6 rounded-xl border border-slate-600/50 transition-all duration-300",
                        "hover:border-slate-500 group relative overflow-hidden",
                        "bg-gradient-to-br from-slate-800/50 to-slate-900/50"
                      )}
                      onClick={() => handleRoleSelect(card.role)}
                      whileHover={{ 
                        scale: 1.02,
                        boxShadow: `0 10px 25px ${card.glow.includes('blue') ? 'rgba(59, 130, 246, 0.15)' : 'rgba(147, 51, 234, 0.15)'}`
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Background gradient on hover */}
                      <motion.div
                        className={cn("absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10", card.gradient)}
                        transition={{ duration: 0.3 }}
                      />
                      
                      <div className="relative flex items-center gap-4">
                        <div className={cn(
                          "p-3 rounded-full bg-gradient-to-r",
                          card.gradient,
                          "shadow-lg",
                          card.glow
                        )}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="text-left flex-1">
                          <h3 className="font-semibold text-white group-hover:text-slate-100">
                            {card.title}
                          </h3>
                          <p className="text-sm text-slate-400 group-hover:text-slate-300">
                            {card.description}
                          </p>
                        </div>
                        
                        <motion.div
                          className="opacity-0 group-hover:opacity-100"
                          transition={{ duration: 0.2 }}
                        >
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </motion.div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Switch to login */}
              <div className="mt-8 text-center">
                <p className="text-slate-400 text-sm">
                  Already have an account?{' '}
                  <button
                    onClick={() => onModeChange('login')}
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </motion.div>
          )}

          {/* Form Step */}
          {(step === 'form' || mode === 'login') && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: mode === 'login' ? 0 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Back button for register flow */}
              {mode === 'register' && (
                <motion.button
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
                  onClick={handleBackToRole}
                  whileHover={{ x: -2 }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm">Back to role selection</span>
                </motion.button>
              )}

              {/* Selected role indicator for register */}
              {mode === 'register' && selectedRole && (
                <motion.div
                  className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-slate-700/50 border border-slate-600/50"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {selectedRole === 'student' ? (
                    <GraduationCap className="w-5 h-5 text-blue-400" />
                  ) : (
                    <BookOpen className="w-5 h-5 text-purple-400" />
                  )}
                  <span className="text-white font-medium">
                    {selectedRole === 'student' ? 'Student Account' : 'Teacher Account'}
                  </span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name fields for register */}
                {mode === 'register' && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        First Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          placeholder="Enter your first name"
                          required
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Last Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          placeholder="Enter your last name"
                          required
                        />
                      </div>
                    </motion.div>
                  </>
                )}

                {/* Email field */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: mode === 'register' ? 0.2 : 0.1 }}
                >
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </motion.div>

                {/* Password field */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: mode === 'register' ? 0.25 : 0.2 }}
                >
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-10 pr-12 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </motion.div>

                {/* Error and Success Messages */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm"
                    >
                      {success}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: mode === 'register' ? 0.4 : 0.3 }}
                >
                  <Button
                    type="submit"
                    variant="glow"
                    className="w-full py-3"
                    isLoading={isLoading || authLoading}
                  >
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                  </Button>
                </motion.div>

                {/* Mode switch */}
                <motion.div
                  className="text-center pt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: mode === 'register' ? 0.5 : 0.4 }}
                >
                  <p className="text-slate-400 text-sm">
                    {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                    <button
                      type="button"
                      onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}
                      className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                      {mode === 'login' ? 'Sign up' : 'Sign in'}
                    </button>
                  </p>
                </motion.div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};