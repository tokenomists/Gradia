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
    <div className="flex flex-col min-h-screen bg-[#fcf9ea]">
      <div className="flex justify-between items-center px-5 py-5 bg-[#fcf9ea] border-b border-[#e2c3ae]">
        <h1 className="text-xl font-bold text-[#d56c4e]">
          {testDetails.title}
        </h1>
      </div>
      
      <div className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border-2 border-[#e2c3ae] overflow-hidden">
            <div className="p-7">
              <div className="flex items-center space-x-4 mb-7">
                <div className="w-12 h-12 rounded-full bg-[#d56c4e]/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-[#d56c4e]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Resume Your Test</h2>
                  <p className="text-gray-600 text-sm">
                    Your progress has been saved. Continue where you left off.
                  </p>
                </div>
              </div>

              <div className="flex gap-5 mb-7">
                <div className="flex-1 bg-[#fcf9ea]/50 p-4 rounded-lg border border-[#e2c3ae]">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-6 w-6 text-[#d56c4e]" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Remaining Time</div>
                      <div className="font-bold text-gray-900 text-lg">
                        {Math.max(testDetails.duration - (Math.floor((Date.now() - new Date(testDetails.startedAt).getTime()) / 60000)), 0)} minutes
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 bg-[#fcf9ea]/50 p-4 rounded-lg border border-[#e2c3ae]">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="h-6 w-6 text-[#d56c4e]" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Questions</div>
                      <div className="font-bold text-gray-900 text-lg">
                        {testDetails.questions?.length || 0} total
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onResumeTest();
                  const elem = document.documentElement;
                  if (elem.requestFullscreen) {
                    elem.requestFullscreen();
                  } else if (elem.webkitRequestFullscreen) {
                    elem.webkitRequestFullscreen();
                  } else if (elem.msRequestFullscreen) {
                    elem.msRequestFullscreen();
                  }
                }}
                className="w-full py-3.5 bg-[#d56c4e] text-white font-bold rounded-lg flex items-center justify-center hover:bg-[#d56c4e]/90 transition-all shadow-md group"
              >
                <span>Continue Your Test</span>
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResumePage;