'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import axios from '@/utils/axios';
import Link from 'next/link';
import { UserDropdown } from '@/components/dashboard/UserDropdown';
import { ArrowLeft } from 'lucide-react';

export default function DetailedAnalysis() {
  const [heatmapData, setHeatmapData] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchHeatmapData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/tests/heatmap');
        setHeatmapData(response.data);
      } catch (error) {
        console.error('Error fetching detailed heatmap data:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmapData();
  }, []);

  const getTestColor = (percentage, attendedStudents) => {
    if (percentage == null || attendedStudents == null || attendedStudents === 0) {
      return 'bg-gray-300';
    }
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 40) return 'bg-orange-400';
    return 'bg-red-500';
  };

  const renderHeatmap = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-[#f8e2d8] border-t-[#dd7a5f] animate-spin"></div>
          </div>
        </div>
      );
    }

    const classes = Object.entries(heatmapData);
    if (!classes.length) {
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600">No test data found. Add some tests to see the heatmap.</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto pb-8 pt-14">
        <table className="w-full text-center border-collapse">
          <tbody>
            {classes.map(([className, testsData], classIndex) => {
              const tests = Object.entries(testsData)
                .filter(([_, data]) => data && data.title && data.createdAt)
                .sort((a, b) => new Date(b[1].createdAt) - new Date(a[1].createdAt))
                .map(([testId, data]) => ({
                  id: testId,
                  title: data.title,
                  percentage: data.percentage,
                  attended: data.attendedStudents || 0,
                  total: data.totalStudents || 0,
                  color: getTestColor(data.percentage, data.attendedStudents),
                }));

              if (!tests.length) {
                return null;
              }

              return (
                <tr key={classIndex}>
                  <td className={'sticky left-0 bg-[#edead7] z-10 border-r p-3 text-left font-medium whitespace-nowrap'}>{className}</td>
                  {tests.map((test) => (
                    <td key={test.id} className="p-2 border">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className={`${test.color} text-black font-medium rounded-sm p-4 mx-auto border border-black relative group cursor-pointer`}
                      >
                        {test.attended > 0 ? `${test.percentage}%` : 'NA'}
                        <div className="absolute opacity-0 group-hover:opacity-100 bg-black text-white p-2 rounded text-xs -top-14 left-1/2 transform -translate-x-1/2 whitespace-nowrap transition-opacity duration-200 pointer-events-none z-50 shadow-lg">
                          <p className="font-bold mb-1 break-words" style={{ maxWidth: '200px' }}>{test.title}</p>
                          <p>Turnout: {test.attended}/{test.total}</p>
                        </div>
                      </motion.div>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fcf9ea]">
      <nav className="bg-[#d56c4e] text-white px-6 py-4 flex justify-between items-center">
        <motion.h1
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ fontFamily: "'Rage Italic', sans-serif" }}
          className="text-4xl font-bold text-black"
        >
          <Link href="/">Gradia</Link>
        </motion.h1>
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center mb-6">
          <Link href="/" className="flex items-center text-[#e07a5f]">
            <ArrowLeft className="mr-2" size={20} />
            <span>Back to Dashboard</span>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Detailed Student Performance Analysis</h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#edead7] rounded-xl px-6 shadow-md max-w-full mx-auto"
        >
          {renderHeatmap()}
        </motion.div>
      </div>
    </div>
  );
}
