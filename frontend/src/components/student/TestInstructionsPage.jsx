'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, FileText, Code, Upload, HelpCircle, BookOpen, AlertTriangle, Shield } from 'lucide-react';
import { cn } from "@/lib/utils";

const TestInstructionsPage = ({ testDetails, onStartTest }) => {
  const [readInstructions, setReadInstructions] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  
  const instructionSections = [
    {
      title: "Test Overview",
      icon: <BookOpen className="w-6 h-6 text-[#d56c4e]" />,
      content: (
        <div className="space-y-4">
          <p>You are about to take <span className="font-bold text-[#d56c4e]">{testDetails?.title || 'Test'}</span>.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#edead7] p-4 rounded-lg">
              <p className="font-semibold">Duration</p>
              <p className="text-lg">{testDetails?.duration || 60} minutes</p>
            </div>
            <div className="bg-[#edead7] p-4 rounded-lg">
              <p className="font-semibold">Total Questions</p>
              <p className="text-lg">{testDetails?.questions?.length || 0}</p>
            </div>
            <div className="bg-[#edead7] p-4 rounded-lg">
              <p className="font-semibold">Maximum Marks</p>
              <p className="text-lg">{testDetails?.maxMarks || '100'}</p>
            </div>
            <div className="bg-[#edead7] p-4 rounded-lg">
              <p className="font-semibold">Passing Marks</p>
              <p className="text-lg">{testDetails?.passingMarks || Math.floor(testDetails?.maxMarks * 0.4) || '40'}</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Question Types",
      icon: <HelpCircle className="w-6 h-6 text-[#d56c4e]" />,
      content: (
        <div className="space-y-6">
          <div className="flex items-start space-x-4 p-4 bg-[#edead7]/50 rounded-lg">
            <FileText className="w-8 h-8 text-[#d56c4e] mt-1" />
            <div>
              <h4 className="font-bold text-lg">Text Questions</h4>
              <p className="mt-1">Type your answers in the provided text area. Be clear and concise.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-4 bg-[#edead7]/50 rounded-lg">
            <Code className="w-8 h-8 text-[#d56c4e] mt-1" />
            <div>
              <h4 className="font-bold text-lg">Coding Questions</h4>
              <p className="mt-1">Write and test your code in the provided editor. Remember to name your function <code className="bg-gray-200 px-1 rounded">solution</code>.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-4 bg-[#edead7]/50 rounded-lg">
            <Upload className="w-8 h-8 text-[#d56c4e] mt-1" />
            <div>
              <h4 className="font-bold text-lg">Handwritten Solutions</h4>
              <p className="mt-1">For these questions, you'll need to upload a clear image of your handwritten solution. Maximum file size: 2MB.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Navigation & Tools",
      icon: <Clock className="w-6 h-6 text-[#d56c4e]" />,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#edead7]/50 rounded-lg">
            <div className="font-medium">Question Navigation</div>
            <div className="flex gap-2">
              <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">1</span>
              <span className="w-6 h-6 rounded-full bg-yellow-200 flex items-center justify-center text-xs">2</span>
              <span className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center text-xs">3</span>
              <span className="w-6 h-6 rounded-full bg-orange-200 flex items-center justify-center text-xs">4</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-[#edead7]/50 rounded-lg">
            <div className="flex gap-2 items-center">
              <div className="w-3 h-3 rounded-full bg-gray-200"></div>
              <span className="text-sm">Not Visited</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-200"></div>
              <span className="text-sm">Visited</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-3 h-3 rounded-full bg-green-200"></div>
              <span className="text-sm">Attempted</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-3 h-3 rounded-full bg-orange-200"></div>
              <span className="text-sm">Marked for Review</span>
            </div>
          </div>
          
          <p>Your progress is automatically saved every 5 seconds.</p>
        </div>
      )
    },
    {
      title: "Important Rules",
      icon: <AlertTriangle className="w-6 h-6 text-[#d56c4e]" />,
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <h4 className="font-bold text-red-700">Time Limit</h4>
            <p className="text-red-600">The test will automatically submit when the timer reaches zero.</p>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <h4 className="font-bold text-blue-700">Submission</h4>
            <p className="text-blue-600">You can submit your test at any time by clicking the "Submit Test" button.</p>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <h4 className="font-bold text-yellow-700">Browser Warnings</h4>
            <p className="text-yellow-600">Do not refresh the page or navigate away from the test. This may cause loss of answers.</p>
          </div>
          
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <h4 className="font-bold text-green-700">Marking System</h4>
            <p className="text-green-600">Each question has specific marks indicated. There is no negative marking.</p>
          </div>
        </div>
      )
    },
    {
      title: "Technical Support",
      icon: <Shield className="w-6 h-6 text-[#d56c4e]" />,
      content: (
        <div className="space-y-4">
          <p>If you face any technical issues during the test:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Don't panic! Your progress is saved automatically.</li>
            <li>Try refreshing the page once.</li>
            <li>Contact your supervisor if issues persist.</li>
            <li>Email: <span className="font-medium">support@example.com</span></li>
            <li>Support hotline: <span className="font-medium">+1 (123) 456-7890</span></li>
          </ul>
          
          <div className="mt-8 p-4 bg-[#edead7] rounded-lg">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="readConfirmation" 
                className="mr-3 h-5 w-5 accent-[#d56c4e]"
                checked={readInstructions}
                onChange={() => setReadInstructions(!readInstructions)}
              />
              <label htmlFor="readConfirmation" className="font-medium">
                I have read and understood all the instructions
              </label>
            </div>
          </div>
        </div>
      )
    }
  ];
  
  return (
    <div className="flex flex-col h-screen bg-[#fcf9ea] overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 md:px-8 py-3 md:py-4 bg-[#fbf8e9] backdrop-blur-sm border-b border-[#e2c3ae]">
        <h1 className="text-xl md:text-2xl font-bold text-[#d56c4e]">
          {testDetails?.title || 'Test'} Instructions
        </h1>
        <div className="bg-white/70 backdrop-blur-sm rounded-lg border border-[#f4c2a1] px-2 py-1 md:px-4 md:py-2 shadow-md">
          <div className="flex items-center gap-1 md:gap-2">
            <Clock size={16} className="md:w-5 md:h-5 text-[#d56c4e]" />
            <span className="text-sm md:text-base font-medium">{testDetails?.duration || 60} min</span>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-grow overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg md:rounded-2xl shadow-xl md:shadow-2xl p-4 md:p-8 border-2 md:border-4 border-[#e2c3ae]/50 relative overflow-hidden"
          >
            {/* Decorative Background */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#d56c4e]/10 rounded-full"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#e2c3ae]/10 rounded-full"></div>
            
            {/* Navigation Tabs */}
            <div className="flex flex-wrap md:flex-nowrap gap-2 mb-6 relative z-10">
              {instructionSections.map((section, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSection(index)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm md:text-base transition-all flex-1",
                    currentSection === index
                      ? "bg-[#d56c4e] text-white"
                      : "bg-[#edead7] text-gray-700 hover:bg-[#e2c3ae]"
                  )}
                >
                  {section.icon}
                  <span className="hidden md:inline">{section.title}</span>
                </button>
              ))}
            </div>
            
            {/* Content Section */}
            <div className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-[#d56c4e] mb-4 flex items-center">
                {instructionSections[currentSection].icon}
                <span className="ml-2">{instructionSections[currentSection].title}</span>
              </h2>
              
              <div className="min-h-[300px] md:min-h-[400px]">
                {instructionSections[currentSection].content}
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                disabled={currentSection === 0}
                className="px-4 py-2 bg-[#e2c3ae] text-black rounded-lg disabled:opacity-50 hover:bg-[#e2c3ae]/80"
              >
                Previous
              </button>
              
              {currentSection < instructionSections.length - 1 ? (
                <button
                  onClick={() => setCurrentSection(currentSection + 1)}
                  className="px-4 py-2 bg-[#d56c4e] text-white rounded-lg hover:bg-[#d56c4e]/80"
                >
                  Next
                </button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!readInstructions}
                  onClick={onStartTest}
                  className="px-6 py-2 bg-[#d56c4e] text-white rounded-lg disabled:opacity-50 hover:bg-[#d56c4e]/80 flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Start Test
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-[#edead7] p-4 text-center border-t border-[#e2c3ae]">
        <p className="text-sm text-gray-600">Read all instructions carefully before starting the test</p>
      </div>
    </div>
  );
};

export default TestInstructionsPage;