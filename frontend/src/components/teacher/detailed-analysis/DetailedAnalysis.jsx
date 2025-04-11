'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import axios from '@/utils/axios';
import Link from 'next/link';
import { UserDropdown } from '@/components/dashboard/UserDropdown';

export default function DetailedAnalysis() {
  const [heatmapData, setHeatmapData] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchHeatmapData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/tests/heatmap');
        // console.log('Detailed heatmap data:', response.data);
        setHeatmapData(response.data);
      } catch (error) {
        console.error('Error fetching detailed heatmap data:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmapData();
  }, []);

  const renderHeatmap = () => {
    if (loading)
      return (
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-[#f8e2d8] border-t-[#dd7a5f] animate-spin"></div>
          </div>
        </div>
      );
  
    const filteredData = Object.entries(heatmapData).filter(
      ([_, testData]) => Object.keys(testData).length > 0
    );
  
    if (filteredData.length === 0) {
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600">
            No test data found. Add some tests to see the heatmap.
          </p>
        </div>
      );
    }
  
    return (
      <div className="overflow-x-auto pb-8 pt-10">
        <table className="w-full text-center border-collapse">
          <tbody>
            {filteredData.map(([className, testData], index) => (
              <tr key={index}>
                <td className="p-3 text-left font-medium whitespace-nowrap">{className}</td>
                {Object.entries(testData).map(([testName, data]) => (
                  <td key={testName} className="p-2">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={`${data.color} text-black font-medium rounded-sm p-4 mx-auto border border-black relative group cursor-pointer`}
                    >
                      {data.percentage}
                      <div className="absolute opacity-0 group-hover:opacity-100 bg-black text-white p-2 rounded text-sm -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap transition-opacity duration-200 pointer-events-none z-10 shadow-lg">
                        {testName}
                      </div>
                    </motion.div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
 
  return (
    <div className="min-h-screen bg-[#fcf9ea]">
      {/* Navbar */}
      <nav className="bg-[#d56c4e] text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <motion.h1
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ fontFamily: "'Rage Italic', sans-serif" }}
            className="text-4xl font-bold text-black"
          >
            <Link href="/">Gradia</Link>
          </motion.h1>
        </div>
        <div className="flex space-x-6 items-center">
          <motion.span whileHover={{ scale: 1.05 }} className="font-sans cursor-pointer font-medium">
            <Link href="/teacher/tests">Tests</Link>
          </motion.span>
          <motion.span whileHover={{ scale: 1.05 }} className="font-sans cursor-pointer font-medium">
            <Link href="/teacher/detailed-analysis">Analysis</Link>
          </motion.span>
          <UserDropdown />
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Detailed Student Performance Analysis</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#edead7] rounded-xl px-6 shadow-md max-w-full mx-auto"
        >
          {renderHeatmap()}
        </motion.div>

        <div className="mt-6 flex justify-center">
          <motion.button
            onClick={() => router.push('/')}
            whileTap={{ scale: 0.95 }}
            className="bg-[#d56c4e] hover:bg-[#c25c3e] text-white font-medium py-2 px-4 rounded-lg"
          >
            Back to Dashboard
          </motion.button>
        </div>
      </div>
    </div>
  );
}
