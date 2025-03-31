'use client';

import React, { useState, useEffect, useReducer, useCallback, useMemo } from 'react';
import Image from 'next/image';
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
  Send
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

const initialState = {
  questions: [{
    id: 0,
    type: 'typed',
    text: '',
    status: 'not-visited',
    answer: '',
    images: [],
    reviewMarked: false,
    maxMarks: 0
  }],
  currentQuestionIndex: 0,
  timer: 100,
  submitted: false,
  testId: null,
  testDetails: null,
  isLoading: true
};
  
  function testReducer(state, action) {
    switch (action.type) {
      case 'INIT_TEST':
        return {
          ...state,
          questions: action.payload.questions,
          timer: action.payload.timer,
          testDetails: action.payload.testDetails,
          testId: action.payload.testId
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
                  status: q.reviewMarked ? (q.answer ? 'attempted' : 'visited') : 'marked-review'
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

const EnhancedTimer = ({ seconds }) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const formatTime = (time) => time.toString().padStart(2, '0');

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex items-center bg-white/90 backdrop-blur-lg rounded-full px-8 py-4 shadow-2xl ring-4 ring-[#d56c4e]/20"
      >
        <Clock className="text-[#d56c4e] w-10 h-10 mr-4 animate-pulse" />
        <div className="flex items-center space-x-2">
          {[hours, minutes, secs].map((time, index) => (
            <React.Fragment key={index}>
              <div className="flex space-x-1">
                {formatTime(time).split('').map((digit, digitIndex) => (
                  <motion.div 
                    key={digitIndex}
                    className="bg-[#d56c4e] text-white px-4 py-2 rounded-xl text-2xl font-bold w-12 text-center shadow-lg"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      delay: (index * 2 + digitIndex) * 0.1,
                      type: "spring",
                      stiffness: 300
                    }}
                  >
                    {digit}
                  </motion.div>
                ))}
              </div>
              {index < 2 && (
                <span className="text-[#d56c4e] font-bold text-2xl mx-2">:</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const TestPage = () => {
  const [state, dispatch] = useReducer(testReducer, initialState);
  const { questions, currentQuestionIndex, timer, submitted } = state;
  const currentQuestion = useMemo(() => {
    return questions[currentQuestionIndex];
  }, [questions, currentQuestionIndex]);
  const params = useParams();
  const { testId } = params; 
  const router = useRouter();

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        // dispatch({ type: 'SET_LOADING', payload: true });
        
        const testData = await getTestById(testId);
        if (!testData) {
          throw new Error('Test data not found');
        }
        // console.log(testData);
        const now = new Date();
        const endTime = new Date(testData.endTime);
        const remainingTime = Math.max(0, Math.floor((endTime - now) / 1000));
        
        const transformedQuestions = testData.questions.map((q, index) => ({
          _id: q._id,
          type: q.type,
          text: q.questionText,
          status: 'not-visited',
          answer: '',
          images: [],
          reviewMarked: false,
          maxMarks: q.maxMarks
        }));
        
        transformedQuestions[0].status = 'visited';
        transformedQuestions.forEach((q, index) => {
          q.qNo = index + 1;
        });
        console.log(transformedQuestions);
        dispatch({
          type: 'INIT_TEST',
          payload: {
            questions: transformedQuestions,
            timer: remainingTime,
            testDetails: testData,
            testId,
            isLoading: false
          }
        });
      } catch (error) {
        console.error('Error fetching test:', error);
        // Show error to user before redirecting
        alert(`Failed to load test: ${error.message}`);
        router.push('/');
      }
    };
  
    fetchTestData();
  }, [testId, router]);
  

  useEffect(() => {
    const timerId = setInterval(() => {
      dispatch({ type: 'DECREMENT_TIMER' });
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  // Image Upload Handler
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
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
      reader.readAsDataURL(file);
    });
  };

  // Render Question Components
  const renderQuestionComponent = () => {
    switch(currentQuestion.type) {
      case 'typed':
        return (
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
        );
      case 'coding':
        return (
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
          />
        );
      case 'handwritten':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-[#e2c3ae] rounded-lg p-4 text-center">
              <input 
                type="file" 
                accept="image/*" 
                multiple 
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
                  <div key={index} className="relative">
                    <Image 
                      src={image} 
                      alt={`Uploaded solution ${index + 1}`}
                      width={"100%"}
                      height={"100%"}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => dispatch({
                        type: 'REMOVE_IMAGE',
                        payload: { 
                          id: currentQuestion.id, 
                          index 
                        }
                      })}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
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

  // Function to calculate overall test completion
  const calculateTestCompletion = () => {
    const attemptedQuestions = questions.filter(q => 
      q.status === 'attempted' || 
      q.status === 'marked-review' || 
      q.images.length > 0
    ).length;
    return Math.round((attemptedQuestions / questions.length) * 100);
  };

  // Submission handler
  const handleTestSubmit = async () => {
    try {
      const answers = state.questions
        .filter(q => q.answer || q.images.length > 0) // Only include answered questions
        .map(q => {
          const answer = {
            questionId: q._id, // Use MongoDB _id from fetched test data
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
  
      console.log('Submission payload:', { answers }); // Debug log
      
      await submitTest(state.testId, { answers });
      dispatch({ type: 'SUBMIT_TEST' });
      router.push(`/test/submitted`);
    } catch (error) {
      console.error('Submission failed:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        validation: error.response?.data?.errors
      });
      alert(`Submission failed: ${error.response?.data?.message || error.message}`);
    }
  };

  // if (state.isLoading) {
  //   return (
  //     <div className="flex items-center justify-center h-screen bg-[#fcf9ea]">
  //       <motion.div
  //         animate={{ rotate: 360 }}
  //         transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
  //         className="w-16 h-16 border-4 border-[#d56c4e] border-t-transparent rounded-full"
  //       />
  //     </div>
  //   );
  // }

  // If test is submitted, show submission confirmation
  if (submitted) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#fcf9ea]">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-12 text-center"
        >
          <h2 className="text-4xl font-bold text-[#d56c4e] mb-6">Test Submitted Successfully!</h2>
          <p className="text-xl text-gray-600 mb-8">
            Your test has been recorded. Please wait for further instructions.
          </p>
          <button 
            className="px-10 py-4 bg-[#d56c4e] text-white rounded-xl hover:bg-[#d56c4e]/80 transition-all"
            onClick={() => {
              // Return to dashboard
              window.location.href = '/';
            }}
          >
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen bg-[#fcf9ea] overflow-hidden">
      {/* Enhanced Timer */}
      <EnhancedTimer seconds={timer} />

      {/* Sidebar */}
      <div className="w-1/5 bg-[#edead7] p-6 space-y-6 shadow-lg relative z-40">
        {/* Question Navigation */}
        <div className="grid grid-cols-5 gap-2 mt-16">
          {questions.map((q, index) => (
            <motion.button
              key={q.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "p-3 rounded-lg text-center font-bold transition-all relative overflow-hidden group",
                q.status === 'not-visited' && "bg-gray-200 text-gray-500",
                q.status === 'visited' && "bg-yellow-200 text-yellow-800",
                q.status === 'attempted' && "bg-green-200 text-green-800",
                q.status === 'marked-review' && "bg-orange-200 text-orange-800",
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
                  className="absolute top-1 right-1 w-4 h-4 text-[#d56c4e] group-hover:scale-125 transition-transform" 
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

      {/* Main Content Area - Enhanced */}
      <div className="w-4/5 flex flex-col relative pt-24">
        <div className="flex-grow p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ 
                duration: 0.3,
                type: "tween"
              }}
              className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-[#e2c3ae]/50 relative overflow-hidden"
            >
              {/* Decorative Background */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#d56c4e]/10 rounded-full"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#e2c3ae]/10 rounded-full"></div>

              {/* Question Header */}
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h2 className="text-3xl font-bold text-[#d56c4e] flex items-center">
                    {currentQuestion.type === 'typed' && <FileText className="mr-4 text-[#d56c4e] w-8 h-8" />}
                    {currentQuestion.type === 'coding' && <Code className="mr-4 text-[#d56c4e] w-8 h-8" />}
                    Question {currentQuestion.qNo}
                  </h2>
                  <p className="text-gray-600 mt-3 text-lg">{currentQuestion.text}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => dispatch({ 
                    type: 'TOGGLE_REVIEW', 
                    payload: currentQuestion.id 
                  })}
                  className="flex items-center space-x-2 px-5 py-3 bg-[#e2c3ae] text-black rounded-xl hover:bg-[#e2c3ae]/80 transition-all"
                >
                  {currentQuestion.reviewMarked ? (
                    <>
                      <BookmarkCheckIcon className="w-6 h-6 mr-2" />
                      Unmark
                    </>
                  ) : (
                    <>
                      <BookmarkIcon className="w-6 h-6 mr-2" />
                      Mark for Review
                    </>
                  )}
                </motion.button>
              </div>

              {/* Question Component */}
              <div className="mt-6">
                {renderQuestionComponent()}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      
      {/* Navigation Buttons - Enhanced with Submit Button */}
      <div className="bg-[#edead7] p-6 flex justify-between items-center shadow-inner">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={currentQuestionIndex === 0}
          onClick={() => dispatch({ 
            type: 'NAVIGATE_QUESTION', 
            payload: currentQuestionIndex - 1 
          })}
          className="px-8 py-4 bg-[#e2c3ae] text-black rounded-xl disabled:opacity-50 flex items-center hover:bg-[#e2c3ae]/80 transition-all"
        >
          <ChevronLeft className="mr-2 w-6 h-6" /> Previous
        </motion.button>

        {/* Submission Modal */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-[#d56c4e] text-white rounded-xl flex items-center hover:bg-[#d56c4e]/80 transition-all"
            >
              <Send className="mr-2 w-6 h-6" /> Submit Test
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
                      Test Completion: {calculateTestCompletion()}%
                      {calculateTestCompletion() < 100 && (
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
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={currentQuestionIndex === questions.length - 1}
          onClick={() => dispatch({ 
            type: 'NAVIGATE_QUESTION', 
            payload: currentQuestionIndex + 1 
          })}
          className="px-8 py-4 bg-[#d56c4e] text-white rounded-xl disabled:opacity-50 flex items-center hover:bg-[#d56c4e]/80 transition-all"
        >
          Next <ChevronRight className="ml-2 w-6 h-6" />
        </motion.button>
      </div>
    </div>

    </div>
  );
};

export default TestPage;