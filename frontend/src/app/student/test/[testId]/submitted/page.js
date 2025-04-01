'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export default function TestSubmittedPage({ params }) {
  // const { testId } = params;
  const router = useRouter();

  return (
    <div className="flex items-center justify-center h-screen bg-[#fcf9ea]">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md"
      >
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-[#d56c4e] mb-6">Test Submitted Successfully!</h2>
        <p className="text-lg text-gray-600 mb-8">
          Your answers have been recorded. You can view your submission in your dashboard.
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