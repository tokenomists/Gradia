'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

const TestResumePage = ({ testDetails, onResumeTest }) => {
  if (!testDetails) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#fcf9ea]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#d56c4e] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf9ea] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-6 md:p-10 max-w-3xl w-full border-2 border-[#e2c3ae]/50"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#d56c4e] mb-3">{testDetails.title}</h1>
          <div className="h-1 w-16 bg-[#d56c4e] rounded-full"></div>
        </div>

        {/* Status Message */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-r-md">
          <div className="flex">
            <AlertCircle className="h-6 w-6 text-yellow-500 mr-3" />
            <div>
              <h2 className="text-lg font-medium text-yellow-800">Resume Your Test</h2>
              <p className="text-yellow-700 mt-1">
                You have an ongoing test session. You can resume where you left off.
              </p>
            </div>
          </div>
        </div>

        {/* Test Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#fcf9ea] p-4 rounded-lg border border-[#e2c3ae]">
            <h3 className="font-medium text-gray-700 mb-2">Test Duration</h3>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-[#d56c4e] mr-2" />
              <span className="text-xl font-bold">{Math.max(testDetails.duration - (Math.floor((Date.now() - new Date(testDetails.startedAt).getTime()) / 60000)), 0)} minutes</span>
            </div>
          </div>
          
          <div className="bg-[#fcf9ea] p-4 rounded-lg border border-[#e2c3ae]">
            <h3 className="font-medium text-gray-700 mb-2">Number of Questions</h3>
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-[#d56c4e] mr-2" />
              <span className="text-xl font-bold">{testDetails.questions?.length || 0} questions</span>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8 rounded-r-md">
          <h3 className="font-medium text-blue-800 mb-2">Important Notes:</h3>
          <ul className="text-blue-700 space-y-2 ml-5 list-disc">
            <li>Your answers have been saved automatically.</li>
            <li>The timer will continue from where you left off.</li>
            <li>Do not refresh or close the browser during the test.</li>
          </ul>
        </div>

        {/* Resume Button */}
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onResumeTest}
            className="px-8 py-4 bg-[#d56c4e] text-white font-bold rounded-xl flex items-center hover:bg-[#d56c4e]/90 transition-all shadow-lg"
          >
            Resume Test
            <ArrowRight className="ml-2 h-5 w-5" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default TestResumePage;