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
  EyeOff,
  Eye,
} from 'lucide-react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import instance from '@/utils/axios';
import { useError } from '@/contexts/ErrorContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { isAuthenticated } from '@/utils/auth';

export default function Signup() {
  const { darkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState('student');
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [inputFocus, setInputFocus] = useState({
    fname: '',
    lname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [passwordMatch, setPasswordMatch] = useState(null);

  const controls = useAnimationControls();
  const logoControls = useAnimationControls();
  const router = useRouter();
  const { showError } = useError();

  useEffect(() => {
    const protect = async () => {
      const { isLoggedIn } = await isAuthenticated();

      if(isLoggedIn) {
        localStorage.setItem("notification", JSON.stringify({ type: "warning", message: "Logout to login into a different account" }));
        window.location.href = '/';
      }
    };

    protect();
  });

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

  // Check if passwords match when either password or confirmPassword changes
  useEffect(() => {
    if (formData.password && formData.confirmPassword) {
      setPasswordMatch(formData.password === formData.confirmPassword);
    } else {
      setPasswordMatch(null);
    }
  }, [formData.password, formData.confirmPassword]);

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
    
    const { fname, lname, email, password, confirmPassword } = formData;
    
    // Validation
    if (!fname || !lname || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      shakeAnimation();
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      shakeAnimation();
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      shakeAnimation();
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await instance.post(`/api/auth/${activeTab}/register`, {
        fname: formData.fname,
        lname: formData.lname,
        email: formData.email,
        password: formData.password
      });

      const data = response.data;

      if (response.status === 201) {
        setSuccess(true);
        
        // Redirect to login after successful signup
        setTimeout(() => {
          router.push('/signin');
        }, 1500);
      } else if (data.error === 'ROLE_CONFLICT') {
        // showError(data.message);
        localStorage.setItem("notification", JSON.stringify({ type: "warning", message: data.message }));
        router.push('/');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error("Signup error:", error);
      
      // Check if the error is a role conflict
      if (error.response?.data?.error === 'ROLE_CONFLICT') {
        // showError(error.response.data.message);
        localStorage.setItem("notification", JSON.stringify({ type: "warning", message: error.response.data.message }));
        router.push('/');
      } else {
        setError(
          error.response?.data?.message || 
          error.response?.data?.error ||
          error.message || 
          'An error occurred during signup'
        );
      }
    } finally {
      setIsLoading(false);
    }
};

  // Calculate direction for animations
  const determineDirection = (newTab) => {
    return newTab === 'teacher' ? 'right' : 'left';
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${
        darkMode ? 'bg-[#2d2c2a]' : 'bg-[#edead7]'
      } p-4 font-sans relative overflow-hidden`}
    >
      <Head>
        <title>{activeTab === 'student' ? 'Student Signup' : 'Teacher Signup'}</title>
      </Head>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-full ${
          darkMode 
            ? 'bg-gradient-to-br from-[#3a3936]/30 via-[#2d2c2a] to-[#1d1c1a]' 
            : 'bg-gradient-to-br from-[#e2c3ae]/30 via-[#fcf9ea] to-[#d56c4e]/20'
        }`} />
        
        <motion.div 
          className={`absolute top-0 left-0 w-96 h-96 rounded-full ${
            darkMode ? 'bg-[#3a3936]/20' : 'bg-[#d56c4e]/5'
          }`}
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
          className={`absolute bottom-0 right-0 w-80 h-80 rounded-full ${
            darkMode ? 'bg-[#1d1c1a]/30' : 'bg-[#e2c3ae]/10'
          }`}
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
        className={`relative w-full max-w-md z-10 ${
          darkMode ? 'bg-[#3a3936]' : 'bg-white'
        } rounded-2xl overflow-hidden`}
        style={{
          backgroundImage: darkMode 
            ? 'radial-gradient(circle at 90% 10%, rgba(29, 28, 26, 0.3) 0%, transparent 70%)'
            : 'radial-gradient(circle at 90% 10%, rgba(213, 108, 78, 0.05) 0%, transparent 70%)'
        }}
        initial={{ opacity: 0, y: 50 }}
        animate={controls}
      >
      
        {/* Logo */}
        <motion.div 
          className="absolute z-10 top-8 w-full flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h2 
            className={`text-5xl font-bold ${
              darkMode ? 'text-[#edead7]' : 'text-black'
            } text-center`}
            style={{ fontFamily: 'Rage Italic, calibri' }}
          >
            Gradia
          </h2>
        </motion.div>

        {/* Success animation overlay */}
        <AnimatePresence>
          {success && (
            <motion.div 
              className={`absolute inset-0 z-50 ${
                darkMode ? 'bg-[#2d2c2a]' : 'bg-white'
              } flex items-center justify-center`}
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
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
                className="text-[#d56c4e] font-medium text-lg"
              >
                Account created successfully!
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex flex-col items-center w-full pt-28">
          {/* Tab switcher */}
          <div className={`flex rounded-lg shadow-md w-[90%] mx-auto overflow-hidden relative mb-6 ${
            darkMode ? 'bg-[#1d1c1a]' : 'bg-white'
          }`}>
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
        </div>
        
        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              className={`${
                darkMode 
                  ? 'bg-red-900/20 border-red-800/30 text-red-400' 
                  : 'bg-red-100 border-red-100 text-red-600'
              } px-4 py-3 mx-6 mb-6 rounded-lg flex items-center gap-2`}
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
        
        {/* Signup form */}
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
              className="px-6 space-y-4"
            >
              {/* First Name & Last Name */}
              <div className="flex gap-4">
                <motion.div variants={fadeInUp} className="flex-1">
                  <motion.div className="relative">
                    <motion.div 
                      className={`border ${
                        inputFocus.fname 
                          ? 'border-[#d56c4e]' 
                          : darkMode ? 'border-[#3a3936]' : 'border-amber-300'
                      } rounded-lg transition-all duration-300 p-3 ${
                        inputFocus.fname ? 'shadow-md' : ''
                      } ${
                        darkMode ? 'bg-[#2d2c2a]' : 'bg-white'
                      }`}
                      animate={{
                        boxShadow: inputFocus.fname ? '0 0 0 2px rgba(213, 108, 78, 0.2)' : '0 0 0 0px rgba(213, 108, 78, 0)'
                      }}
                    >
                      <div className="flex items-center">
                        <User size={20} className={`${inputFocus.fname ? 'text-[#d56c4e]' : 'text-gray-400'} mr-2 transition-colors duration-300`} />
                        <input 
                          type="text"
                          name="fname"
                          placeholder="First Name"
                          value={formData.fname}
                          onChange={handleInputChange}
                          onFocus={() => handleInputFocus('fname', true)}
                          onBlur={() => handleInputFocus('fname', false)}
                          className={`w-full outline-none bg-transparent ${
                            darkMode ? 'text-[#edead7]' : 'text-gray-900'
                          }`}
                        />
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>

                <motion.div variants={fadeInUp} className="flex-1">
                  <motion.div className="relative">
                    <motion.div 
                      className={`border ${
                        inputFocus.lname 
                          ? 'border-[#d56c4e]' 
                          : darkMode ? 'border-[#3a3936]' : 'border-amber-300'
                      } rounded-lg transition-all duration-300 p-3 ${
                        inputFocus.lname ? 'shadow-md' : ''
                      } ${
                        darkMode ? 'bg-[#2d2c2a]' : 'bg-white'
                      }`}
                      animate={{
                        boxShadow: inputFocus.lname ? '0 0 0 2px rgba(213, 108, 78, 0.2)' : '0 0 0 0px rgba(213, 108, 78, 0)'
                      }}
                    >
                      <div className="flex items-center">
                        <User size={20} className={`${inputFocus.lname ? 'text-[#d56c4e]' : 'text-gray-400'} mr-2 transition-colors duration-300`} />
                        <input 
                          type="text"
                          name="lname"
                          placeholder="Last Name"
                          value={formData.lname}
                          onChange={handleInputChange}
                          onFocus={() => handleInputFocus('lname', true)}
                          onBlur={() => handleInputFocus('lname', false)}
                          className={`w-full outline-none bg-transparent ${
                            darkMode ? 'text-[#edead7]' : 'text-gray-900'
                          }`}
                        />
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>
              
              {/* Email */}
              <motion.div variants={fadeInUp}>
                <motion.div className="relative">
                  <motion.div 
                    className={`border ${
                      inputFocus.email 
                        ? 'border-[#d56c4e]' 
                        : darkMode ? 'border-[#3a3936]' : 'border-amber-300'
                    } rounded-lg transition-all duration-300 p-3 ${
                      inputFocus.email ? 'shadow-md' : ''
                    } ${
                      darkMode ? 'bg-[#2d2c2a]' : 'bg-white'
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
                        className={`w-full outline-none bg-transparent ${
                          darkMode ? 'text-[#edead7]' : 'text-gray-900'
                        }`}
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
              </motion.div>
              
              {/* Password */}
              <motion.div variants={fadeInUp} className="relative">
                <motion.div className="relative">
                  <motion.div 
                    className={`border ${
                      inputFocus.password 
                        ? 'border-[#d56c4e]' 
                        : darkMode ? 'border-[#3a3936]' : 'border-amber-300'
                    } rounded-lg transition-all duration-300 p-3 ${
                      inputFocus.password ? 'shadow-md' : ''
                    } ${
                      darkMode ? 'bg-[#2d2c2a]' : 'bg-white'
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
                        className={`w-full outline-none bg-transparent ${
                          darkMode ? 'text-[#edead7]' : 'text-gray-900'
                        }`}
                      />
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`${inputFocus.password ? 'text-[#d56c4e]' : 'text-gray-400'} hover:text-gray-600 transition-colors`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        tabIndex="-1"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
              
              {/* Confirm Password */}
              <motion.div variants={fadeInUp} className="relative">
                <motion.div className="relative">
                  <motion.div 
                    className={`border ${
                      inputFocus.confirmPassword 
                        ? 'border-[#d56c4e]' 
                        : passwordMatch === false 
                          ? darkMode ? 'border-red-400/50' : 'border-red-400'
                          : passwordMatch === true 
                            ? darkMode ? 'border-teal-400/50' : 'border-teal-400'
                            : darkMode ? 'border-[#3a3936]' : 'border-amber-300'
                    } rounded-lg transition-all duration-300 p-3 ${
                      inputFocus.confirmPassword ? 'shadow-md' : ''
                    } ${
                      darkMode ? 'bg-[#2d2c2a]' : 'bg-white'
                    }`}
                    animate={{
                      boxShadow: inputFocus.confirmPassword 
                        ? '0 0 0 2px rgba(213, 108, 78, 0.2)' 
                        : passwordMatch === false 
                          ? '0 0 0 2px rgba(248, 113, 113, 0.2)' 
                          : passwordMatch === true 
                            ? '0 0 0 2px rgba(45, 212, 191, 0.2)' 
                            : '0 0 0 0px rgba(213, 108, 78, 0)'
                    }}
                  >
                    <div className="flex items-center">
                      <Lock size={20} className={`
                        ${inputFocus.confirmPassword 
                          ? 'text-[#d56c4e]' 
                          : passwordMatch === false 
                            ? 'text-red-400' 
                            : passwordMatch === true 
                              ? 'text-teal-400' 
                              : 'text-gray-400'
                        } mr-2 transition-colors duration-300`} 
                      />
                      <input 
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        onFocus={() => handleInputFocus('confirmPassword', true)}
                        onBlur={() => handleInputFocus('confirmPassword', false)}
                        className={`w-full outline-none bg-transparent ${
                          darkMode ? 'text-[#edead7]' : 'text-gray-900'
                        }`}
                      />
                      <div className="flex items-center">
                        <AnimatePresence>
                          {formData.confirmPassword && (
                            <motion.div 
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 15 }}
                              className={passwordMatch ? "text-teal-500" : "text-red-500"}
                            >
                              {passwordMatch ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <motion.button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className={`ml-2 ${inputFocus.confirmPassword ? 'text-[#d56c4e]' : 'text-gray-400'} hover:text-gray-600 transition-colors`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                          tabIndex="-1"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="space-y-4">
                {/* Sign up button with pulse effect */}
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
                        key="signup"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 w-full justify-center relative z-10"
                      >
                        <span className="text-white font-medium">Create Account</span>
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
                  <span className={`text-sm ${darkMode ? 'text-[#edead7]/70' : 'text-gray-600'}`}>Already have an account?{' '}</span>
                  <button
                    type="button"
                    onClick={() => router.push('/signin')}
                    className="text-[#d56c4e] hover:text-[#d56c4e]/70 text-sm font-medium transition-colors relative inline-block group"
                  >
                    Sign In
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

                </motion.div>
              </motion.form>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }