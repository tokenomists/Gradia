"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { 
  User, 
  School, 
  Loader2, 
  Mail, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Home,
  EyeOff,
  Eye,
} from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import instance from '@/utils/axios';

export default function Login() {
  const [activeTab, setActiveTab] = useState('student');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [inputFocus, setInputFocus] = useState({
    email: false,
    password: false
  });

  const controls = useAnimationControls();
  const logoControls = useAnimationControls();
  const router = useRouter();

  useEffect(() => {
    // Initial entrance animation
    const sequence = async () => {
      await controls.start({
        y: [50, 0],
        opacity: [0, 1],
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
      });
      
      await logoControls.start({
        scale: [0.8, 1.1, 1],
        opacity: [0, 1],
        transition: { duration: 0.6, times: [0, 0.7, 1] }
      });
      
      setInitialLoad(false);
    };
    
    sequence();
  }, [controls, logoControls]);

  // Animation variants
  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const fadeInUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }
    }
  };

  const tabSwitchVariants = {
    hidden: (direction) => ({
      x: direction === 'right' ? 20 : -20,
      opacity: 0
    }),
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
    },
    exit: (direction) => ({
      x: direction === 'right' ? -20 : 20,
      opacity: 0,
      transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
    })
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(''); // Clear error when user types
  };

  const handleTabChange = (tab) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      setError('');
    }
  };

  const handleInputFocus = (name, isFocused) => {
    setInputFocus({ ...inputFocus, [name]: isFocused });
  };

  const shakeAnimation = async () => {
    await controls.start({
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.4, ease: "easeInOut" }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const email = formData.email;
    const password = formData.password;
    if (!email || !password) {
      setError('Please fill in all fields');
      shakeAnimation();
      return;
    }
  
    setIsLoading(true);
  
    try {
      const response = await instance.post(`/api/auth/${activeTab}/login`, {
        email: formData.email,
        password: formData.password
      });
  
      console.log("Login Response:", response.data); // 🛠 Debugging
  
      if (response.data.success && response.data.token) {  
        setTimeout(() => {
          router.push(`/${activeTab}/dashboard`);
        }, 100); 
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error.response?.data?.message || 
        error.response?.data?.error ||
        error.message || 
        'An error occurred during login'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate direction for animations
  const determineDirection = (newTab) => {
    return newTab === 'teacher' ? 'right' : 'left';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#edead7] p-4 font-sans relative overflow-hidden">
      <Head>
        <title>{activeTab === 'student' ? 'Student Login' : 'Teacher Login'}</title>
      </Head>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#e2c3ae]/30 via-[#fcf9ea] to-[#d56c4e]/20" />
        
        <motion.div 
          className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[#d56c4e]/5"
          animate={{
            x: ['-10%', '5%'],
            y: ['5%', '-8%'],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        
        <motion.div 
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#e2c3ae]/10"
          animate={{
            x: ['5%', '-8%'],
            y: ['8%', '15%'],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </div>
      
      {/* Main card container */}
      <motion.div 
        className="relative w-full max-w-md z-10 bg-white rounded-2xl shadow-xl overflow-hidden"
        style={{ 
          backgroundImage: 'radial-gradient(circle at 90% 10%, rgba(213, 108, 78, 0.05) 0%, transparent 70%)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1), 0 1px 10px rgba(213, 108, 78, 0.2)'
        }}
        initial={{ opacity: 0, y: 50 }}
        animate={controls}
      >
      
        {/* Logo */}
        <motion.div 
            className="mb-6 mt-4 relative z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={logoControls}
        >
            <div className="flex items-center justify-center gap-2">
              <motion.div 
                className="bg-[#d56c4e] p-3 rounded-lg shadow-lg"
                whileHover={{ 
                  scale: 1.05,
                  rotate: [0, -5, 5, 0],
                  transition: { duration: 0.5 }
                }}
              >
                <Home className="text-white" size={24} />
              </motion.div>
              <h2 className="text-2xl font-bold text-[#d56c4e]">
                {activeTab === 'student' ? 'Student Portal' : 'Teacher Portal'}
              </h2>
            </div>
        </motion.div>

        {/* Success animation overlay */}
        <AnimatePresence>
          {success && (
            <motion.div 
              className="absolute inset-0 z-50 bg-white flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ 
                  scale: [0, 1.2, 1],
                  transition: { duration: 0.5, times: [0, 0.7, 1] }
                }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    transition: {
                      duration: 1,
                      repeat: Infinity,
                      repeatType: "mirror"
                    }
                  }}
                >
                  <CheckCircle2 size={80} className="text-[#d56c4e]" />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Tab switcher */}
        <div className="flex mb-6 rounded-lg shadow-lg w-[90%] mx-auto overflow-hidden relative">
          <div 
            className="absolute bg-[#d56c4e] h-full transition-all duration-300 rounded-lg z-0"
            style={{ 
              width: '50%', 
              left: activeTab === 'student' ? '0%' : '50%',
              transition: 'left 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
            }}
          />
          <motion.button
            className={`flex-1 py-3 px-4 font-medium text-center transition-colors relative z-10 flex items-center justify-center ${
              activeTab === 'student' ? 'text-white' : 'text-gray-500'
            }`}
            onClick={() => handleTabChange('student')}
            whileHover={{
              scale: activeTab !== 'student' ? 1.05 : 1,
            }}
            whileTap={{ scale: 0.95 }}
          >
            <User size={18} className="mr-2" />
            Student
          </motion.button>
          <motion.button
            className={`flex-1 py-3 px-4 font-medium text-center transition-colors relative z-10 flex items-center justify-center ${
              activeTab === 'teacher' ? 'text-white' : 'text-gray-500'
            }`}
            onClick={() => handleTabChange('teacher')}
            whileHover={{
              scale: activeTab !== 'teacher' ? 1.05 : 1,
            }}
            whileTap={{ scale: 0.95 }}
          >
            <School size={18} className="mr-2" />
            Teacher
          </motion.button>
        </div>
        
        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 mx-6 mb-6 rounded-lg flex items-center gap-2"
              initial={{ opacity: 0, height: 0, marginBottom: 0, padding: 0 }}
              animate={{ 
                opacity: 1, 
                height: 'auto', 
                marginBottom: 24, 
                padding: '0.75rem 1rem',
                transition: {
                  type: "spring",
                  stiffness: 500,
                  damping: 30
                }
              }}
              exit={{ 
                opacity: 0, 
                height: 0, 
                marginBottom: 0, 
                padding: 0,
                transition: { duration: 0.2 }
              }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, -3, 3, -3, 3, 0],
                  transition: { duration: 0.5 }
                }}
              >
                <AlertCircle size={18} />
              </motion.div>
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Login form */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            custom={determineDirection(activeTab)}
            variants={tabSwitchVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.form
              variants={staggerChildren}
              initial="hidden"
              animate="visible"
              onSubmit={handleSubmit}
              className="px-6 space-y-6"
            >
              <motion.div variants={fadeInUp}>
                {activeTab === 'student' ? (
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <motion.div 
                      className={`border ${inputFocus.email ? 'border-[#d56c4e]' : 'border-amber-300'} rounded-full transition-all duration-300 p-3 ${
                        inputFocus.email ? 'shadow-md' : ''
                      }`}
                      animate={{
                        boxShadow: inputFocus.email ? '0 0 0 2px rgba(213, 108, 78, 0.2)' : '0 0 0 0px rgba(213, 108, 78, 0)'
                      }}
                    >
                      <div className="flex items-center">
                        <Mail size={20} className={`${inputFocus.email ? 'text-[#d56c4e]' : 'text-gray-400'} mr-2 transition-colors duration-300`} />
                        <input 
                          type="email"
                          name="email"
                          placeholder="Email"
                          value={formData.email}
                          onChange={handleInputChange}
                          onFocus={() => handleInputFocus('email', true)}
                          onBlur={() => handleInputFocus('email', false)}
                          className="w-full outline-none bg-transparent"
                        />
                        <AnimatePresence>
                          {formData.email && formData.email.includes('@') && (
                            <motion.div 
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 15 }}
                              className="text-teal-500"
                            >
                              <CheckCircle2 size={20} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <motion.div 
                      className={`border ${inputFocus.email ? 'border-[#d56c4e]' : 'border-amber-300'} rounded-full transition-all duration-300 p-3 ${
                        inputFocus.email ? 'shadow-md' : ''
                      }`}
                      animate={{
                        boxShadow: inputFocus.email ? '0 0 0 2px rgba(213, 108, 78, 0.2)' : '0 0 0 0px rgba(213, 108, 78, 0)'
                      }}
                    >
                      <div className="flex items-center">
                        <User size={20} className={`${inputFocus.email ? 'text-[#d56c4e]' : 'text-gray-400'} mr-2 transition-colors duration-300`} />
                        <input 
                          type="text"
                          name="email"
                          placeholder="Email"
                          value={formData.email}
                          onChange={handleInputChange}
                          onFocus={() => handleInputFocus('email', true)}
                          onBlur={() => handleInputFocus('email', false)}
                          className="w-full outline-none bg-transparent"
                        />
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
              
              <motion.div variants={fadeInUp} className="relative">
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <motion.div 
                    className={`border ${inputFocus.password ? 'border-[#d56c4e]' : 'border-amber-300'} rounded-full transition-all duration-300 p-3 ${
                      inputFocus.password ? 'shadow-md' : ''
                    }`}
                    animate={{
                      boxShadow: inputFocus.password ? '0 0 0 2px rgba(213, 108, 78, 0.2)' : '0 0 0 0px rgba(213, 108, 78, 0)'
                    }}
                  >
                    <div className="flex items-center">
                      <Lock size={20} className={`${inputFocus.password ? 'text-[#d56c4e]' : 'text-gray-400'} mr-2 transition-colors duration-300`} />
                      <input 
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        onFocus={() => handleInputFocus('password', true)}
                        onBlur={() => handleInputFocus('password', false)}
                        className="w-full outline-none bg-transparent"
                      />
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`${inputFocus.password ? 'text-[#d56c4e]' : 'text-gray-400'} hover:text-gray-600 transition-colors`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="space-y-4">
                {/* Sign in button with pulse effect */}
                <motion.button
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: '0 4px 12px rgba(213, 108, 78, 0.25)',
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="relative w-full bg-[#d56c4e] text-white py-3 rounded-full font-medium flex items-center justify-center gap-2 shadow-md overflow-hidden"
                  type="submit"
                  disabled={isLoading}
                >
                  {/* Improved pulse animation */}
                  <span className="absolute inset-0 rounded-full">
                    <span className="absolute inset-0 rounded-full animate-ping bg-[#d56c4e]/30 opacity-75"></span>
                  </span>
                  
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 relative z-10"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Loader2 size={20} />
                        </motion.div>
                        <span className="text-white font-medium">Processing...</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="login"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 w-full justify-center relative z-10"
                      >
                        <span className="text-white font-medium">Sign in</span>
                        <motion.div
                          animate={{ 
                            x: [0, 5, 0],
                            transition: { duration: 1.5, repeat: Infinity, repeatType: "loop" }
                          }}
                        >
                          <ArrowRight size={18} className="text-white" />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="pt-4 border-t border-gray-200 space-y-4 pb-6">
                <div className="text-center">
                  <Link 
                    href="#" 
                    className="text-[#d56c4e] hover:text-[#d56c4e]/70 text-sm font-medium transition-colors relative inline-block group"
                  >
                    Forgot Password?
                    <motion.span 
                      className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#d56c4e] transform origin-left"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </div>
                
                <div className="text-center">
                  <span className="text-gray-600 text-sm">Don't have an account? </span>
                  <button
                    onClick={() => router.push('/signup')}
                    className="text-[#d56c4e] hover:text-[#d56c4e]/70 text-sm font-medium transition-colors relative inline-block group"
                  >
                    Sign Up
                    <motion.span 
                      className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#d56c4e] transform origin-left"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </button>
                </div>
                
                {/* Google button */}
                <GoogleLoginButton userType={activeTab} />

                {/* Back to Home button */}
                <motion.div
                  type='button'
                  className="w-full bg-[#fff5e6] hover:bg-[#fff0d9] py-3 rounded-full font-medium flex items-center justify-center gap-2 text-[#f5a061] transition-colors border border-amber-100 group"
                  onClick={() => {router.push('/')}}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: '0 2px 10px rgba(245, 160, 97, 0.2)'
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                    <motion.div
                      animate={{ x: [0, -3, 0] }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity, 
                        repeatType: "loop"
                      }}
                      className="group-hover:text-amber-500 transition-colors"
                    >
                      <Home size={16} />
                    </motion.div>
                    <span className="group-hover:text-amber-500 transition-colors">Back to Home</span>
                </motion.div>
              </motion.div>
            </motion.form>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}