'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Copy, Check, Upload, X, File, UserPlus } from 'lucide-react';
import instance from '@/utils/axios.js';
import { UserDropdown } from '@/components/dashboard/UserDropdown';
import { useError } from '@/contexts/ErrorContext';
import { isAuthenticated } from '@/utils/auth';

export default function ClassPage() {
  const params = useParams();
  const classId = params.id;
  const router = useRouter();
  const { showError } = useError();
  
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentEmail, setStudentEmail] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  const fileInputRef = useRef(null);
  
  // Fetch class data
  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setLoading(true);
        const response = await instance.get(`/api/classes/${classId}`);
        if (response.data.success) {
          setClassData(response.data.class);
        } else {
          showError(response.data.message || 'Failed to load class data');
          router.push('/');
        }
      } catch (error) {
        console.error("Error fetching class data:", error);
        showError(
          error.response?.data?.message || 
          error.message || 
          'An error occurred while loading class data'
        );
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    
    // Check if user is authenticated and has access to this class
    const checkAuth = async () => {
      try {
        const { isLoggedIn, role } = await isAuthenticated();
        if (!isLoggedIn) {
          router.push('/signin');
          return false;
        }
        return true;
      } catch (error) {
        console.error("Auth check failed:", error);
        showError('Authentication failed');
        router.push('/signin');
        return false;
      }
    };
    
    const initialize = async () => {
      const isAuth = await checkAuth();
      if (isAuth) {
        fetchClassData();
      }
    };
    
    initialize();
  }, [classId, router, showError]);
  
  // Handle copy class code to clipboard
  const handleCopyCode = () => {
    if (classData?.classCode) {
      navigator.clipboard.writeText(classData.classCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };
  
  // Handle adding a student email
  const handleAddStudent = async () => {
    if (!studentEmail) return;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentEmail)) {
      showError('Please enter a valid email address');
      return;
    }
    
    try {
      const response = await instance.post(`/api/classes/${classId}/invite`, {
        email: studentEmail
      });
      
      if (response.data.success) {
        // Update the class data to include the new invited email
        setClassData({
          ...classData,
          invitedEmails: [...classData.invitedEmails, studentEmail]
        });
        setStudentEmail('');
      } else {
        showError(response.data.message || 'Failed to invite student');
      }
    } catch (error) {
      console.error("Error inviting student:", error);
      showError(
        error.response?.data?.message || 
        error.message || 
        'An error occurred while inviting student'
      );
    }
  };
  
  // Handle material file upload
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    // Validate file types (PDF only)
    const invalidFiles = files.filter(file => file.type !== 'application/pdf');
    if (invalidFiles.length > 0) {
      showError('Only PDF files are allowed');
      return;
    }
    
    setUploadingFile(true);
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('classFiles', file);
      });
      
      const response = await instance.post(`/api/classes/${classId}/upload-materials`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        // Update the class data to include the new materials
        setClassData({
          ...classData,
          materials: [...(classData.materials || []), ...response.data.materials]
        });
      } else {
        showError(response.data.message || 'Failed to upload materials');
      }
    } catch (error) {
      console.error("Error uploading materials:", error);
      showError(
        error.response?.data?.message || 
        error.message || 
        'An error occurred while uploading materials'
      );
    } finally {
      setUploadingFile(false);
    }
  };
  
  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcf9ea] flex justify-center items-center">
        <div className="text-xl font-semibold text-gray-700">Loading class data...</div>
      </div>
    );
  }
  
  if (!classData) {
    return (
      <div className="min-h-screen bg-[#fcf9ea] flex justify-center items-center flex-col">
        <div className="text-xl font-semibold text-gray-700 mb-4">Class not found</div>
        <Link href="/" className="text-[#e07a5f] hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#fcf9ea]">
      {/* Navigation Bar */}
      <nav className="bg-[#d56c4e] text-white py-4 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" style={{ fontFamily: "'Rage Italic', sans-serif" }} className="text-4xl font-bold text-black">
            Gradia
          </Link>
        </div>
        <div className="flex items-center space-x-6">
          <Link href="/teacher/tests" className="font-sans font-medium transition-transform transform hover:scale-110">Tests</Link>
          <Link href="/teacher/analysis" className="font-sans font-medium transition-transform transform hover:scale-110">Analysis</Link>
          <UserDropdown />
        </div>
      </nav>
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/" className="flex items-center text-gray-700 hover:text-[#e07a5f]">
            <ArrowLeft className="mr-2" size={20} />
            <span>Back to Dashboard</span>
          </Link>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{classData.name}</h1>
          {classData.description && (
            <p className="text-gray-600 mt-2">{classData.description}</p>
          )}
        </div>
        
        {/* Class Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Class Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Class Code */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Class Code
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={classData.classCode}
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
            
            {/* Subjects */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Subjects
              </label>
              <div className="flex flex-wrap gap-2">
                {classData.subjects?.length > 0 ? (
                  classData.subjects.map((subject, index) => (
                    <span 
                      key={index} 
                      className="bg-[#e07a5f] bg-opacity-20 text-[#d06a4f] px-3 py-1 rounded-full text-sm"
                    >
                      {subject}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">No subjects specified</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Students Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Students</h2>
            <div className="text-sm text-gray-500">
              {classData.students?.length || 0} enrolled | {classData.invitedEmails?.length || 0} invited
            </div>
          </div>
          
          {/* Add Student */}
          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e07a5f]"
                placeholder="Enter student email to invite"
              />
              <button
                type="button"
                onClick={handleAddStudent}
                className="bg-[#e07a5f] text-white px-4 py-2 rounded-md hover:bg-[#d06a4f] flex items-center"
              >
                <UserPlus size={18} className="mr-1" />
                Invite
              </button>
            </div>
          </div>
          
          {/* Students List */}
          <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-2">Enrolled Students</h3>
            <div className="border border-gray-200 rounded-md overflow-hidden">
              {classData.students?.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {classData.students.map((student, index) => (
                    <div key={index} className="flex justify-between items-center p-3 hover:bg-gray-50">
                      <div>
                        <p className="font-medium">{student.name || 'Student Name'}</p>
                        <p className="text-sm text-gray-500">{student.email || 'student@example.com'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No students enrolled yet
                </div>
              )}
            </div>
          </div>
          
          {/* Invited Students */}
          {classData.invitedEmails?.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Pending Invitations</h3>
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {classData.invitedEmails.map((email, index) => (
                    <div key={index} className="flex justify-between items-center p-3 hover:bg-gray-50">
                      <div>
                        <p className="text-sm">{email}</p>
                        <p className="text-xs text-gray-500">Invitation sent</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Class Materials Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Class Materials</h2>
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className={`bg-[#e07a5f] text-white px-4 py-2 rounded-md hover:bg-[#d06a4f] flex items-center ${
                uploadingFile ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={uploadingFile}
            >
              <Upload size={18} className="mr-1" />
              {uploadingFile ? 'Uploading...' : 'Upload'}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf"
              multiple
              className="hidden"
            />
          </div>
          
          {/* Materials List */}
          <div>
            {classData.materials?.length > 0 ? (
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {classData.materials.map((material, index) => (
                    <div key={index} className="flex justify-between items-center p-3 hover:bg-gray-50">
                      <div className="flex items-center">
                        <File size={18} className="text-red-500 mr-2" />
                        <div>
                          <p className="font-medium">{material.name || material.originalname}</p>
                          {material.size && (
                            <p className="text-xs text-gray-500">{formatFileSize(material.size)}</p>
                          )}
                        </div>
                      </div>
                      <a
                        href={material.url || `/api/classes/${classId}/materials/${material._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#e07a5f] hover:underline text-sm"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-md p-8 text-center">
                <p className="text-gray-500 mb-2">No materials uploaded yet</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="text-[#e07a5f] hover:underline"
                >
                  Upload your first class material
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}