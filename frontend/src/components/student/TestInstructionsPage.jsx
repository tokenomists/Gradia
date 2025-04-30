'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Clock, 
  FileText, 
  Code, 
  Upload, 
  HelpCircle, 
  BookOpen, 
  AlertTriangle 
} from 'lucide-react';
import { cn } from "@/lib/utils";

const TestInstructionsPage = ({ testDetails, onStartTest }) => {
  const [readInstructions, setReadInstructions] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  
  const instructionSections = [
    {
      title: "Overview",
      icon: <BookOpen className="w-6 h-6 text-[#d56c4e]" />,
      content: (
        <div className="space-y-5">
          <div className="bg-[#fcf9ea] p-5 rounded-lg border-2 border-[#e2c3ae]">
            <p className="text-base mb-4">You are about to take <span className="font-bold text-[#d56c4e]">{testDetails?.title || 'Test'}</span></p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-md shadow-sm border-2 border-[#e2c3ae]">
                <p className="text-sm text-[#d56c4e] font-medium">Duration</p>
                <p className="text-xl font-bold">{testDetails?.duration || 60}<span className="text-sm ml-1">mins</span></p>
              </div>
              <div className="bg-white p-4 rounded-md shadow-sm border-2 border-[#e2c3ae]">
                <p className="text-sm text-[#d56c4e] font-medium">Questions</p>
                <p className="text-xl font-bold">{testDetails?.questions?.length || 0}</p>
              </div>
              <div className="bg-white p-4 rounded-md shadow-sm border-2 border-[#e2c3ae]">
                <p className="text-sm text-[#d56c4e] font-medium">Max Marks</p>
                <p className="text-xl font-bold">{testDetails?.maxMarks || '100'}</p>
              </div>
              <div className="bg-white p-4 rounded-md shadow-sm border-2 border-[#e2c3ae]">
                <p className="text-sm text-[#d56c4e] font-medium">Pass Marks</p>
                <p className="text-xl font-bold">{testDetails?.passingMarks || Math.floor(testDetails?.maxMarks * 0.4) || '40'}</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Questions",
      icon: <HelpCircle className="w-6 h-6 text-[#d56c4e]" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-lg shadow-sm border-2 border-[#e2c3ae] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#fcf9ea] rounded-full transform translate-x-8 -translate-y-8"></div>
            <FileText className="w-7 h-7 text-[#d56c4e] mb-3 relative z-10" />
            <h4 className="text-lg font-bold mb-2 relative z-10">Text Questions</h4>
            <p className="text-base text-gray-600 relative z-10">Type your answers in the provided text area.</p>
          </div>
          
          <div className="bg-white p-5 rounded-lg shadow-sm border-2 border-[#e2c3ae] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#fcf9ea] rounded-full transform translate-x-8 -translate-y-8"></div>
            <Code className="w-7 h-7 text-[#d56c4e] mb-3 relative z-10" />
            <h4 className="text-lg font-bold mb-2 relative z-10">Coding</h4>
            <p className="text-base text-gray-600 relative z-10">Write and test your code in the provided editor. Remember to name your function <code className="bg-gray-100 px-1.5 rounded text-sm">solution</code>.</p>
          </div>
          
          <div className="bg-white p-5 rounded-lg shadow-sm border-2 border-[#e2c3ae] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#fcf9ea] rounded-full transform translate-x-8 -translate-y-8"></div>
            <Upload className="w-7 h-7 text-[#d56c4e] mb-3 relative z-10" />
            <h4 className="text-lg font-bold mb-2 relative z-10">Handwritten</h4>
            <p className="text-base text-gray-600 relative z-10">Upload a clear image of your handwritten answer. Max: 2MB.</p>
          </div>
        </div>
      )
    },
    {
      title: "Rules",
      icon: <AlertTriangle className="w-6 h-6 text-[#d56c4e]" />,
      content: (
        <div className="space-y-5">
          <div className="bg-white rounded-lg shadow-sm border-2 border-[#e2c3ae] p-5">
            <h4 className="font-bold text-[#d56c4e] mb-4">Navigation Guide</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                <span className="text-sm">Not Visited</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-200"></div>
                <span className="text-sm">Visited</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-200"></div>
                <span className="text-sm">Attempted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-200"></div>
                <span className="text-sm">For Review</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#fff4f2] rounded-lg p-4 border-l-4 border-[#d56c4e]">
              <h4 className="font-bold text-[#d56c4e] text-base mb-2">Auto-Save</h4>
              <p className="text-sm text-gray-700">Progress is automatically saved every 5 seconds</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
              <h4 className="font-bold text-yellow-700 text-base mb-2">Browser Warning</h4>
              <p className="text-sm text-yellow-600">Do not refresh or navigate away from the test</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-400">
              <h4 className="font-bold text-red-700 text-base mb-2">Time Limit</h4>
              <p className="text-sm text-red-600">Test auto submits when timer reaches zero</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="readConfirmation" 
                className="mr-2 h-4 w-4 accent-[#d56c4e]"
                checked={readInstructions}
                onChange={() => setReadInstructions(!readInstructions)}
              />
              <label htmlFor="readConfirmation" className="text-sm text-gray-600">
                I have read and understood all instructions
              </label>
            </div>
          </div>
        </div>
      )
    }
  ];
  
  return (
    <div className="flex flex-col min-h-screen bg-[#fcf9ea]">
      <div className="flex justify-between items-center px-5 py-4 bg-[#fcf9ea] border-b border-[#e2c3ae]">
        <h1 className="text-xl font-bold text-[#d56c4e]">
          {testDetails?.title || 'Test'} Instructions
        </h1>
        <div className="bg-white px-4 py-2 rounded-md border-2 border-[#e2c3ae]">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#d56c4e]" />
            <span className="text-base font-medium">{testDetails?.duration || 60} min</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-5">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border-2 border-[#e2c3ae]">
            <div className="p-5">
              <div className="flex gap-3 mb-6">
                {instructionSections.map((section, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSection(index)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-base transition-all flex-1",
                      currentSection === index
                        ? "bg-[#d56c4e] text-white shadow-sm"
                        : "bg-[#fcf9ea] text-gray-700 hover:bg-[#e2c3ae]/50"
                    )}
                  >
                    {React.cloneElement(section.icon, { 
                      className: cn(
                        "w-6 h-6",
                        currentSection === index ? "text-white" : "text-[#d56c4e]"
                      )
                    })}
                    <span>{section.title}</span>
                  </button>
                ))}
              </div>
              
              <motion.div 
                key={currentSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-6"
              >
                {instructionSections[currentSection].content}
              </motion.div>
              
              <div className="flex justify-between pt-5 border-t border-[#e2c3ae]">
                <button
                  onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                  disabled={currentSection === 0}
                  className="px-5 py-2 bg-[#fcf9ea] text-gray-700 rounded-md text-base disabled:opacity-50 hover:bg-[#e2c3ae]/30 transition-colors"
                >
                  Previous
                </button>
                
                {currentSection < instructionSections.length - 1 ? (
                  <button
                    onClick={() => setCurrentSection(currentSection + 1)}
                    className="px-5 py-2 bg-[#d56c4e] text-white rounded-md text-base hover:bg-[#d56c4e]/90 transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!readInstructions}
                    onClick={onStartTest}
                    className="px-6 py-2 bg-[#d56c4e] text-white rounded-md text-base disabled:opacity-50 hover:bg-[#d56c4e]/90 transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
                  >
                    <Check className="w-5 h-5" />
                    Start Test
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#edead7] p-4 text-center border-t border-[#e2c3ae]">
        <p className="text-base text-gray-600">Please read all instructions carefully before starting the test</p>
      </div>
    </div>
  );
};

export default TestInstructionsPage;