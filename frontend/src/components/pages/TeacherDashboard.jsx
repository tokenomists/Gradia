'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { PenLine, Plus, ChevronDown, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { UserDropdown } from '@/components/dashboard/UserDropdown.jsx';
import { isAuthenticated } from '@/utils/auth.js';
import { getTestsForTeacher } from '@/utils/test.js';
import { getClassesForTeacher } from '@/utils/class.js';

const performanceData = {
  'Operating System': [
    { testId: 1, score: 32, color: 'bg-red-500' },
    { testId: 2, score: 67, color: 'bg-orange-400' },
    { testId: 3, score: 43, color: 'bg-red-500' },
    { testId: 4, score: 84, color: 'bg-green-500' }
  ],
  'Design & Analysis of Algorithms': [
    { testId: 1, score: 74, color: 'bg-orange-400' },
    { testId: 2, score: 79, color: 'bg-orange-400' },
    { testId: 3, score: 45, color: 'bg-red-500' },
    { testId: 4, score: null, color: 'bg-gray-200' }
  ]
};

// Array of motivational quotes for teachers
const teacherQuotes = [
  "Education is not the filling of a pail, but the lighting of a fire.",
  "The best teachers teach from the heart, not from the book.",
  "A teacher affects eternity; they can never tell where their influence stops.",
  "Teachers plant seeds of knowledge that grow forever.",
  "The mediocre teacher tells. The good teacher explains. The superior teacher demonstrates. The great teacher inspires."
];

