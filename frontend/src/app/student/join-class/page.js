'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import instance from '@/utils/axios.js';
import { UserDropdown } from '@/components/dashboard/UserDropdown';
import { useError } from '@/contexts/ErrorContext';
import { useSuccess } from '@/contexts/SuccessContext';
import { isAuthenticated } from '@/utils/auth';

export default function JoinClass() {
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { showError } = useError();
  const { showSuccess } = useSuccess();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!classCode.trim()) {
      showError('Please enter a class code');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await instance.post('/api/classes/join', {
        classCode: classCode.trim()
      });
      
      if (response.data.success) {
        // showSuccess("Successfully joined class");
        localStorage.setItem("notification", JSON.stringify({ type: "success", message: "Successfully joined the class!" }));
        router.push('/'); // Redirect to dashboard on success
      } else {
        showError(response.data.message || 'Failed to join class');
      }
    } catch (error) {
      console.error("Join class error:", error);
      showError(
        error.response?.data?.message || 
        error.message || 
        'An error occurred while joining the class'
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#f8f5e9]">
      {/* Navigation Bar */}
      <nav className="bg-[#d56c4e] text-white py-4 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" style={{ fontFamily: "'Rage Italic', sans-serif" }} className="text-4xl font-bold text-black">
            Gradia
          </Link>
        </div>
        <div className="flex items-center space-x-6">
        <Link href="/student/assignments" className="font-sans font-medium transition-transform transform hover:scale-110">Assignments</Link>
        <Link href="/student/grades" className="font-sans font-medium transition-transform transform hover:scale-110">Grades</Link>
          <UserDropdown />
        </div>
      </nav>
      
      {/* Main Content */}
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/" className="flex items-center text-gray-700 hover:text-[#d56c4e]">
            <ArrowLeft className="mr-2" size={20} />
              <span>Back to Dashboard</span>
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Join a Class</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="classCode" className="block text-gray-700 font-medium mb-2">
                Enter Class Code
              </label>
              <input
                type="text"
                id="classCode"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e07a5f] text-center text-xl font-medium tracking-wider"
                placeholder="GRD-XXXXXX"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Enter the 6-character class code provided by your teacher
              </p>
            </div>
            
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className={`bg-[#e07a5f] text-white px-8 py-3 rounded-md hover:bg-[#d06a4f] font-medium transition-colors ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Joining...' : 'Join Class'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}