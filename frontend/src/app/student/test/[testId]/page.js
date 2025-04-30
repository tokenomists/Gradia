'use client';

import React, { useState, useEffect, useReducer, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import { 
  Clock, 
  FileText, 
  Code, 
  Upload, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  BookmarkIcon, 
  BookmarkCheckIcon,
  Send,
  CheckCircle
} from 'lucide-react';
import CodeEditor from '@/components/student/CodeEditor';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { useRouter, useParams } from 'next/navigation';
import { getTestById, submitTest } from '@/utils/test';
import instance from '@/utils/axios';
import TestInstructionsPage from '@/components/student/TestInstructionsPage';
import TestResumePage from '@/components/student/TestResumePage';

const initialState = {
  questions: [{
    id: 0,
    type: 'typed',
    text: '',
    status: 'not-visited',
    answer: '',
    images: [],
    testCases: [],
    reviewMarked: false,
    maxMarks: 0,
  }],
  currentQuestionIndex: 0,
  timer: 100,
  submitted: false,
  testId: null,
  testDetails: null,
  isLoading: true,
  sessionId: null
};
const xs = '@media (min-width: 480px)';
  
  function testReducer(state, action) {
    switch (action.type) {
      case 'INIT_TEST':
        return {
          ...state,
          questions: action.payload.questions,
          timer: action.payload.timer,
          testDetails: action.payload.testDetails,
          testId: action.payload.testId,
          sessionId: action.payload.sessionId,
          currentQuestionIndex: action.payload.currentQuestionIndex,
        };
      case 'SET_ANSWER':
        return {
          ...state,
          questions: state.questions.map(q => 
            q.id === action.payload.id 
              ? { 
                  ...q, 
                  answer: action.payload.answer,
                  status: (action.payload.answer || q.images.length > 0) ? 'attempted' : 'visited'
                }
              : q
          )
        };
      case 'ADD_IMAGE':
        return {
          ...state,
          questions: state.questions.map(q => 
            q.id === action.payload.id 
              ? { 
                  ...q, 
                  images: [...q.images, action.payload.image],
                  status: 'attempted'
                }
              : q
          )
        };
      case 'REMOVE_IMAGE':
        return {
          ...state,
          questions: state.questions.map(q => 
            q.id === action.payload.id 
              ? { 
                  ...q, 
                  images: q.images.filter((_, index) => index !== action.payload.index),
                  status: q.images.length > 1 ? 'attempted' : 'visited'
                }
              : q
          )
        };
      case 'NAVIGATE_QUESTION':
        return {
          ...state,
          currentQuestionIndex: action.payload,
          questions: state.questions.map((q, index) => 
            index === action.payload && q.status === 'not-visited'
              ? { ...q, status: 'visited' }
              : q
          )
        };
      case 'TOGGLE_REVIEW':
        return {
          ...state,
          questions: state.questions.map(q => 
            q.id === action.payload 
              ? { 
                  ...q, 
                  reviewMarked: !q.reviewMarked,
                  // status: q.reviewMarked ? (q.answer ? 'attempted' : 'visited') : 'marked-review'
                }
              : q
          )
        };
      case 'DECREMENT_TIMER':
        return { ...state, timer: Math.max(0, state.timer - 1) };
      case 'SUBMIT_TEST':
        return { 
          ...state, 
          submitted: true 
        };
      case 'SET_LOADING':
        return {
          ...state,
          isLoading: action.payload
        };
      default:
        return state;
    }
  }

  const TestTimer = ({ seconds }) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const formatTime = (time) => time.toString().padStart(2, '0');
    const isRunningOut = seconds <= 120;
    
    return (
      <motion.div 
        className={`bg-white/70 backdrop-blur-sm rounded-lg ${
          isRunningOut ? 'border-2 border-red-500' : 'border border-[#f4c2a1]'
        } px-2 py-1 md:px-4 md:py-2 shadow-md`}
        animate={isRunningOut ? {
          scale: [1, 1.02, 1],
          transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
        } : {}}
      >
        <div className="flex items-center gap-1 md:gap-2">
          <Clock size={16} className={`md:w-5 md:h-5 ${isRunningOut ? "text-red-500" : "text-[#d56c4e]"}`} />
          <div className="flex items-center">
            {[
              { value: formatTime(hours), separator: ":" },
              { value: formatTime(minutes), separator: ":" },
              { value: formatTime(secs), separator: "" }
            ].map((unit, idx) => (
              <div key={idx} className="flex items-center">
                <div className={`${
                  isRunningOut ? "bg-red-500" : "bg-[#d56c4e]"
                } text-white px-1.5 py-1 md:px-2.5 md:py-1.5 rounded text-sm md:text-xl font-mono font-medium`}>
                  {unit.value}
                </div>
                {unit.separator && (
                  <span className="mx-0.5 text-gray-600 font-medium">{unit.separator}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  // Function to calculate overall test completion
  const calculateTestCompletion = ({ questions }) => {
    const attemptedQuestions = questions.filter(q => 
      q.status === 'attempted' ||
      q.images.length > 0
    ).length;
    return Math.round((attemptedQuestions / questions.length) * 100);
  };

  // Question Summary Component - Add this before the Question Navigation section
const QuestionSummary = ({ questions }) => {
  const totalQuestions = questions.length;
  
  // Update the counting logic
  const attempted = questions.filter(q => q.status === 'attempted').length;
  const visited = questions.filter(q => q.status === 'visited' || q.status === 'attempted').length;
  const notVisited = questions.filter(q => q.status === 'not-visited').length;
  
  // For marked questions, we need to separate them into two categories
  const markedOnly = questions.filter(q => q.reviewMarked && !q.answer && q.images?.length === 0).length;
  const attemptedAndMarked = questions.filter(q => q.reviewMarked && (q.answer || q.images?.length > 0)).length;

  const summaryItems = [
    { label: 'Total', count: totalQuestions, color: 'bg-gray-200' },
    { label: 'Attempted', count: attempted, color: 'bg-green-200' },
    { label: 'Visited', count: visited, color: 'bg-yellow-200' },
    { label: 'Marked Only', count: markedOnly, color: 'bg-orange-200' },
    { label: 'Attempted & Marked', count: attemptedAndMarked, color: 'bg-purple-200' },
    { label: 'Not Visited', count: notVisited, color: 'bg-gray-200' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-xl shadow-md p-4 mb-6"
    >
      <h3 className="font-bold text-[#d56c4e] mb-4 text-center">Question Summary</h3>
      <div className="space-y-3">
        {summaryItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${item.color} mr-2`}></div>
              <span className="text-sm">{item.label}</span>
            </div>
            <span className="font-bold">{item.count}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Completion</span>
          <span className="font-bold">{calculateTestCompletion({questions})}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-[#d56c4e] h-2 rounded-full" 
            style={{ width: `${calculateTestCompletion({questions})}%` }}
          ></div>
        </div>
      </div>
    </motion.div>
  );
};

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const TestPage = () => {
  const [state, dispatch] = useReducer(testReducer, initialState);
  const { questions, currentQuestionIndex, timer, submitted } = state;
  const [saveTimer, setSaveTimer] = useState(5);
  const [showInstructions, setShowInstructions] = useState(null);
  const [showResumePage, setShowResumePage] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const currentQuestion = useMemo(() => {
    return questions[currentQuestionIndex] ?? null;
  }, [questions, currentQuestionIndex]);
  const params = useParams();
  const { testId } = params;
  const router = useRouter();

  useEffect(() => {
    if (!testId) return;
    const fetchTestData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const testData = await getTestById(testId);
        if (!testData) {
          throw new Error('Test data not found');
        }
        // console.log(testData);
        
        const skeleton = testData.questions.map((q, i) => ({
          id: q._id,
          type: q.type,
          text: q.questionText,
          status: 'not-visited',
          answer: '',
          images: [],
          testCases: q.testCases || [],
          reviewMarked: false,
          maxMarks: q.maxMarks,
          qNo: i + 1
        }));
        
        skeleton[0].status = 'visited';

        const res = await instance.post('/api/test-session/start', {
          testId: testId
        });
        // console.log(res);
        const resData = res.data;
        if (!resData.success) {
          const err = await res.error;
          alert(err);
          return router.push('/');
        }
        const session = await resData.session;
        if (session.isStarted) {
          const isResumed = localStorage.getItem('Resume Test: ');
          if (isResumed === 'true') {
            setShowResumePage(true);
            setShowInstructions(false);
          } else {
            setTestStarted(true);
            setShowInstructions(false);
          }
        } else {
          setShowInstructions(true);
        }
        
        const transformedQuestions = skeleton.map((q, idx) => {
          const ans = session.answers[idx] || {};
          return {
            ...q,
            answer: ans.answerText ?? ans.codeAnswer ?? '',
            images: ans.fileUrl ? [ans.fileUrl] : []
          };
        });

        const durationSecs = testData.duration * 60;
        const elapsedSecs = Math.floor((Date.now() - new Date(session.startedAt)) / 1000);
        const remainingTime = Math.max(0, durationSecs - elapsedSecs);

        // console.log("Session data: ", session);
        dispatch({
          type: 'INIT_TEST',
          payload: {
            questions: session.answers.length > 0 ? session.answers : transformedQuestions,
            timer: remainingTime,
            testDetails: { ...testData, startedAt: session.startedAt },
            testId: testId,
            sessionId: session._id,
            currentQuestionIndex: session.currentQuestionIndex || 0,
            isStarted: session.isStarted || false
          }
        });
      } catch (error) {
        console.error('Error fetching test:', error);
        alert(`Failed to load test: ${error.message}`);
        router.push('/');
      }
    };

    fetchTestData();
    // console.log("State after setting the session: ", state);
    dispatch({ type: 'SET_LOADING', payload: false });
    setSaveTimer(5);
  }, [testId, router, testStarted]);
  

  useEffect(() => {
    const timerId = setInterval(() => {
      dispatch({ type: 'DECREMENT_TIMER' });

      if (state.timer <= 0) {
        clearInterval(timerId);
        handleTestSubmit();
      }

    }, 1000);

    return () => clearInterval(timerId);
  }, [state.timer]);

  const handleStartTest = async () => {
    setShowInstructions(false);
    setTestStarted(true);
    await instance.patch(`/api/test-session/${state.sessionId}/start`);
  }; 

  const handleResumeTest = () => {
    setShowResumePage(false);
    // If test wasn't already started, start it now
    if (!testStarted) {
      setTestStarted(true);
    }
    // Reset the localStorage flag
    localStorage.setItem('Resume Test: ', 'false');
  };

  useEffect(() => {
    if (!state.sessionId) return;
    
    const saveInterval = setInterval(async () => {
      if (saveTimer <= 0) {
        try {
          await instance.patch(`/api/test-session/${state.sessionId}`, {
            answers: state.questions,
            currentQuestionIndex: currentQuestionIndex,
            lastSavedAt: new Date()
          });
          console.log("Progress saved successfully!");
        } catch (error) {
          console.error("Failed to save progress:", error);
        }
        setSaveTimer(5);
      } else {
        setSaveTimer(prev => prev - 1);
      }
    }, 1000);
    
    return () => clearInterval(saveInterval);
  }, [saveTimer, state.sessionId, state.questions, currentQuestionIndex]);

  // Image Upload Handler
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File ${file.name} is too large. Maximum size is 2MB`);
        return;
      }
  
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch({
          type: 'ADD_IMAGE',
          payload: {
            id: currentQuestion.id,
            image: reader.result
          }
        });
      };
      reader.onerror = () => {
        alert(`Error reading file ${file.name}`);
      };
      reader.readAsDataURL(file);
    });
    
    e.target.value = '';
  };

  // Render Question Components
  const renderQuestionComponent = () => {
    if (!currentQuestion) {
      return (
        <div className="p-8 text-center">
          <p>Loading question…</p>
        </div>
      );
    }

    const marksDisplay = (
      <div className="mb-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#d56c4e]/10 text-[#d56c4e]">
          Max Marks: {currentQuestion.maxMarks}
        </span>
      </div>
    );

    switch(currentQuestion.type) {
      case 'typed':
        return (
          <>
            {marksDisplay}
            <textarea
              value={currentQuestion.answer || ''}
              onChange={(e) => dispatch({
                type: 'SET_ANSWER',
                payload: {
                  id: currentQuestion.id,
                  answer: e.target.value
                }
              })}
              className="w-full p-4 border-2 border-[#e2c3ae] rounded-lg h-48 shadow-inner focus:ring-2 focus:ring-[#d56c4e] transition-all"
              placeholder="Type your answer here"
            />
          </>
        );
        case 'coding':
          return (
            <div className="space-y-4">
              {marksDisplay}
              <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-md mb-4">
                <p className="text-sm text-blue-700">
                  Note: Your function must be named <code className="bg-blue-100 px-1 rounded">solution</code> and should return the answer
                </p>
              </div>
              <CodeEditor
                value={currentQuestion.answer || ''}
                onChange={(value) => dispatch({
                  type: 'SET_ANSWER',
                  payload: {
                    id: currentQuestion.id,
                    answer: value
                  }
                })}
                dispatch={dispatch}
                currentQuestionId={currentQuestion.id}
                className="min-h-[200px] md:min-h-[300px]"
              />
              
              {/* Test Cases Section */}
              {currentQuestion.testCases && currentQuestion.testCases.length > 0 && (
                <div className="mt-4 md:mt-6 border-2 border-[#e2c3ae] rounded-lg p-3 md:p-4">
                <h3 className="text-lg md:text-xl font-bold text-[#d56c4e] mb-2 md:mb-4">Test Cases</h3>
                <div className="space-y-2 md:space-y-3">
                  {currentQuestion.testCases.filter(tc => !tc.isHidden).map((testCase, index) => (
                    <div key={index} className="bg-gray-50 p-2 md:p-3 rounded-md">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="space-y-1 md:space-y-2 w-full md:w-1/2 mb-2 md:mb-0">
                          <p className="font-medium text-gray-700 text-sm md:text-base">Input:</p>
                          <pre className="bg-gray-100 p-1 md:p-2 rounded overflow-x-auto text-xs md:text-sm">{testCase.input}</pre>
                        </div>
                        <div className="space-y-1 md:space-y-2 w-full md:w-1/2 md:ml-4">
                          <p className="font-medium text-gray-700 text-sm md:text-base">Expected Output:</p>
                          <pre className="bg-gray-100 p-1 md:p-2 rounded overflow-x-auto text-xs md:text-sm">{testCase.output}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}
            </div>
          );
      case 'handwritten':
        return (
          <div className="space-y-4">
            {marksDisplay}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-md mb-4">
              <p className="text-sm text-blue-700">
                Note: Please upload only one image. If multiple images are uploaded, only the first one will be considered for grading.
              </p>
            </div>
            <div className="border-2 border-dashed border-[#e2c3ae] rounded-lg p-4 text-center">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                className="hidden" 
                id="image-upload"
              />
              <label 
                htmlFor="image-upload" 
                className="flex items-center justify-center cursor-pointer hover:bg-[#e2c3ae]/10 p-4 rounded-lg transition-all"
              >
                <Upload className="mr-2 text-[#d56c4e]" />
                Upload Handwritten Solution
              </label>
            </div>
            {currentQuestion.images.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {currentQuestion.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={image} 
                      alt={`Uploaded solution ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border-2 border-[#e2c3ae]"
                    />
                    <button
                      onClick={() => dispatch({
                        type: 'REMOVE_IMAGE',
                        payload: { 
                          id: currentQuestion.id, 
                          index 
                        }
                      })}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  // Submission handler
  const handleTestSubmit = async () => {
    try {
      const answers = state.questions
        .map(q => {
          const answer = {
            questionId: q.id, // Use MongoDB _id from fetched test data
            questionType: q.type, // Preserve original type (don't convert typed→typed)
          };
  
          // Handle different answer types
          if (q.type === 'typed') {
            answer.answerText = q.answer;
          } else if(q.type === 'coding') {
            answer.codeAnswer = q.answer;
          } else if (q.type === 'handwritten') {
            answer.fileUrl = q.images[0] || null;
          }
  
          return answer;
        });
  
      // console.log('Submission payload:', { answers }); // Debug log
      await instance.post(`/api/test-session/${state.sessionId}/submit`);
      await submitTest(state.testId, { answers });
      dispatch({ type: 'SUBMIT_TEST' });
      // router.push(`/test/${state.testId}/submitted`);
      localStorage.setItem('notification', JSON.stringify({ type: 'success', message: 'Test submitted successfully!' }));
    } catch (error) {
      console.error('Submission failed:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        validation: error.response?.data?.errors
      });
      alert(`Submission failed: ${error.response?.data?.message || error.message}`);
    }
  };

  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcf9ea]">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-[#f8e2d8] border-t-[#dd7a5f] animate-spin"></div>
        </div>
      </div>
    );
  }

  if (showInstructions === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcf9ea]">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-[#f8e2d8] border-t-[#dd7a5f] animate-spin"></div>
        </div>
      </div>
    );
  }

  if (showInstructions) {
    return (
      <TestInstructionsPage 
        testDetails={state.testDetails} 
        onStartTest={handleStartTest}
      />
    );
  }
  
  if (showResumePage) {
    return (
      <TestResumePage 
        testDetails={state.testDetails}
        onResumeTest={handleResumeTest}
      />
    );
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#fcf9ea]">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-6 text-center max-w-[34rem]"
      >
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-[#d56c4e] mb-6">Test Submitted Successfully!</h2>
        <p className="text-lg text-gray-600 mb-8">
          We&apos;ve received your answers and they&apos;re now being graded. Great job!
        </p>
        <button 
          onClick={() => router.push('/')}
          className="px-8 py-3 bg-[#d56c4e] text-white rounded-lg hover:bg-[#d56c4e]/90 transition-colors"
        >
          Return to Dashboard
        </button>
      </motion.div>
    </div>
    );
  }

  return (
    <div className="relative flex flex-col md:flex-row h-screen bg-[#fcf9ea] overflow-hidden">
      {/* Mobile Navigation - Fixed at bottom (visible only on small screens) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#edead7] border-t border-[#e2c3ae] z-50 px-2 py-3">
        <div className="flex justify-between items-center">
          {/* Current question indicator */}
          <div className="px-3 py-1 bg-[#d56c4e] text-white rounded-lg text-sm">
            Q {currentQuestionIndex + 1}/{questions.length}
          </div>
          
          {/* Quick navigation buttons */}
          <div className="flex space-x-1 overflow-x-auto py-1 flex-grow mx-2">
            {questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => dispatch({ type: 'NAVIGATE_QUESTION', payload: index })}
                className={cn(
                  "min-w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                  q.status === 'not-visited' && "bg-gray-200 text-gray-500",
                  q.status === 'visited' && "bg-yellow-200 text-yellow-800",
                  q.status === 'attempted' && "bg-green-200 text-green-800",
                  q.reviewMarked && "bg-orange-200 text-orange-800",
                  currentQuestionIndex === index && "ring-2 ring-[#d56c4e]"
                )}
              >
                {q.qNo}
              </button>
            ))}
          </div>
          
          {/* Status summary */}
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs font-medium">{questions.filter(q => q.status === 'attempted').length}</span>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="hidden md:block md:w-1/5 bg-[#edead7] p-6 space-y-6 shadow-lg relative z-40 overflow-y-auto">
        {/* Question Summary */}
        <QuestionSummary questions={questions} />
      
        {/* Question Navigation */}
        <div className="grid grid-cols-5 gap-2 mt-16">
          {questions.map((q, index) => (
            <motion.button
              key={q.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "p-2 md:p-3 rounded-lg text-center font-bold transition-all relative overflow-hidden group text-sm md:text-base",
                q.status === 'not-visited' && "bg-gray-200 text-gray-500",
                q.status === 'visited' && "bg-yellow-200 text-yellow-800",
                q.status === 'attempted' && "bg-green-200 text-green-800",
                q.reviewMarked && "bg-orange-200 text-orange-800",
                currentQuestionIndex === index && "ring-2 ring-[#d56c4e]"
              )}
              onClick={() => dispatch({ 
                type: 'NAVIGATE_QUESTION', 
                payload: index 
              })}
            >
              {q.qNo}
              {q.reviewMarked && (
                <BookmarkIcon 
                  className="absolute top-0.5 right-0.5 md:top-1 md:right-1 w-3 h-3 md:w-4 md:h-4 text-[#d56c4e]" 
                />
              )}
              <motion.div 
                layoutId={`question-status-${q.id}`}
                className="absolute inset-0 bg-[#d56c4e]/10 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full md:w-4/5 flex flex-col flex-grow overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-8 py-3 md:py-4 bg-[#fbf8e9] backdrop-blur-sm border-b border-[#e2c3ae]">
          <h1 className="text-xl md:text-2xl font-bold text-[#d56c4e] mb-2 md:mb-0">
            {state.testDetails?.title || 'Test'}
          </h1>
          <TestTimer seconds={timer} />
        </div>
        <div className="md:hidden m-2">
          <div className="flex justify-between text-xl text-gray-600 mb-1">
            <span className='font-bold text-xl text-[#d56c4e]'>Progress</span>
            <span className='text-xl font-bold'>{calculateTestCompletion({questions})}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full">
            <div 
              className="h-1.5 bg-[#d56c4e] rounded-full" 
              style={{ width: `${calculateTestCompletion({questions})}%` }}
            ></div>
          </div>
        </div>
        <div className="flex-grow p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, type: "tween" }}
            className="bg-white rounded-lg md:rounded-2xl shadow-xl md:shadow-2xl p-4 md:p-8 border-2 md:border-4 border-[#e2c3ae]/50 relative overflow-hidden"
          >
              {/* Decorative Background */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#d56c4e]/10 rounded-full"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#e2c3ae]/10 rounded-full"></div>

              {/* Question Header */}
              <div className="flex flex-col md:flex-row justify-between items-start mb-4 md:mb-6 relative z-10">
                <div className="w-full">
                  <div className='flex flex-row justify-between items-start mb-0'>
                    <h2 className="text-xl md:text-3xl font-bold text-[#d56c4e] flex items-center mb-2 md:mb-0">
                      {currentQuestion.type === 'typed' && <FileText className="mr-2 md:mr-4 text-[#d56c4e] w-6 h-6 md:w-8 md:h-8" />}
                      {currentQuestion.type === 'coding' && <Code className="mr-2 md:mr-4 text-[#d56c4e] w-6 h-6 md:w-8 md:h-8" />}
                      Question {currentQuestion.qNo}
                    </h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => dispatch({ type: 'TOGGLE_REVIEW', payload: currentQuestion.id })}
                      className="flex items-center px-3 py-2 md:px-5 md:py-3 bg-[#e2c3ae] text-black rounded-md md:rounded-xl hover:bg-[#e2c3ae]/80 text-sm md:text-base transition-all"
                    >
                      {currentQuestion.reviewMarked ? (
                        <>
                          <BookmarkCheckIcon className="w-4 h-4 md:w-6 md:h-6 mr-1 md:mr-2" />
                          <span className="xs:inline">Unmark</span>
                        </>
                      ) : (
                        <>
                          <BookmarkIcon className="w-4 h-4 md:w-6 md:h-6 mr-1 md:mr-2" />
                          <span className="xs:inline">Mark for Review</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                  <p className="text-gray-600 mt-2 md:mt-3 text-base md:text-lg">{currentQuestion.text}</p>
                </div>
              </div>

              {/* Question Component */}
              <div className="mt-6">
                {renderQuestionComponent()}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      
      {/* Navigation Buttons - Enhanced with Submit Button */}
      <div className="bg-[#edead7] p-5 flex justify-between items-center shadow-inner">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={currentQuestionIndex === 0}
          onClick={() => dispatch({ type: 'NAVIGATE_QUESTION', payload: currentQuestionIndex - 1 })}
          className="px-3 py-2 md:px-8 md:py-4 bg-[#e2c3ae] text-black rounded-md md:rounded-xl disabled:opacity-50 flex items-center hover:bg-[#e2c3ae]/80 text-sm md:text-base transition-all"
        >
          <ChevronLeft className="mr-1 md:mr-2 w-4 h-4 md:w-6 md:h-6" /> 
          <span className="xs:inline">Previous</span>
        </motion.button>

        {/* Submission Modal */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-3 py-2 md:px-8 md:py-4 bg-[#d56c4e] text-white rounded-md md:rounded-xl flex items-center hover:bg-[#d56c4e]/80 text-sm md:text-base transition-all"
            >
              <Send className="mr-1 md:mr-2 w-4 h-4 md:w-6 md:h-6" /> 
              <span className="xs:inline">Submit Test</span>
            </motion.button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit Test?</AlertDialogTitle>
              <AlertDialogDescription>
                <div className="space-y-4">
                  <p>Are you sure you want to submit the test?</p>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <p className="text-yellow-700">
                      Test Completion: {calculateTestCompletion({questions})}%
                      {calculateTestCompletion({questions}) < 100 && (
                        <span className="block mt-2 text-sm">
                          You have not attempted all questions. Are you sure you want to submit?
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 bg-blue-50 border-l-4 border-blue-400 p-4">
                    <Clock className="w-6 h-6 text-blue-500" />
                    <p className="text-blue-700">
                      Remaining Time: {Math.floor(timer / 3600)}h {Math.floor((timer % 3600) / 60)}m
                    </p>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleTestSubmit}>
                Confirm Submit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={currentQuestionIndex === questions.length - 1}
          onClick={() => dispatch({ type: 'NAVIGATE_QUESTION', payload: currentQuestionIndex + 1 })}
          className="px-3 py-2 md:px-8 md:py-4 bg-[#d56c4e] text-white rounded-md md:rounded-xl disabled:opacity-50 flex items-center hover:bg-[#d56c4e]/80 text-sm md:text-base transition-all"
        >
          <span className="xs:inline">Next</span> 
          <ChevronRight className="ml-1 md:ml-2 w-4 h-4 md:w-6 md:h-6" />
        </motion.button>
      </div>
      {/* Mobile bottom action buttons - floats above the nav bar */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 flex justify-between items-center px-3 py-2 bg-[#fbf8e9] border-t border-[#e2c3ae] z-40">
        <button
          disabled={currentQuestionIndex === 0}
          onClick={() => dispatch({ type: 'NAVIGATE_QUESTION', payload: currentQuestionIndex - 1 })}
          className="p-2 bg-[#e2c3ae] text-black rounded-md disabled:opacity-50 flex items-center"
        >
          <ChevronLeft size={18} />
        </button>
        
        <div className="flex space-x-2">          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="p-2 bg-[#d56c4e] text-white rounded-md flex items-center">
                <Send size={18} />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit Test?</AlertDialogTitle>
              <AlertDialogDescription>
                <div className="space-y-4">
                  <p>Are you sure you want to submit the test?</p>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <p className="text-yellow-700">
                      Test Completion: {calculateTestCompletion({questions})}%
                      {calculateTestCompletion({questions}) < 100 && (
                        <span className="block mt-2 text-sm">
                          You have not attempted all questions. Are you sure you want to submit?
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 bg-blue-50 border-l-4 border-blue-400 p-4">
                    <Clock className="w-6 h-6 text-blue-500" />
                    <p className="text-blue-700">
                      Remaining Time: {Math.floor(timer / 3600)}h {Math.floor((timer % 3600) / 60)}m
                    </p>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleTestSubmit}>
                Confirm Submit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
          </AlertDialog>
        </div>
        
        <button
          disabled={currentQuestionIndex === questions.length - 1}
          onClick={() => dispatch({ type: 'NAVIGATE_QUESTION', payload: currentQuestionIndex + 1 })}
          className="p-2 bg-[#d56c4e] text-white rounded-md disabled:opacity-50 flex items-center"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>

    </div>
  );
};

export default TestPage;