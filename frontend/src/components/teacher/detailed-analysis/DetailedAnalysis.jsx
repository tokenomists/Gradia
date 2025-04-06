'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import axios from '@/utils/axios';

export default function DetailedAnalysis() {
  const [heatmapData, setHeatmapData] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchHeatmapData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/tests/heatmap');
        console.log('Detailed heatmap data:', response.data);
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
    if (loading) return <p className="text-gray-600">Loading detailed heatmap...</p>;
    if (Object.keys(heatmapData).length === 0) return <p className="text-gray-600">No heatmap data available.</p>;

    // Collect all tests with their createdAt timestamps
    const allTests = [];
    Object.values(heatmapData).forEach(testData => {
      Object.entries(testData).forEach(([testTitle, data]) => {
        if (Object.keys(testData).length > 0) {
          allTests.push({ title: testTitle, createdAt: data.createdAt });
        }
      });
    });

    // Sort by createdAt (latest first)
    const sortedTests = allTests
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(test => test.title);

    console.log('All sorted tests:', sortedTests);

    if (sortedTests.length === 0) return <p className="text-gray-600">No test data available for heatmap.</p>;

    return (
      <div className="min-h-screen bg-[#edead7] p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Detailed Student Performance Analysis</h1>
        <div className="overflow-x-auto whitespace-nowrap">
          <table className="w-full text-center border-collapse inline-block">
            <thead>
              <tr>
                <th className="p-2 border"></th>
                {sortedTests.map((test) => (
                  <th key={test} className="p-2 border">{test}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(heatmapData).map(([className, testData], index) => (
                <tr key={index}>
                  <td className="p-2 text-left font-medium border">{className}</td>
                  {sortedTests.map((test) => {
                    const data = testData[test] || { percentage: 'NA', color: 'bg-gray-200' };
                    return (
                      <td key={test} className="p-2 border">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className={`${data.color} text-black font-medium rounded-sm p-4 mx-auto border border-black`}
                        >
                          {data.percentage}
                        </motion.div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          onClick={() => router.push('/')}
          className="mt-6 bg-[#e2c3ae] hover:bg-[#d5b69d] text-gray-800 font-medium py-2 px-4 rounded-lg flex mx-auto items-center"
        >
          Back to Dashboard
        </button>
      </div>
    );
  };

  return (
    <div>
      {renderHeatmap()}
    </div>
  );
}