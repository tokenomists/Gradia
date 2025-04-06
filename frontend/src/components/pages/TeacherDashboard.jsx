'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { PenLine, Plus, ChevronDown, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserDropdown } from '@/components/dashboard/UserDropdown.jsx';
import { isAuthenticated } from '@/utils/auth.js';
import { getTestsForTeacher } from '@/utils/test.js';
import { getClassesForTeacher } from '@/utils/class.js';
import axios from '@/utils/axios';

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
  const [heatmapData, setHeatmapData] = useState({});
  const [loadingHeatmap, setLoadingHeatmap] = useState(true);
  const [greeting, setGreeting] = useState("Hello there");

  const router = useRouter();

  useEffect(() => {
    if (user?.name) {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setGreeting(`Good morning, ${user.name}`);
      } else if (hour >= 12 && hour < 15) {
        setGreeting(`Good afternoon, ${user.name}`);
      } else {
        setGreeting(`Good evening, ${user.name}`);
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await isAuthenticated();
      setUser(userData);
    };

    const fetchTests = async () => {
      let tests = await getTestsForTeacher();
      if (tests) tests = tests.previousTests;
      else tests = [];
      setTestsData(tests);
    };

    const fetchClasses = async () => {
      const classes = await getClassesForTeacher();
      if (classes) setClassesData(classes);
    };

    const fetchHeatmapData = async () => {
      setLoadingHeatmap(true);
      try {
        const response = await axios.get('/api/tests/heatmap');
        console.log('Heatmap data received:', response.data);
        setHeatmapData(response.data);
      } catch (error) {
        console.error('Error fetching heatmap data:', error.response?.data || error.message);
      } finally {
        setLoadingHeatmap(false);
      }
    };

    fetchUser();
    fetchTests();
    fetchClasses();
    fetchHeatmapData();
  }, []);

  // Rotate quotes every 60 seconds
  useEffect(() => {
    const randomQuote = teacherQuotes[Math.floor(Math.random() * teacherQuotes.length)];
    setCurrentQuote(randomQuote);

    const interval = setInterval(() => {
      const randomQuote = teacherQuotes[Math.floor(Math.random() * teacherQuotes.length)];
      setCurrentQuote(randomQuote);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkScrollability = () => {
      const container = classesContainerRef.current;
      if (container) {
        setCanScrollLeft(container.scrollLeft > 0);
        setCanScrollRight(
          container.scrollLeft < container.scrollWidth - container.clientWidth
        );
      }
    };

    const container = classesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      checkScrollability();

      setTimeout(checkScrollability, 100);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollability);
      }
    };
  }, []);

  const classesContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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

  const renderHeatmap = () => {
    console.log('Rendering heatmap with data:', heatmapData); // Debug log for full data
    if (loadingHeatmap) return <p className="text-gray-600">Loading heatmap...</p>;
    if (Object.keys(heatmapData).length === 0) return <p className="text-gray-600">No heatmap data available.</p>;
  
    // Collect all tests with their createdAt timestamps across all classes
    const allTests = [];
    Object.values(heatmapData).forEach((testData, classIndex) => {
      console.log(`Class ${classIndex} testData:`, testData); // Log each class's test data
      Object.entries(testData).forEach(([testTitle, data]) => {
        console.log(`Test ${testTitle} data:`, data); // Log each test's data
        if (Object.keys(testData).length > 0) {
          allTests.push({ title: testTitle, createdAt: data.createdAt || null }); // Allow null createdAt for debugging
        }
      });
    });
  
    console.log('All tests collected:', allTests); // Log all collected tests
  
    // Sort by createdAt (latest first) and limit to 3, handle null createdAt
    const sortedTests = allTests
      .sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0; // Treat null as equal for now
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, 3)
      .map(test => test.title);
  
    console.log('Sorted tests (latest 3):', sortedTests); // Log the final sorted tests
  
    if (sortedTests.length === 0) {
      console.log('No valid tests found for sorting. Check createdAt or data structure.');
      return <p className="text-gray-600">No test data available for heatmap.</p>;
    }
  
    return (
      <div className="bg-[#edead7] rounded-xl p-6 shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Student Performance</h2>
        <table className="w-full text-center border-collapse">
          <thead>
            <tr>
              <th className="p-2 border"></th>
              {sortedTests.map((test) => (
                <th key={test} className="p-2 border">{test}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(heatmapData).map(([className, testData], index) => (
              <tr key={index}>
                <td className="p-2 text-left font-medium border">{className}</td>
                {sortedTests.map((test) => {
                  const data = testData[test] || { percentage: 'NA', color: 'bg-gray-200' };
                  return (
                    <td key={test} className="p-2 border">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className={`${data.color} text-black font-medium rounded-sm p-4 mx-auto border border-black`}
                      >
                        {data.percentage}
                      </motion.div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={() => router.push('/teacher/detailed-analysis')}
          className="mt-6 bg-[#d56c4e] text-white font-medium py-2 px-4 rounded-lg hover:bg-[#c25c3e] flex mx-auto items-center"
        >
          View Detailed Analysis
        </button>
      </div>
    );
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
            style={{ fontFamily: "'Rage Italic', sans-serif" }}
            className="text-4xl font-bold text-black"
          >
            <Link href="/teacher/dashboard">Gradia</Link>
          </motion.h1>
        </div>
        <div className="flex space-x-6 items-center">
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="font-sans cursor-pointer font-medium"
          >
            <Link href="/teacher/tests">Tests</Link>
          </motion.span>
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="font-sans cursor-pointer font-medium"
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{greeting}</h1>
            <p className="text-gray-600 italic">"{currentQuote}"</p>
          </motion.div>
        
          <div className="flex space-x-4">
            <motion.button
              onClick={() => {router.push('/teacher/create-test')}}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#e2c3ae] hover:bg-[#d5b69d] text-gray-800 font-medium py-2 px-4 rounded-lg flex items-center gap-2"
            >
              <PenLine size={18} />
              Create Test
            </motion.button>
            
            <motion.button
              onClick={() => {router.push('/teacher/create-class')}}
              whileHover={{ scale: 1.05 }}
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
          className="bg-[#edead7] rounded-xl p-4 shadow-md mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Classes</h2>

          {/* Scrollable Classes Container */}
          <div className="relative bg-[#edead7] rounded-xl">
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
                    scale: 1.005, 
                    boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.08)"
                  }}
                  className="bg-[#e2c3ae] rounded-lg p-3 min-w-[240px] w-[240px] cursor-pointer flex-shrink-0 border border-black"
                >
                  <p className="text-lg font-bold text-gray-800 truncate">{classItem.name}</p>
                  <h3 className="text-gray-700 text-sm">{classItem.classCode}</h3>
                  <p className="text-gray-600 text-sm mt-2">{classItem.students.length} students</p>
                </motion.div>
              ))}
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
                      animate={{ rotate: expandedTest === test._id ? 180 : 0 }}
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
          <div>
            {renderHeatmap()} {/* Ensure this is the only content rendered here */}
          </div>
        </div>
      </div>
    </div>
  );
}