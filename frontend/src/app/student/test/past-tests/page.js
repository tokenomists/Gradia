'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, FileText, Code, Edit3, BookOpen, Award, AlertCircle } from 'lucide-react';
import { getSubmissionsForStudent, getTestsForStudent } from '@/utils/test';
import { UserDropdown } from '@/components/dashboard/UserDropdown';
import { motion, AnimatePresence } from 'framer-motion';

export default function PastTestsPage() {
  const [tests, setTests] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showHero, setShowHero] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        // Fetch test data
        let TestData = await getTestsForStudent();
        TestData = TestData.previousTests;
        TestData = TestData.map((test, index) => ({
          id: test._id || (index + 1).toString(),
          title: test.title || 'Untitled Test',
          description: test.description || 'No description available',
          status: 'missed',
          date: 'N/A',
          duration: test.duration || 0,
          score: 'N/A',
          maxScore: test.maxMarks,
          questions: test.questions?.length || 0,
        }));

        // Fetch submission data
        const SubmissionData = await getSubmissionsForStudent();

        // Update TestData with scores from SubmissionData
        TestData = TestData.map((test) => {
          const submission = SubmissionData.find((sub) => sub.test === test.id);
          if (submission) {
            test.score = submission.totalScore || 'N/A';
            test.date = submission.submittedAt;
            test.status = 'submitted';
          }
          return test;
        });

        setSubmissions(SubmissionData);
        TestData.sort((a, b) => new Date(b.date) - new Date(a.date));
        setTests(TestData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tests:', error);
        setLoading(false);
      }
    };

    fetchTests();
    
    // Hide hero section after 5 seconds
    const timer = setTimeout(() => {
      setShowHero(false);
    }, 50000);
    
    return () => clearTimeout(timer);
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredTests = filter === 'all' 
    ? tests 
    : tests.filter(test => test.status === filter);

  const calculateProgressColor = (score) => {
    if (score === 'N/A') return 'bg-gray-300';
    if (score >= 80) return 'bg-gradient-to-r from-emerald-400 to-green-500';
    if (score >= 70) return 'bg-gradient-to-r from-yellow-400 to-orange-500';
    if (score >= 60) return 'bg-gradient-to-r from-amber-300 to-yellow-500';
    return 'bg-gradient-to-r from-red-400 to-red-500';
  };
  
  const getStatusIcon = (status) => {
    if (status === 'submitted') return <Award size={16} className="mr-1 text-emerald-500" />;
    return <AlertCircle size={16} className="mr-1 text-amber-500" />;
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const fadeIn = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  // Stats for hero section
  const completedTests = tests.filter(test => test.status === 'submitted').length;
  const averageScore = tests.reduce((acc, test) => {
    if (test.score !== 'N/A') {
      return acc + (test.score / test.maxScore) * 100;
    }
    return acc;
  }, 0) / (completedTests || 1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff8e9] to-[#fdf9ea]">
      {/* Header */}
      <nav className="bg-[#d56c4e] text-white px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center">
          <motion.div 
            initial={{ rotate: -5, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <Link href="/" style={{ fontFamily: "'Rage Italic', sans-serif" }} className="text-4xl font-bold text-black relative">
              Gradia
            </Link>
          </motion.div>
        </div>
        <div className="flex space-x-6 items-center">
          <motion.span 
            whileHover={{ scale: 1.05, y: -2 }}
            className="cursor-pointer font-sans font-medium flex items-center"
          >
            <BookOpen size={18} className="mr-1.5" />
            Practice
          </motion.span>
          <motion.span 
            whileHover={{ scale: 1.05, y: -2 }}
            className="cursor-pointer font-sans font-medium flex items-center"
          >
            <Award size={18} className="mr-1.5" />
            Performance
          </motion.span>
          <UserDropdown />
        </div>
      </nav>

      {/* Hero Section - Animated and disappears after 5 seconds */}
      <AnimatePresence>
        {showHero && (
          <motion.div 
            initial={{ opacity: 0, height: "auto" }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-[#d56c4e] to-[#e07e63] text-white px-8 py-12 mb-6"
          >
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="container mx-auto text-center"
            >
              <h2 className="text-4xl font-bold mb-4">Your Learning Journey</h2>
              <p className="text-lg max-w-2xl mx-auto mb-8 opacity-90">Track your progress and review past evaluations to identify strengths and areas for improvement.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 shadow-lg">
                  <h3 className="text-xl font-semibold mb-1">Tests Taken</h3>
                  <p className="text-3xl font-bold">{completedTests}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 shadow-lg">
                  <h3 className="text-xl font-semibold mb-1">Average Score</h3>
                  <p className="text-3xl font-bold">{averageScore.toFixed(1)}%</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 shadow-lg">
                  <h3 className="text-xl font-semibold mb-1">Missed Tests</h3>
                  <p className="text-3xl font-bold">{tests.length - completedTests}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Past Tests & Evaluations</h1>
            <p className="text-gray-600">Review your performance and see detailed feedback</p>
          </div>
          <div className="flex items-center space-x-2 bg-white p-1 rounded-lg shadow-md">
            <button 
              onClick={() => setFilter('all')}
              className={`px-5 py-2.5 rounded-md transition-all duration-300 font-medium ${filter === 'all' 
                ? 'bg-[#dd7a5f] text-white shadow-md' 
                : 'bg-[#f8e2d8] text-gray-700 hover:bg-[#efd0c3]'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('submitted')}
              className={`px-5 py-2.5 rounded-md transition-all duration-300 font-medium flex items-center ${filter === 'submitted' 
                ? 'bg-[#dd7a5f] text-white shadow-md' 
                : 'bg-[#f8e2d8] text-gray-700 hover:bg-[#efd0c3]'}`}
            >
              <Award size={16} className="mr-1.5" />
              Submitted
            </button>
            <button 
              onClick={() => setFilter('missed')}
              className={`px-5 py-2.5 rounded-md transition-all duration-300 font-medium flex items-center ${filter === 'missed' 
                ? 'bg-[#dd7a5f] text-white shadow-md' 
                : 'bg-[#f8e2d8] text-gray-700 hover:bg-[#efd0c3]'}`}
            >
              <AlertCircle size={16} className="mr-1.5" />
              Missed
            </button>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-[#f8e2d8] border-t-[#dd7a5f] animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#dd7a5f] font-small">Loading..</div>
            </div>
          </div>
        ) : (
          <>
            {filteredTests.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-lg p-12 text-center"
              >
                <div className="w-24 h-24 bg-[#f8e2d8] rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle size={40} className="text-[#dd7a5f]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No tests found</h3>
                <p className="text-xl text-gray-600 max-w-md mx-auto">There are no tests available in this category right now.</p>
              </motion.div>
            ) : (
              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredTests.map((test) => (
                  <motion.div key={test.id} variants={fadeIn}>
                    <Link 
                      href={`/student/test/past-tests/${test.id}`} 
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1 group"
                    >
                      <div className="p-6 flex-grow">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
                            test.status === 'submitted' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {getStatusIcon(test.status)}
                            {test.status === 'submitted' ? 'Completed' : 'Missed'}
                          </span>
                          <span className="text-gray-400 text-sm">{test.questions} questions</span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#dd7a5f] transition-colors">{test.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{test.description}</p>
                        
                        <div className="flex items-center text-gray-500 mb-2">
                          <Calendar size={16} className="mr-2 text-[#dd7a5f]" />
                          <span>{test.date !== 'N/A' ? formatDate(test.date) : 'Not attempted'}</span>
                        </div>
                        <div className="flex items-center text-gray-500 mb-4">
                          <Clock size={16} className="mr-2 text-[#dd7a5f]" />
                          <span>{test.duration} mins</span>
                        </div>
                        
                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">Score</span>
                            {test.score !== 'N/A' ? 
                              <span className="font-bold">{test.score}/{test.maxScore}</span> : 
                              <span className="text-gray-400 italic">Not attempted</span>
                            }
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                            <div 
                              className={`${calculateProgressColor(test.score)} h-2.5 rounded-full transition-all duration-500 ease-out`} 
                              style={{ width: test.score !== 'N/A' ? `${(test.score / test.maxScore) * 100}%` : '0%' }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-[#f8e2d8] to-[#faeae3] p-4 text-right group-hover:bg-gradient-to-r group-hover:from-[#dd7a5f] group-hover:to-[#e58b73] transition-all duration-300">
                        <span className="text-[#dd7a5f] font-medium group-hover:text-white transition-colors flex items-center justify-end">
                          View Details 
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
}