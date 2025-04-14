'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, FileText, Code, Edit3, CheckCircle, Award } from 'lucide-react';
import { useParams } from 'next/navigation';
import { getSubmissionByTestId } from '@/utils/test';
import { UserDropdown } from '@/components/dashboard/UserDropdown';
import { motion } from 'framer-motion';

export default function TestDetailPage() {
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const params = useParams();

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await getSubmissionByTestId(params.testId);
        setSubmission(response);
        setLoading(false);
        // Set the first question as active by default
        if (response && response.answers && response.answers.length > 0) {
          setActiveQuestion(0);
        }
      } catch (error) {
        console.error('Error fetching submission details:', error);
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [params.testId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMaxScore = (submission) => {
    if (!submission || !submission.test || !submission.test.questions) return 100;
    return submission.test.questions.reduce((total, q) => total + q.maxMarks, 0);
  };

  const calculateProgressColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'bg-gradient-to-r from-green-400 to-green-600';
    if (percentage >= 80) return 'bg-gradient-to-r from-green-300 to-green-500';
    if (percentage >= 70) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (percentage >= 60) return 'bg-gradient-to-r from-orange-400 to-orange-600';
    return 'bg-gradient-to-r from-red-400 to-red-600';
  };

  const getGradeEmoji = (percentage) => {
    if (percentage >= 90) return '🏆';
    if (percentage >= 80) return '🌟';
    if (percentage >= 70) return '👍';
    if (percentage >= 60) return '🙂';
    return '📚';
  };

  const CodeBlock = ({ code, language }) => (
    <pre className="bg-gray-900 text-white p-4 rounded-md overflow-x-auto shadow-inner">
      <div className="flex items-center mb-2 -mt-1 text-gray-400 text-xs">
        <div className="flex space-x-1 mr-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
        </div>
        <span>{language}</span>
      </div>
      <code className="font-mono text-sm">{code}</code>
    </pre>
  );

  const HandwrittenAnswer = ({ fileUrl }) => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="border border-gray-200 rounded-md p-3 shadow-md bg-white"
    >
      <div className="overflow-hidden rounded-md">
        <motion.img 
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.2 }}
          src={fileUrl} 
          alt="Handwritten answer" 
          className="max-w-[500px] h-auto rounded-md hover:shadow-lg transition-all"
        />
      </div>
    </motion.div>
  );

  // Loading state with animation
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fdf9ea] to-[#fff5e9] flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24">
            <div className="absolute top-0 left-0 w-full h-full border-8 border-[#f8d9c7] rounded-full opacity-30"></div>
            <div className="absolute top-0 left-0 w-full h-full border-8 border-t-[#dd7a5f] rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-xl font-medium text-[#dd7a5f]">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fdf9ea] to-[#fff5e9] flex justify-center items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-red-100 rounded-full">
              <FileText size={40} className="text-red-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Submission Not Found</h2>
          <p className="text-gray-600 mb-6 text-center">The test submission you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/student/test/past-tests" className="block w-full bg-gradient-to-r from-[#dd7a5f] to-[#e59275] text-white px-4 py-3 rounded-lg hover:shadow-lg transition text-center font-medium">
            Back to Tests
          </Link>
        </motion.div>
      </div>
    );
  }

  const test = submission.test || {};
  const maxScore = getMaxScore(submission);
  const scorePercentage = Math.round(((submission.totalScore || 0) / maxScore) * 100);

  // Match questions with answers
  const questionsWithAnswers = submission.answers.map(answer => {
    const question = test.questions?.find(q => q._id === answer.questionId) || {};
    
    return {
      id: answer.questionId,
      questionText: question.questionText || 'Question not available',
      questionType: answer.questionType,
      maxMarks: question.maxMarks || 0,
      points: answer.score || 0,
      answerText: answer.answerText || '',
      codeAnswer: answer.codeAnswer || '',
      fileUrl: answer.fileUrl || '',
      feedback: answer.feedback || 'No feedback provided',
      codingLanguage: question.codingLanguage || 'python3'
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf9ea] to-[#fff5e9]">
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
          <Link href="/">
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer font-sans font-medium flex items-center"
            >
              Practice
            </motion.span>
          </Link>
          <Link href="/student/test/past-tests">
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer font-sans font-medium flex items-center"
            >
              Performance
            </motion.span>
          </Link>
          <UserDropdown />
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link href="/student/test/past-tests" className="flex items-center text-[#dd7a5f] font-medium mb-6 hover:underline group">
            <ArrowLeft size={18} className="mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform" />
            Back to All Tests
          </Link>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                  {test.title || 'Unnamed Test'}
                  <span className="ml-2 text-2xl">{getGradeEmoji(scorePercentage)}</span>
                </h1>
                <p className="text-gray-600">{test.description || ''}</p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center bg-[#f8f2e7] px-4 py-2 rounded-lg">
                <Award size={22} className="mr-2 text-[#dd7a5f]" />
                <span className="font-medium text-gray-800">
                  Score: <span className="text-[#dd7a5f]">{submission.totalScore || 0}/{maxScore}</span>
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <motion.div 
                whileHover={{ y: -3 }}
                className="bg-gray-50 rounded-lg p-4 flex items-center shadow-sm"
              >
                <div className="bg-[#f8d9c7] p-2 rounded-full mr-3">
                  <Calendar size={20} className="text-[#dd7a5f]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submitted</p>
                  <p className="font-medium">{formatDate(submission.submittedAt)}</p>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -3 }}
                className="bg-gray-50 rounded-lg p-4 flex items-center shadow-sm"
              >
                <div className="bg-[#f8d9c7] p-2 rounded-full mr-3">
                  <Clock size={20} className="text-[#dd7a5f]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium">{test.duration || '---'} mins</p>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -3 }}
                className="bg-gray-50 rounded-lg p-4 flex items-center shadow-sm"
              >
                <div className="bg-[#f8d9c7] p-2 rounded-full mr-3">
                  <CheckCircle size={20} className="text-[#dd7a5f]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Performance</p>
                  <p className="font-medium">{scorePercentage}% Completion</p>
                </div>
              </motion.div>
            </div>
            
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-[#dd7a5f]">
                    Your Score
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-[#dd7a5f]">
                    {scorePercentage}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${scorePercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`${calculateProgressColor(submission.totalScore || 0, maxScore)} h-2.5 rounded-full shadow-inner`}
                ></motion.div>
              </div>
            </div>
          </motion.div>
          
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Questions & Answers</h2>
            <div className="text-sm text-gray-500">
              {questionsWithAnswers.length} questions in total
            </div>
          </div>
          
          {/* Question navigation tabs */}
          <div className="mb-6 overflow-x-auto">
            <div className="flex space-x-2 min-w-max">
              {questionsWithAnswers.map((q, index) => (
                <motion.button
                  key={`tab-${q.id}`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveQuestion(index)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    activeQuestion === index 
                      ? 'bg-[#dd7a5f] text-white shadow-md' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Q{index + 1}
                  <span className={`ml-2 ${
                    q.points === q.maxMarks ? 'text-green-400' : ''
                  }`}>
                    {q.points}/{q.maxMarks}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Display active question */}
          {activeQuestion !== null && (
            <motion.div
              key={`question-${activeQuestion}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="bg-gradient-to-r from-[#f8e2d8] to-[#fdf0e7] p-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-800 flex items-center">
                    <span className="bg-[#dd7a5f] text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">
                      {activeQuestion + 1}
                    </span>
                    {questionsWithAnswers[activeQuestion].questionType === 'coding' && (
                      <Code size={18} className="mr-2 text-[#dd7a5f]" />
                    )}
                    {questionsWithAnswers[activeQuestion].questionType === 'typed' && (
                      <Edit3 size={18} className="mr-2 text-[#dd7a5f]" />
                    )}
                    {questionsWithAnswers[activeQuestion].questionType === 'handwritten' && (
                      <FileText size={18} className="mr-2 text-[#dd7a5f]" />
                    )}
                    <span className="capitalize">{questionsWithAnswers[activeQuestion].questionType}</span> Question
                  </h3>
                  <div className="flex items-center">
                    <div className="px-3 py-1 rounded-full bg-white shadow-sm flex items-center">
                      <span className="font-medium text-gray-800 mr-2">
                        {questionsWithAnswers[activeQuestion].points}/{questionsWithAnswers[activeQuestion].maxMarks}
                      </span>
                      {questionsWithAnswers[activeQuestion].points === questionsWithAnswers[activeQuestion].maxMarks ? (
                        <CheckCircle size={18} className="text-green-500" />
                      ) : (
                        <div 
                          className={`w-4 h-4 rounded-full ${calculateProgressColor(
                            questionsWithAnswers[activeQuestion].points, 
                            questionsWithAnswers[activeQuestion].maxMarks
                          )}`}
                        ></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                    <span className="text-[#dd7a5f] mr-2">⦿</span> Question:
                  </h4>
                  <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-[#dd7a5f]">
                    <p className="text-gray-800">{questionsWithAnswers[activeQuestion].questionText}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                    <span className="text-[#dd7a5f] mr-2">⦿</span> Your Answer:
                  </h4>
                  {questionsWithAnswers[activeQuestion].questionType === 'typed' && (
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 whitespace-pre-wrap shadow-inner">
                      {questionsWithAnswers[activeQuestion].answerText}
                    </div>
                  )}
                  {questionsWithAnswers[activeQuestion].questionType === 'coding' && (
                    <CodeBlock 
                      code={questionsWithAnswers[activeQuestion].codeAnswer} 
                      language={questionsWithAnswers[activeQuestion].codingLanguage} 
                    />
                  )}
                  {questionsWithAnswers[activeQuestion].questionType === 'handwritten' && (
                    <HandwrittenAnswer fileUrl={questionsWithAnswers[activeQuestion].fileUrl} />
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                    <span className="text-[#dd7a5f] mr-2">⦿</span> Feedback:
                  </h4>
                  <div className="bg-gradient-to-r from-[#fff9e6] to-[#fffbf0] p-5 rounded-lg border-l-4 border-[#ffd166] text-gray-700 shadow-sm">
                    <div className="flex">
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-8 h-8 bg-[#ffd166] rounded-full flex items-center justify-center text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                        </div>
                      </div>
                      <div>
                        {questionsWithAnswers[activeQuestion].feedback}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Navigation buttons */}
              <div className="bg-gray-50 px-6 py-4 flex justify-between">
                <button 
                  onClick={() => setActiveQuestion(prev => Math.max(0, prev - 1))}
                  disabled={activeQuestion === 0}
                  className={`flex items-center px-4 py-2 rounded-lg transition ${
                    activeQuestion === 0 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ArrowLeft size={18} className="mr-2" />
                  Previous
                </button>
                <button 
                  onClick={() => setActiveQuestion(prev => Math.min(questionsWithAnswers.length - 1, prev + 1))}
                  disabled={activeQuestion === questionsWithAnswers.length - 1}
                  className={`flex items-center px-4 py-2 rounded-lg transition ${
                    activeQuestion === questionsWithAnswers.length - 1 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Next
                  <ArrowLeft size={18} className="ml-2 transform rotate-180" />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}