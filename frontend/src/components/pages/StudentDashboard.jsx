'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  User, 
  ChevronRight, 
  ChevronLeft,
  Calendar, 
  Clock, 
  FileText, 
  BarChart, 
  PlayCircle,
  Award,
  BookOpen
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserDropdown } from '@/components/dashboard/UserDropdown.jsx';
import { isAuthenticated } from '@/utils/auth.js';
import { getTestsForStudent } from '@/utils/test.js';

export default function StudentDashboard() {
  const [user, setUser] = useState({
    isLoggedIn: false,
    role: 'student',
    email: '',
    name: '',
    profilePic: '',
  });
  const [testData, setTestData] = useState({
    upcomingTests: [],
    previousTests: []
  });

  const testsContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await isAuthenticated();
      // console.log("User Data:", userData);
      setUser(userData);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchTests = async () => {
      const testData = await getTestsForStudent();
      // console.log(testData);
      setTestData(testData);
    };

    fetchTests();
  }, [user]);

  useEffect(() => {
    const checkScroll = () => {
      if (testsContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = testsContainerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    checkScroll();
    
    const container = testsContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10
      }
    }
  };

  // State for countdown timer
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 10, seconds: 0 });
  const router = useRouter();

  // Simulate countdown for Test 4
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        clearInterval(timer);
        return prev;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Scroll functions for upcoming tests
  const scrollLeft = () => {
    if (testsContainerRef.current) {
      testsContainerRef.current.scrollBy({ left: -250, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (testsContainerRef.current) {
      testsContainerRef.current.scrollBy({ left: 250, behavior: 'smooth' });
    }
  };

  // Mock data for charts
  const performanceData = [
    { name: 'Test 1', score: 40 },
    { name: 'Test 2', score: 42 },
    { name: 'Test 3', score: 45 },
    { name: 'Test 4', score: 68 },
    { name: 'Test 5', score: 75 },
    { name: 'Test 6', score: 70 },
    { name: 'Test 7', score: 65 },
    { name: 'Test 8', score: 75 }
  ];

  return (
    <div className="min-h-screen bg-[#fcf9ea]">
      {/* Navbar */}
      <nav className="bg-[#d56c4e] text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <motion.h1 
            initial={{ x: -20, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-serif italic font-bold"
          >
            Gradia
          </motion.h1>
        </div>
        <div className="flex space-x-6 items-center">
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="cursor-pointer font-medium"
          >
            Practice
          </motion.span>
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="cursor-pointer font-medium"
          >
            Performance
          </motion.span>
          <UserDropdown />
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="flex justify-between items-center mb-8">
          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-gray-800"
          >
            Welcome back, {user.name}
          </motion.h2>
          <motion.button
            onClick={() => {router.push('/student/join-class')}}
            whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px rgba(213, 108, 78, 0.6)" }}
            className="flex items-center bg-[#e2c3ae] hover:bg-[#d5b5a0] text-gray-800 px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-300"
          >
            <User size={18} className="mr-2" />
            Join Class
          </motion.button>
        </div>

        {/* Upcoming Tests Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mb-8"
        >
          <motion.h3 
            variants={itemVariants}
            className="text-xl font-semibold text-gray-800 mb-4"
          >
            Upcoming Tests & Evaluations
          </motion.h3>
          
          {/* Container with horizontal scroll */}
          <div className="relative bg-[#fcf4e0] rounded-xl p-4 shadow-sm">
            {/* Scroll Left Button */}
            {canScrollLeft && (
              <motion.button 
                onClick={scrollLeft}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1 shadow-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.1 }}
              >
                <ChevronLeft size={20} className="text-gray-800" />
              </motion.button>
            )}
            
            {/* Scroll Right Button */}
            {canScrollRight && (
              <motion.button 
                onClick={scrollRight}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1 shadow-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.1 }}
              >
                <ChevronRight size={20} className="text-gray-800" />
              </motion.button>
            )}
            
            {/* Scrollable container */}
            <div 
              ref={testsContainerRef} 
              className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {testData && testData.upcomingTests.map((test) => (
                <motion.div 
                  key={test._id}
                  variants={itemVariants}
                  whileHover={{ 
                    y: -5, 
                    boxShadow: "0px 10px 15px rgba(0, 0, 0, 0.1)",
                    transition: { type: "spring", stiffness: 300, damping: 15 }
                  }}
                  className="bg-[#e2c3ae] rounded-xl p-4 shadow-md min-w-[240px] w-[240px] flex-shrink-0"
                >
                  <h4 className="font-semibold text-base text-gray-800">{test.title}</h4>
                  <p className="text-gray-600 text-sm truncate">{test.description}</p>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center">
                      <Clock size={16} className="text-gray-600 mr-1" />
                      <span className="text-gray-700 text-sm">{test.duration}</span>
                    </div>
                    {test.status === 'ready' ? (
                      <motion.button
                        onClick={() => {router.push(`/student/test/${test._id}`)}} 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white text-gray-800 px-4 py-1 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        Start
                      </motion.button>
                    ) : (
                      <span className="bg-gray-200 text-gray-500 px-4 py-1 rounded-full text-sm font-medium">
                        Scheduled
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Enrolled Classes Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mb-8"
        >
          <motion.h3 
            variants={itemVariants}
            className="text-xl font-semibold text-gray-800 mb-4 flex items-center"
          >
            <BookOpen size={20} className="mr-2" />
            Your Classes
          </motion.h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            {user.classes != undefined && user.classes.map((classItem) => (
              <motion.div 
                key={classItem._id}
                variants={itemVariants}
                whileHover={{ 
                  y: -5, 
                  boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
                  transition: { type: "spring", stiffness: 300, damping: 15 }
                }}
                className="bg-white rounded-xl p-4 shadow-md border-l-4 border-[#d56c4e]"
              >
                <h4 className="font-semibold text-gray-800">{classItem.name}</h4>
                <p className="text-gray-600 text-sm">{classItem.teacher}</p>
                <div className="flex items-center mt-3 text-xs text-gray-500">
                  <Calendar size={14} className="mr-1" />
                  <span>Next: {classItem.nextClass || "NOT SCHEDULED"}</span>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.03 }}
                  className="mt-3 flex items-center text-[#d56c4e] font-medium text-sm"
                >
                  View class
                  <ChevronRight size={14} className="ml-1" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Past Tests Section */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="bg-[#edead7] rounded-xl p-6 shadow-md"
          >
            <motion.h3 
              variants={itemVariants}
              className="text-xl font-semibold text-gray-800 mb-4"
            >
              Past Tests & Evaluations
            </motion.h3>
            <div className="space-y-6">
              {testData.previousTests.map((test, index) => (
                <motion.div 
                  key={test._id}
                  variants={itemVariants}
                  className={`${index !== testData.previousTests.length - 1 ? "border-b border-gray-300 pb-4" : ""}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800">{test.title}</h4>
                      <p className="text-gray-600 mt-1 text-sm">{test.description}</p>
                    </div>
                    <div className="text-xl font-bold text-gray-800">
                      {test.score}%
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Performance Analysis Section */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="bg-[#edead7] rounded-xl p-6 shadow-md"
          >
            <motion.h3 
              variants={itemVariants}
              className="text-xl font-semibold text-gray-800 mb-4"
            >
              Performance Analysis
            </motion.h3>
            <div className="h-48 w-full">
              <div className="relative h-full">
                <div className="absolute left-0 h-full flex flex-col justify-between py-2">
                  {[100, 80, 60, 40, 20, 0].map((value) => (
                    <div key={value} className="text-gray-500 text-sm">{value}</div>
                  ))}
                </div>
                <div className="pl-8 h-full">
                  <svg width="100%" height="100%" viewBox="0 0 500 180">
                    <polyline
                      fill="none"
                      stroke="#d56c4e"
                      strokeWidth="3"
                      points={performanceData.map((p, i) => `${i * 70 + 10},${180 - p.score * 1.8}`).join(' ')}
                    />
                    {performanceData.map((p, i) => (
                      <circle
                        key={i}
                        cx={i * 70 + 10}
                        cy={180 - p.score * 1.8}
                        r="4"
                        fill="#d56c4e"
                      />
                    ))}
                  </svg>
                </div>
              </div>
            </div>
            <div className="text-center text-sm text-gray-500 mt-2">SCORE PERCENTAGES</div>
            <div className="mt-4 text-gray-600">
              <p className="text-sm">
                Your performance shows steady improvement over the past 8 tests. Starting with an average of 40%, you've progressed to consistently scoring above 70%. Continue with your current study routine for optimal results.
              </p>
              <motion.button 
                whileHover={{ scale: 1.03 }}
                className="mt-4 flex items-center text-[#d56c4e] font-medium"
              >
                View detailed insights
                <ChevronRight size={16} className="ml-1" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}