'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Copy, Upload, UserPlus, X, Check } from 'lucide-react';
import instance from '@/utils/axios.js';
import { UserDropdown } from '@/components/dashboard/UserDropdown';
import { useError } from '@/contexts/ErrorContext';
import { isAuthenticated } from '@/utils/auth';

export default function CreateClass() {
  const [className, setClassName] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [studentEmail, setStudentEmail] = useState('');
  const [studentList, setStudentList] = useState([]);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [classCode, setClassCode] = useState('GRD-' + Math.random().toString(36).substring(2, 8).toUpperCase());
  const [loading, setLoading] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  
  const fileInputRef = useRef(null);
  const router = useRouter();
  const { showError } = useError();
  
  // Mock subjects - in a real app, these would come from an API
  const availableSubjects = [
    'Operating Systems', 
    'Design and Analysis of Algorithms', 
    'Data Structures', 
    'Computer Networks',
    'Database Management'
  ];
  
  // Check if user is a teacher
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { isLoggedIn, role } = await isAuthenticated();
        if (!isLoggedIn || role !== 'teacher') {
          showError('Only teachers can create classes');
          router.push('/');
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        showError('Authentication failed');
        router.push('/');
      }
    };
    
    checkAuth();
  }, [router, showError]);
  
  // Handle adding a student email
  const handleAddStudent = () => {
    if (studentEmail && !studentList.includes(studentEmail)) {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(studentEmail)) {
        showError('Please enter a valid email address');
        return;
      }
      
      setStudentList([...studentList, studentEmail]);
      setStudentEmail('');
    }
  };
  
  // Handle removing a student email
  const handleRemoveStudent = (email) => {
    setStudentList(studentList.filter(item => item !== email));
  };
  
  // Handle file upload for CSV
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const emails = content.split(/[\r\n,]+/)
          .map(email => email.trim())
          .filter(email => {
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return email && emailRegex.test(email) && !studentList.includes(email);
          });
        
        if (emails.length > 0) {
          setStudentList([...studentList, ...emails]);
        } else {
          showError('No valid email addresses found in the file');
        }
      };
      reader.readAsText(file);
    }
  };
  
  // Handle copy class code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(classCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };
  
  // Handle subject selection
  const toggleSubject = (subject) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter(item => item !== subject));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!className.trim()) {
      showError('Class name is required');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await instance.post('/api/classes/create', {
        name: className,
        description: classDescription,
        subjects: selectedSubjects,
        invitedEmails: studentList,
        classCode
      });
      
      if (response.data.success) {
        router.push('/'); // Redirect to dashboard on success
      } else {
        showError(response.data.message || 'Failed to create class');
      }
    } catch (error) {
      console.error("Class creation error:", error);
      showError(
        error.response?.data?.message || 
        error.message || 
        'An error occurred while creating the class'
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#f8f5e9]">
      {/* Navigation Bar */}
      <nav className="bg-[#e07a5f] text-white py-4 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-3xl font-cursive">
            Gradia
          </Link>
        </div>
        <div className="flex items-center space-x-6">
          <Link href="/teacher/tests" className="hover:underline">Tests</Link>
          <Link href="/teacher/analysis" className="hover:underline">Analysis</Link>
          <UserDropdown />
        </div>
      </nav>
      
      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/teacher/dashboard" className="flex items-center text-gray-700 hover:text-[#e07a5f]">
            <ArrowLeft className="mr-2" size={20} />
            <span>Back to Dashboard</span>
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Create a New Class</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            {/* Class Name */}
            <div className="mb-6">
              <label htmlFor="className" className="block text-gray-700 font-medium mb-2">
                Class Name*
              </label>
              <input
                type="text"
                id="className"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e07a5f]"
                placeholder="e.g., CSE F - Design and Analysis of Algorithms"
                required
              />
            </div>
            
            {/* Class Description */}
            <div className="mb-6">
              <label htmlFor="classDescription" className="block text-gray-700 font-medium mb-2">
                Class Description
              </label>
              <textarea
                id="classDescription"
                value={classDescription}
                onChange={(e) => setClassDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e07a5f]"
                placeholder="Provide a brief description of the class"
                rows={3}
              />
            </div>
            
            {/* Subjects */}
            <div className="mb-6 relative">
              <label htmlFor="subjects" className="block text-gray-700 font-medium mb-2">
                Subjects
              </label>
              <div 
                className="w-full px-4 py-2 border border-gray-300 rounded-md cursor-pointer bg-white"
                onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
              >
                {selectedSubjects.length === 0 
                  ? <span className="text-gray-500">Select subjects</span> 
                  : <span>{selectedSubjects.join(', ')}</span>
                }
              </div>
              
              {showSubjectDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {availableSubjects.map((subject, index) => (
                    <div 
                      key={index}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                        selectedSubjects.includes(subject) ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => toggleSubject(subject)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSubjects.includes(subject)}
                        readOnly
                        className="mr-2"
                      />
                      {subject}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Class Code */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Class Code (Auto-generated)
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={classCode}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-l-md bg-gray-50"
                />
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="bg-gray-200 text-gray-700 px-4 rounded-r-md hover:bg-gray-300 flex items-center justify-center"
                >
                  {codeCopied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Students can join using this code
              </p>
            </div>
            
            {/* Student Invites */}
            <div className="mb-8">
              <label className="block text-gray-700 font-medium mb-2">
                Invite Students
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e07a5f]"
                  placeholder="Enter student email"
                />
                <button
                  type="button"
                  onClick={handleAddStudent}
                  className="bg-[#e07a5f] text-white px-4 py-2 rounded-md hover:bg-[#d06a4f] flex items-center"
                >
                  <UserPlus size={18} className="mr-1" />
                  Add
                </button>
              </div>
              
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-md text-gray-500 flex items-center justify-center hover:bg-gray-50"
                >
                  <Upload size={18} className="mr-2" />
                  Upload CSV with student emails
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv"
                  className="hidden"
                />
              </div>
              
              {/* Student List Preview */}
              {studentList.length > 0 && (
                <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">Student List ({studentList.length})</span>
                  </div>
                  <div className="max-h-32 overflow-y-auto">
                    {studentList.map((email, index) => (
                      <div key={index} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0">
                        <span className="text-sm">{email}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveStudent(email)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`bg-[#e07a5f] text-white px-6 py-3 rounded-md hover:bg-[#d06a4f] font-medium transition-colors ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Creating...' : 'Create Class'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}