export default function TeacherDashboard() {
    const [currentQuote, setCurrentQuote] = useState('');
    const [expandedTest, setExpandedTest] = useState(null);
    const [user, setUser] = useState({
        isLoggedIn: false,
        role: 'teacher',
        email: '',
        name: '',
        profilePic: ''
    });
    const [testsData, setTestsData] = useState([]);
    const [classesData, setClassesData] = useState([]);
    const router = useRouter();    
  
    useEffect(() => {
      const fetchUser = async () => {
        const userData = await isAuthenticated();
        // console.log("User Data:", userData);
        setUser(userData);
      };

      const fetchTests = async () => {
        let tests = await getTestsForTeacher();
        // console.log("Tests Data:", tests.previousTests);
        if(tests) tests = tests.previousTests;
        else tests = [];
        setTestsData(tests);
      }
  
      const fetchClasses = async () => {
        const classes = await getClassesForTeacher();
        // console.log("Classes Data: ", classes);
        if(classes) setClassesData(classes);
      }

      fetchUser();
      fetchTests();
      fetchClasses();
    }, []);

  // Rotate quotes every 10 seconds
  useEffect(() => {
    const randomQuote = teacherQuotes[Math.floor(Math.random() * teacherQuotes.length)];
    setCurrentQuote(randomQuote);
    
    const interval = setInterval(() => {
      const randomQuote = teacherQuotes[Math.floor(Math.random() * teacherQuotes.length)];
      setCurrentQuote(randomQuote);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const classesContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Add this useEffect similar to the one for tests
  useEffect(() => {
    const checkScroll = () => {
      if (classesContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = classesContainerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    checkScroll();
    
    const container = classesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, []);

  // Add scroll functions
  const scrollLeft = () => {
    if (classesContainerRef.current) {
      classesContainerRef.current.scrollBy({ left: -250, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (classesContainerRef.current) {
      classesContainerRef.current.scrollBy({ left: 250, behavior: 'smooth' });
    }
  };

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
            <Link href="/teacher/dashboard">Gradia</Link>
        </motion.h1>
        </div>
        <div className="flex space-x-6 items-center">
        <motion.span 
            whileHover={{ scale: 1.05 }}
            className="cursor-pointer font-medium"
        >
            <Link href="/teacher/tests">Tests</Link>
        </motion.span>
        <motion.span 
            whileHover={{ scale: 1.05 }}
            className="cursor-pointer font-medium"
        >
            <Link href="/teacher/analysis">Analysis</Link>
        </motion.span>
        <UserDropdown />
        </div>
    </nav>
    
    {/* Main Content */}
    <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Top Section with Quote and Action Buttons */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 md:mb-0"
        >
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Good afternoon, {user.name}</h1>
            <p className="text-gray-600 italic">"{currentQuote}"</p>
        </motion.div>
        
        <div className="flex space-x-4">
            <motion.button
            onClick={() => {router.push('/teacher/create-test')}}
            whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#e2c3ae] hover:bg-[#d5b69d] text-gray-800 font-medium py-2 px-4 rounded-lg flex items-center gap-2"
            >
            <PenLine size={18} />
            Create Test
            </motion.button>
            
            <motion.button
            onClick={() => {router.push('/teacher/create-class')}}
            whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#e2c3ae] hover:bg-[#d5b69d] text-gray-800 font-medium py-2 px-4 rounded-lg flex items-center gap-2"
            >
            <Plus size={18} />
            Create Class
            </motion.button>
        </div>
        </div>
        
        {/* Classes Section */}
<motion.div 
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.1 }}
  className="bg-[#edead7] rounded-xl p-6 shadow-md mb-8"
>
  <h2 className="text-2xl font-bold text-gray-800 mb-4">Classes</h2>
  
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
      ref={classesContainerRef} 
      className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {classesData.map((classItem) => (
        <motion.div
          key={classItem._id}
          whileHover={{ 
            scale: 1.03, 
            backgroundColor: "#e9e5d0",
            boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.08)"
          }}
          className="bg-[#e2c3ae] rounded-lg p-4 cursor-pointer min-w-[240px] w-[240px] flex-shrink-0"
        >
          <h3 className="text-lg font-bold text-gray-800">{classItem.code}</h3>
          <p className="text-gray-700">{classItem.name}</p>
          <p className="text-gray-600 text-sm mt-2">{classItem.students} students</p>
        </motion.div>
      ))}
      
      <motion.div
        whileHover={{ 
          scale: 1.03,
          backgroundColor: "#e9e5d0",
          boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.08)"
        }}
        className="bg-[#e2c3ae] rounded-lg p-4 cursor-pointer border-2 border-dashed border-gray-400 flex items-center justify-center min-w-[240px] w-[240px] flex-shrink-0"
      >
        <div className="text-center">
          <Plus size={24} className="mx-auto text-gray-600" />
          <p className="text-gray-600 mt-2">Add New Class</p>
        </div>
      </motion.div>
    </div>
  </div>
</motion.div>
        
        {/* Past Tests & Evaluations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#edead7] rounded-xl p-6 shadow-md"
        >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Past Tests & Evaluations</h2>
            
            <div className="space-y-4">
            {testsData !== undefined && testsData !== null && testsData.map((test) => (
                <div key={test._id} className="border-b border-gray-300 pb-4">
                <div 
                    className="flex justify-between items-start cursor-pointer"
                    onClick={() => setExpandedTest(expandedTest === test._id ? null : test._id)}
                >
                    <div>
                    <h3 className="text-lg font-bold text-gray-800">{test.title}</h3>
                    <p className="text-gray-600 text-sm">{test.description}</p>
                    </div>
                    <motion.div
                    animate={{ rotate: expandedTest === test.id ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    >
                    <ChevronDown size={20} className="text-gray-600" />
                    </motion.div>
                </div>
                
                {expandedTest === test._id && (
                    <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-3 pl-2 border-l-2 border-[#d56c4e]"
                    >
                    <p className="text-gray-700">Date: {new Date(test.startTime).toLocaleDateString()}</p>
                    <div className="flex mt-2 space-x-2">
                        <button className="bg-[#d56c4e] text-white px-3 py-1 rounded-md text-sm">
                        View Results
                        </button>
                        <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm">
                        Edit
                        </button>
                    </div>
                    </motion.div>
                )}
                </div>
            ))}
            </div>
            
            <button className="mt-4 text-[#d56c4e] font-medium hover:underline flex items-center">
            View All Tests <ChevronDown size={16} className="ml-1" />
            </button>
        </motion.div>
        
        {/* Student Performance */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-[#edead7] rounded-xl p-6 shadow-md"
        >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Student Performance</h2>
            
            <div className="overflow-x-auto">
            <table className="w-full text-center">
                <thead>
                <tr>
                    <th className="p-2"></th>
                    <th className="p-2">Test 1</th>
                    <th className="p-2">Test 2</th>
                    <th className="p-2">Test 3</th>
                    <th className="p-2">Test 4</th>
                </tr>
                </thead>
                <tbody>
                {Object.entries(performanceData).map(([subject, tests], index) => (
                    <tr key={index}>
                    <td className="p-2 text-left font-medium">{subject}</td>
                    {[0, 1, 2, 3].map((testIndex) => {
                        const testData = tests[testIndex];
                        return (
                        <td key={testIndex} className="p-2">
                            {testData && testData.score !== null ? (
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                className={`${testData.color} text-white font-medium rounded-md p-2 mx-auto`}
                            >
                                {testData.score}%
                            </motion.div>
                            ) : (
                            <div className="bg-gray-200 text-gray-400 font-medium rounded-md p-2 mx-auto">
                                -
                            </div>
                            )}
                        </td>
                        );
                    })}
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
            
            <button className="mt-6 bg-[#d56c4e] text-white font-medium py-2 px-4 rounded-lg hover:bg-[#c25c3e] flex mx-auto items-center">
            View Detailed Analysis
            </button>
        </motion.div>
        </div>
    </div>
    </div>
  );
}