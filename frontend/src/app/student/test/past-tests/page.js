'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, FileText, Code, Edit3 } from 'lucide-react';
import { getSubmissionsForStudent, getTestsForStudent } from '@/utils/test';
import { title } from 'process';
import { UserDropdown } from '@/components/dashboard/UserDropdown';
import { motion } from 'framer-motion';

export default function PastTestsPage() {
  const [tests, setTests] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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
          maxScore: 100,
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

        console.log('TestData:', TestData);
        console.log('SubmissionData:', SubmissionData);
        setSubmissions(SubmissionData);
        setTests(TestData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tests:', error);
        setLoading(false);
      }
    };

    fetchTests();
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
    if (score >= 80) return 'bg-green-500';
    if (score >= 70) return 'bg-orange-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-[#fdf9ea]">
      {/* Header */}
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
        <div className="flex space-x-6 items-center">
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="cursor-pointer font-sans font-medium"
          >
            Practice
          </motion.span>
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="cursor-pointer font-sans font-medium"
          >
            Performance
          </motion.span>
          <UserDropdown />
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Past Tests & Evaluations</h1>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md transition ${filter === 'all' ? 'bg-[#dd7a5f] text-white' : 'bg-[#f8e2d8] text-gray-700 hover:bg-[#efd0c3]'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('submitted')}
              className={`px-4 py-2 rounded-md transition ${filter === 'submitted' ? 'bg-[#dd7a5f] text-white' : 'bg-[#f8e2d8] text-gray-700 hover:bg-[#efd0c3]'}`}
            >
              Submitted
            </button>
            <button 
              onClick={() => setFilter('missed')}
              className={`px-4 py-2 rounded-md transition ${filter === 'missed' ? 'bg-[#dd7a5f] text-white' : 'bg-[#f8e2d8] text-gray-700 hover:bg-[#efd0c3]'}`}
            >
              Missed
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#dd7a5f]"></div>
          </div>
        ) : (
          <>
            {filteredTests.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-xl text-gray-600">No tests found for this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTests.map((test) => (
                  <Link 
                    href={`/student/test/past-tests/${test.id}`} 
                    key={test.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 flex flex-col"
                  >
                    <div className="p-5 flex-grow">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{test.title}</h3>
                      <p className="text-gray-600 mb-4">{test.description}</p>
                      
                      <div className="flex items-center text-gray-500 mb-2">
                        <Calendar size={16} className="mr-2" />
                        <span>{formatDate(test.date)}</span>
                      </div>
                      <div className="flex items-center text-gray-500 mb-4">
                        <Clock size={16} className="mr-2" />
                        <span>{test.duration} mins</span>
                      </div>
                      
                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Score</span>
                          <span className="font-medium">{test.score}/{test.maxScore}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${calculateProgressColor(test.score)} h-2 rounded-full`} 
                            style={{ width: `${(test.score / test.maxScore) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-[#f8e2d8] p-3 text-right">
                      <span className="text-[#dd7a5f] font-medium">View Details &rarr;</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}