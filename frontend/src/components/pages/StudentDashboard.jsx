'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'recharts';
import { 
  Bell, 
  User, 
  ChevronRight, 
  Calendar, 
  Clock, 
  FileText, 
  BarChart, 
  PlayCircle,
  Award
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserDropdown } from '@/components/dashboard/UserDropdown.jsx';
import { isAuthenticated } from '@/utils/auth.js';

export default function StudentDashboard() {
  const [user, setUser] = useState({
    isLoggedIn: false,
    role: 'student',
    email: '',
    name: '',
    profilePic: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await isAuthenticated();
      console.log("User Data:", userData);
      setUser(userData);
    };

    fetchUser();
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

  // Past tests data
  const pastTests = [
    { id: 3, name: 'DAA Test 3', description: 'Lorem ipsum dolor sit amet, consectetur...', score: 100 },
    { id: 2, name: 'DAA Test 2', description: 'Lorem ipsum dolor sit amet, consectetur...', score: 90 },
    { id: 1, name: 'DAA Test 1', description: 'Lorem ipsum dolor sit amet, consectetur...', score: 80 }
  ];

  // Upcoming tests data
  const upcomingTests = [
    { 
      id: 4, 
      name: 'DAA Test 4', 
      description: 'Lorem ipsum dolor sit...', 
      duration: '10 min',
      status: 'ready'
    },
    { 
      id: 5, 
      name: 'DAA Test 5', 
      description: 'Lorem ipsum dolor sit...', 
      duration: '15 min',
      status: 'scheduled'
    }
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
        <div className="grid md:grid-cols-2 gap-6">
            {upcomingTests.map((test) => (
            <motion.div 
                key={test.id}
                variants={itemVariants}
                whileHover={{ 
                y: -5, 
                boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
                transition: { type: "spring", stiffness: 300, damping: 15 }
                }}
                className="bg-[#e2c3ae] rounded-xl p-6 shadow-md"
            >
                <h4 className="font-semibold text-lg text-gray-800">{test.name}</h4>
                <p className="text-gray-600 mt-1">{test.description}</p>
                <div className="flex justify-between items-center mt-6">
                <div className="flex items-center">
                    <Clock size={18} className="text-gray-600 mr-2" />
                    <span className="text-gray-700">{test.duration}</span>
                </div>
                {test.status === 'ready' ? (
                    <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-gray-800 px-6 py-2 rounded-full font-medium shadow-sm hover:shadow-md transition-all duration-300"
                    >
                    Start
                    </motion.button>
                ) : (
                    <span className="bg-gray-200 text-gray-500 px-6 py-2 rounded-full font-medium">
                    Scheduled
                    </span>
                )}
                </div>
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
            {pastTests.map((test, index) => (
                <motion.div 
                key={test.id}
                variants={itemVariants}
                className={`${index !== pastTests.length - 1 ? "border-b border-gray-300 pb-4" : ""}`}
                >
                <div className="flex justify-between items-start">
                    <div>
                    <h4 className="font-semibold text-gray-800">{test.name}</h4>
                    <p className="text-gray-600 mt-1">{test.description}</p>
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
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Sed eget augue malesuada, hendrerit augue et, varius erat. 
                Praesent molestie massa imperdiet, pharetra ante vel, 
                convallis augue...
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