'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, FileText, Code, Edit3, CheckCircle, XCircle } from 'lucide-react';

export default function TestDetailPage({ params }) {
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating fetch from API
    const fetchTest = async () => {
      try {
        // This would be replaced with your actual API call
        // const response = await fetch(`/api/tests/${params.id}`);
        // const data = await response.json();
        
        // Sample detailed test data
        const testData = {
          id: params.id,
          title: 'Sample Test',
          subtitle: 'Sample Test Description',
          type: 'typed',
          date: '2025-03-10',
          duration: 60,
          score: 85,
          maxScore: 100,
          questions: [
            {
              id: 'q1',
              question: 'Explain the purpose of virtual memory in operating systems.',
              answer: 'Virtual memory is a memory management technique that provides an abstraction of the available physical memory. It allows programs to use memory addresses without concern for the physical memory\'s size limitations. The operating system handles the mapping of virtual addresses to physical addresses, enabling efficient use of RAM and allowing processes to execute even when their memory needs exceed available physical memory by using disk space as an extension.',
              maxPoints: 10,
              points: 8,
              feedback: 'Good explanation of the concept, but you could have mentioned paging specifically as the common implementation mechanism.',
            },
            {
              id: 'q2',
              question: 'Compare and contrast preemptive and non-preemptive scheduling algorithms.',
              answer: 'Preemptive scheduling algorithms allow the operating system to interrupt a running process and switch to another process based on scheduling criteria like priority or time quantum. Non-preemptive algorithms, on the other hand, allow a process to run until it voluntarily yields the CPU, blocks for I/O, or terminates. Preemptive scheduling offers better response times for interactive applications and ensures higher priority tasks can execute sooner, but comes with context switching overhead. Non-preemptive scheduling is simpler to implement and has no context switching overhead, but can lead to poor response times if a process monopolizes the CPU.',
              maxPoints: 15,
              points: 15,
              feedback: 'Excellent comprehensive comparison with consideration of advantages and disadvantages.',
            },
            {
              id: 'q3',
              question: 'Describe how deadlocks occur and list strategies to prevent them.',
              answer: 'Deadlocks occur when processes hold resources while waiting for additional resources that are being held by other waiting processes, creating a circular wait. Prevention strategies include: (1) Mutual exclusion avoidance - using sharable resources where possible; (2) Hold and wait prevention - requiring processes to request all resources at once or release current resources before requesting new ones; (3) No preemption - allowing the system to preempt resources from waiting processes; (4) Circular wait prevention - imposing a total ordering on resources types.',
              maxPoints: 12,
              points: 10,
              feedback: 'Good explanation of deadlock conditions and prevention strategies, but the description of the "no preemption" strategy was incorrect. It should involve allowing resources to be forcibly taken, not preventing preemption.',
            },
            {
              id: 'q4',
              question: 'Write pseudocode for the banker\'s algorithm for deadlock avoidance.',
              answer: `function isSafe(Available, Max, Allocation, Need, n, m)
  Work = Available.copy()
  Finish = [false] × n
  
  # Find an unfinished process that can be allocated needed resources
  while true
    found = false
    for i = 0 to n-1
      if Finish[i] == false and Need[i] <= Work
        # Process can complete
        Work = Work + Allocation[i]
        Finish[i] = true
        found = true
        break
    
    # If no eligible process found, exit loop
    if not found
      break
  
  # Check if all processes can finish
  return all(Finish)

function requestResources(process, request, Available, Allocation, Need)
  # Check if request exceeds stated maximum
  if request > Need[process]
    return "Error: request exceeds maximum need"
  
  # Check if resources are available
  if request > Available
    return "Process must wait, resources unavailable"
  
  # Tentatively allocate resources
  Available' = Available - request
  Allocation' = Allocation.copy() with Allocation'[process] += request
  Need' = Need.copy() with Need'[process] -= request
  
  # Check if resulting state is safe
  if isSafe(Available', Max, Allocation', Need', n, m)
    # Commit the allocation
    Available = Available'
    Allocation = Allocation'
    Need = Need'
    return "Request granted"
  else
    # Revert the tentative allocation
    return "Request denied, would lead to unsafe state"`,
              maxPoints: 20,
              points: 18,
              feedback: 'Very good implementation. Missing initialization of the Max matrix in the parameters for the isSafe function, but otherwise correct.',
            },
          ]
        };
        
        setTest(testData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching test details:', error);
        setLoading(false);
      }
    };

    fetchTest();
  }, [params.id]);

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

  const calculateProgressColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 70) return 'bg-orange-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf9ea] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#dd7a5f]"></div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-[#fdf9ea] flex justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Test Not Found</h2>
          <p className="text-gray-600 mb-6">The test you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/student/test/past-tests" className="bg-[#dd7a5f] text-white px-4 py-2 rounded-md hover:bg-[#c76a51] transition">
            Back to Tests
          </Link>
        </div>
      </div>
    );
  }

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
        <div className="mb-8">
          <Link href="/student/test/past-tests" className="flex items-center text-[#dd7a5f] font-medium mb-4 hover:underline">
            <ArrowLeft size={18} className="mr-2" />
            Back to All Tests
          </Link>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center mb-4">
              {getTypeIcon(test.type)}
              <span className="text-sm bg-[#f8e2d8] text-gray-700 px-2 py-1 rounded capitalize">
                {test.type}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{test.title}</h1>
            <p className="text-gray-600 mb-6">{test.subtitle}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="flex items-center text-gray-700">
                <Calendar size={18} className="mr-2 text-[#dd7a5f]" />
                <span>Date: {formatDate(test.date)}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Clock size={18} className="mr-2 text-[#dd7a5f]" />
                <span>Duration: {test.duration} mins</span>
              </div>
              <div className="flex items-center text-gray-700 font-medium">
                <span>Total Score: {test.score}/{test.maxScore}</span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className={`${calculateProgressColor(test.score, test.maxScore)} h-3 rounded-full`} 
                style={{ width: `${(test.score / test.maxScore) * 100}%` }}
              ></div>
            </div>
            <div className="text-right text-sm text-gray-500">
              {Math.round((test.score / test.maxScore) * 100)}%
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Questions & Answers</h2>
          
          <div className="space-y-6">
            {test.questions.map((q, index) => (
              <div key={q.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-[#f8e2d8] p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-800">Question {index + 1}</h3>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">
                        {q.points}/{q.maxPoints}
                      </span>
                      {q.points === q.maxPoints ? (
                        <CheckCircle size={20} className="text-green-500" />
                      ) : (
                        <div className="flex items-center">
                          <div 
                            className={`w-4 h-4 rounded-full ${calculateProgressColor(q.points, q.maxPoints)}`}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Question:</h4>
                    <p className="text-gray-800">{q.question}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Your Answer:</h4>
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200 whitespace-pre-wrap">
                      {q.answer}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Feedback:</h4>
                    <div className="bg-[#fff9e6] p-4 rounded-md border border-[#ffeeba] text-gray-700">
                      {q.feedback}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}