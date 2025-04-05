'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getTestsForStudent } from '@/utils/test.js';

export default function AllTestsPage() {
  const [testData, setTestData] = useState({
    previousTests: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTests = async () => {
      setIsLoading(true);
      try {
        const data = await getTestsForStudent();
        setTestData(data);
      } catch (error) {
        console.error('Error fetching tests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTests();
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
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

  const handleBack = () => {
    router.back();
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-[#fcf9ea]">
      {/* Navbar */}
      <nav className="bg-[#d56c4e] text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <motion.h1 
            initial={{ x: -5, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
            style={{ fontFamily: "'Rage Italic', sans-serif" }}
            className="text-4xl font-bold text-black"
          >
            Gradia
          </motion.h1>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-6 py-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <motion.button
            onClick={handleBack}
            whileHover={{ scale: 1.05 }}
            className="flex items-center text-gray-700 font-medium"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </motion.button>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="bg-[#edead7] rounded-xl p-6 shadow-md"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-300"
          >
            All Past Tests & Evaluations
          </motion.h2>

          {isLoading ? (
            <div className="py-8 text-center">
              <p className="text-gray-600">Loading tests...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {testData.previousTests.length > 0 ? (
                testData.previousTests.map((test) => (
                  <motion.div 
                    key={test._id}
                    variants={itemVariants}
                    className="bg-[#f4f1e2] rounded-lg p-4 shadow-sm border-l-4 border-[#d56c4e]"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-800 text-lg">{test.title}</h4>
                        <p className="text-gray-600 mt-1">{test.description}</p>
                        
                        <div className="flex items-center space-x-4 mt-3">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar size={14} className="mr-1" />
                            <span>{formatDate(test.submittedAt || test.completedAt)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock size={14} className="mr-1" />
                            <span>{test.duration} mins</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-2xl font-bold text-gray-800">
                          {test.score}%
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Grade: {test.score >= 90 ? 'A' : 
                                 test.score >= 80 ? 'B' : 
                                 test.score >= 70 ? 'C' : 
                                 test.score >= 60 ? 'D' : 'F'}
                        </div>
                      </div>
                    </div>
                    
                    <motion.button
                      onClick={() => router.push(`/student/test-details/${test._id}`)}
                      whileHover={{ scale: 1.02 }}
                      className="mt-3 flex items-center text-[#d56c4e] text-sm font-medium"
                    >
                      View details
                      <ArrowLeft size={14} className="ml-1 rotate-180" />
                    </motion.button>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No past tests available</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}