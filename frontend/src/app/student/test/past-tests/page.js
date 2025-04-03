'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, FileText, Code, Edit3 } from 'lucide-react';

export default function PastTestsPage() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Simulating fetch from API
    const fetchTests = async () => {
      try {
        // This would be replaced with your actual API call
        // const response = await fetch('/api/tests/past');
        // const data = await response.json();
        
        // Sample data structure
        const data = [
          {
            id: '1',
            title: 'Sample Test',
            subtitle: 'Sample Test Description',
            type: 'typed',
            date: '2025-03-10',
            duration: 60,
            score: 85,
            maxScore: 100,
            questions: 15,
          },
          {
            id: '2',
            title: 'Check Test',
            subtitle: 'Check Check',
            type: 'typed',
            date: '2025-03-05',
            duration: 63,
            score: 72,
            maxScore: 100,
            questions: 12,
          },
          {
            id: '3',
            title: 'Coding Challenge',
            subtitle: 'Algorithms and Data Structures',
            type: 'coding',
            date: '2025-02-28',
            duration: 90,
            score: 78,
            maxScore: 100,
            questions: 5,
          },
          {
            id: '4',
            title: 'Check the Duration',
            subtitle: 'Is the duration correct when the test is started?',
            type: 'typed',
            date: '2025-02-20',
            duration: 45,
            score: 68,
            maxScore: 100,
            questions: 10,
          },
          {
            id: '5',
            title: 'Timer Check',
            subtitle: 'Check check',
            type: 'typed',
            date: '2025-02-15',
            duration: 30,
            score: 92,
            maxScore: 100,
            questions: 8,
          },
          {
            id: '6',
            title: 'Advanced OS Concepts',
            subtitle: 'Operating Systems Final',
            type: 'handwritten',
            date: '2025-02-10',
            duration: 120,
            score: 76,
            maxScore: 100,
            questions: 6,
          },
          {
            id: '7',
            title: 'Duration Check',
            subtitle: 'Check if the duration is being sent properly',
            type: 'typed',
            date: '2025-02-01',
            duration: 25,
            score: 45,
            maxScore: 100,
            questions: 5,
          },
        ];
        
        setTests(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tests:', error);
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'typed':
        return <FileText className="mr-2 text-orange-500" size={20} />;
      case 'coding':
        return <Code className="mr-2 text-orange-500" size={20} />;
      case 'handwritten':
        return <Edit3 className="mr-2 text-orange-500" size={20} />;
      default:
        return <FileText className="mr-2 text-orange-500" size={20} />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredTests = filter === 'all' 
    ? tests 
    : tests.filter(test => test.type === filter);

  const calculateProgressColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 70) return 'bg-orange-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-[#fdf9ea]">
      {/* Header */}
      <header className="bg-[#dd7a5f] text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="text-3xl font-bold">Gradia</Link>
          <div className="flex items-center space-x-6">
            <Link href="/practice" className="hover:underline">Practice</Link>
            <Link href="/performance" className="hover:underline">Performance</Link>
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Past Tests & Evaluations</h1>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md transition ${filter === 'all' ? 'bg-[#dd7a5f] text-white' : 'bg-[#f8e2d8] text-gray-700 hover:bg-[#efd0c3]'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('typed')}
              className={`px-4 py-2 rounded-md transition ${filter === 'typed' ? 'bg-[#dd7a5f] text-white' : 'bg-[#f8e2d8] text-gray-700 hover:bg-[#efd0c3]'}`}
            >
              Typed
            </button>
            <button 
              onClick={() => setFilter('coding')}
              className={`px-4 py-2 rounded-md transition ${filter === 'coding' ? 'bg-[#dd7a5f] text-white' : 'bg-[#f8e2d8] text-gray-700 hover:bg-[#efd0c3]'}`}
            >
              Coding
            </button>
            <button 
              onClick={() => setFilter('handwritten')}
              className={`px-4 py-2 rounded-md transition ${filter === 'handwritten' ? 'bg-[#dd7a5f] text-white' : 'bg-[#f8e2d8] text-gray-700 hover:bg-[#efd0c3]'}`}
            >
              Handwritten
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#dd7a5f]"></div>
          </div>
        ) : (
          <>
            {filteredTests.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-xl text-gray-600">No tests found for this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTests.map((test) => (
                  <Link 
                    href={`/student/test/past-tests/${test.id}`} 
                    key={test.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 flex flex-col"
                  >
                    <div className="p-5 flex-grow">
                      <div className="flex items-center mb-3">
                        {getTypeIcon(test.type)}
                        <span className="text-sm bg-[#f8e2d8] text-gray-700 px-2 py-1 rounded capitalize">
                          {test.type}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{test.title}</h3>
                      <p className="text-gray-600 mb-4">{test.subtitle}</p>
                      
                      <div className="flex items-center text-gray-500 mb-2">
                        <Calendar size={16} className="mr-2" />
                        <span>{formatDate(test.date)}</span>
                      </div>
                      <div className="flex items-center text-gray-500 mb-4">
                        <Clock size={16} className="mr-2" />
                        <span>{test.duration} mins</span>
                      </div>
                      
                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Score</span>
                          <span className="font-medium">{test.score}/{test.maxScore}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${calculateProgressColor(test.score)} h-2 rounded-full`} 
                            style={{ width: `${(test.score / test.maxScore) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-[#f8e2d8] p-3 text-right">
                      <span className="text-[#dd7a5f] font-medium">View Details &rarr;</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}