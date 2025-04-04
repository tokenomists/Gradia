'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, FileText, Code, Edit3, CheckCircle, Download } from 'lucide-react';
import { useParams } from 'next/navigation';
import { getSubmissionByTestId, getSubmissionsForStudent } from '@/utils/test';
import { UserDropdown } from '@/components/dashboard/UserDropdown';
import { motion } from 'framer-motion';

export default function TestDetailPage() {
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        // Fetch the submission with all required data
        // console.log('Fetching submission for testId:', params.testId);
        const response = await getSubmissionByTestId(params.testId);
        console.log(response);
        setSubmission(response);
        setLoading(false);
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

  // Calculate maximum possible score for the test
  const getMaxScore = (submission) => {
    if (!submission || !submission.test || !submission.test.questions) return 100;
    return submission.test.questions.reduce((total, q) => total + q.maxMarks, 0);
  };

  const calculateProgressColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 70) return 'bg-orange-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Get a nice display for code answers
  const CodeBlock = ({ code, language }) => (
    <pre className="bg-gray-900 text-white p-4 rounded-md overflow-x-auto">
      <code>{code}</code>
    </pre>
  );

  // Display handwritten answer (image)
  const HandwrittenAnswer = ({ fileUrl }) => (
    <div className="border border-gray-200 rounded-md p-2">
      <img 
        src={fileUrl} 
        alt="Handwritten answer" 
        className="max-w-full h-auto rounded-md"
      />
      <a 
        href={fileUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="flex items-center text-blue-500 mt-2 hover:underline"
      >
        <Download size={16} className="mr-1" />
        View full size
      </a>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf9ea] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#dd7a5f]"></div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-[#fdf9ea] flex justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Submission Not Found</h2>
          <p className="text-gray-600 mb-6">The test submission you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/tests" className="bg-[#dd7a5f] text-white px-4 py-2 rounded-md hover:bg-[#c76a51] transition">
            Back to Tests
          </Link>
        </div>
      </div>
    );
  }

  const test = submission.test || {};
  const maxScore = getMaxScore(submission);

  // Match questions with answers
  const questionsWithAnswers = submission.answers.map(answer => {
    // Find the corresponding question from the test
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
      codingLanguage: question.codingLanguage || 'javascript'
    };
  });

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
        <div className="mb-8">
          <Link href="/tests" className="flex items-center text-[#dd7a5f] font-medium mb-4 hover:underline">
            <ArrowLeft size={18} className="mr-2" />
            Back to All Tests
          </Link>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{test.title || 'Unnamed Test'}</h1>
            <p className="text-gray-600 mb-6">{test.description || ''}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="flex items-center text-gray-700">
                <Calendar size={18} className="mr-2 text-[#dd7a5f]" />
                <span>Submitted: {formatDate(submission.submittedAt)}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Clock size={18} className="mr-2 text-[#dd7a5f]" />
                <span>Duration: {test.duration || '---'} mins</span>
              </div>
              <div className="flex items-center text-gray-700 font-medium">
                <span>Total Score: {submission.totalScore || 0}/{maxScore}</span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className={`${calculateProgressColor(submission.totalScore || 0, maxScore)} h-3 rounded-full`} 
                style={{ width: `${((submission.totalScore || 0) / maxScore) * 100}%` }}
              ></div>
            </div>
            <div className="text-right text-sm text-gray-500">
              {Math.round(((submission.totalScore || 0) / maxScore) * 100)}%
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Questions & Answers</h2>
          
          <div className="space-y-6">
            {questionsWithAnswers.map((q, index) => (
              <div key={q.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-[#f8e2d8] p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-800">Question {index + 1}</h3>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">
                        {q.points}/{q.maxMarks}
                      </span>
                      {q.points === q.maxMarks ? (
                        <CheckCircle size={20} className="text-green-500" />
                      ) : (
                        <div className="flex items-center">
                          <div 
                            className={`w-4 h-4 rounded-full ${calculateProgressColor(q.points, q.maxMarks)}`}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Question:</h4>
                    <p className="text-gray-800">{q.questionText}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Your Answer:</h4>
                    {q.questionType === 'typed' && (
                      <div className="bg-gray-50 p-4 rounded-md border border-gray-200 whitespace-pre-wrap">
                        {q.answerText}
                      </div>
                    )}
                    {q.questionType === 'coding' && (
                      <CodeBlock code={q.codeAnswer} language={q.codingLanguage} />
                    )}
                    {q.questionType === 'handwritten' && (
                      <HandwrittenAnswer fileUrl={q.fileUrl} />
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Feedback:</h4>
                    <div className="bg-[#fff9e6] p-4 rounded-md border border-[#ffeeba] text-gray-700">
                      {q.feedback}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}