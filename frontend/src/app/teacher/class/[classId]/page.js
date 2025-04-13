'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { UserDropdown } from '@/components/dashboard/UserDropdown.jsx';
import { Copy, Check, Trash, Upload, ArrowLeft, File } from "lucide-react";
import axios from 'axios';

export default function ClassPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.classId;
  
  const [classDetails, setClassDetails] = useState(null);
  const [classFiles, setClassFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState({ isDeleting: false, fileName: null });
  const [isCopied, setIsCopied] = useState(false);
  
  // Fetch class details
  useEffect(() => {
    if (!classId) return;
    
    const fetchClassDetails = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/classes/${classId}`,
          {
            withCredentials: true,
          }
        );
        if (response.data.success) {
          setClassDetails(response.data.class);
        } else {
          setError('Failed to load class details');
        }
      } catch (err) {
        setError(`Error: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClassDetails();
  }, [classId]);
  
  // Fetch class materials
  useEffect(() => {
    if (!classId) return;

    const fetchClassMaterials = async () => {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/classes/get-class-materials`,
          { classId },
          { withCredentials: true }
        );
        if (response.data.success) {
          const files = Array.isArray(response.data.files.pdf_files) ? response.data.files.pdf_files : [];
          setClassFiles(files);
        } else {
          console.error('Backend responded with failure:', response.data.message);
        }
      } catch (err) {
        console.error('Error fetching class materials:', err);
      }
    };

    fetchClassMaterials();
  }, [classId]);
  
  const handleDeleteFile = async (fileName) => {
    try {
      setDeleteStatus({ isDeleting: true, fileName });
  
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/classes/delete-class-material`,
        { classId: classId, fileName: fileName },
        { withCredentials: true }
      );
  
      if (response.data.success) {
        setClassFiles(prevFiles => prevFiles.filter(file => file !== fileName));
      } else {
        alert('Failed to delete file. Please try again.');
      }
      
    } catch (err) {
      console.error('Error deleting file:', err);
      alert('Failed to delete file. Please try again.');
    } finally {
      setDeleteStatus({ isDeleting: false, fileName: null });
    }
  };
  
  const handleClassCodeCopy = () => {
    navigator.clipboard.writeText(classDetails?.classCode || 'GRD-XXXXXX');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  if (loading) {
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
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className="font-sans cursor-pointer font-medium"
            >
              <Link href="/teacher/tests">Tests</Link>
            </motion.span>
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className="font-sans cursor-pointer font-medium"
            >
              <Link href="/teacher/detailed-analysis">Analysis</Link>
            </motion.span>
            <UserDropdown />
          </div>
        </nav>
        
        <div className="flex flex-col justify-center items-center h-screen">
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-4 border-[#f8e2d8] border-t-[#dd7a5f] animate-spin"></div>
          </div>
          <p className="mt-4 text-[#dd7a5f] text-lg">Loading class details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
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
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className="font-sans cursor-pointer font-medium"
            >
              <Link href="/teacher/tests">Tests</Link>
            </motion.span>
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className="font-sans cursor-pointer font-medium"
            >
              <Link href="/teacher/detailed-analysis">Analysis</Link>
            </motion.span>
            <UserDropdown />
          </div>
        </nav>
        
        <div className="min-h-screen flex flex-col justify-center items-center text-center px-4" style={{ backgroundColor: "#fffde7" }}>
          <div className="text-2xl font-semibold mb-3" style={{ color: "#3d405b" }}>
            Oops, something went wrong.
          </div>

          <p className="text-base mb-6 max-w-md" style={{ color: "#3d405b" }}>
            {error || "We're having trouble loading this page right now. Please try again later or head back to the dashboard."}
          </p>

          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 text-sm font-medium rounded-md text-white shadow focus:outline-none transition-all"
            style={{ 
              backgroundColor: "#d56c4e",
              transition: "background-color 0.2s ease-in-out"
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#c55636"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#d56c4e"}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
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
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="font-sans cursor-pointer font-medium"
          >
            <Link href="/teacher/tests">Tests</Link>
          </motion.span>
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="font-sans cursor-pointer font-medium"
          >
            <Link href="/teacher/detailed-analysis">Analysis</Link>
          </motion.span>
          <UserDropdown />
        </div>
      </nav>
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back to Dashboard Link */}
        <div className="mb-6">
          <Link href="/" className="flex items-center text-[#d56c4e] hover:underline">
            <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
          </Link>
        </div>
        
        {/* Class Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">{classDetails?.name || 'Class Name'}</h1>
            <p className="text-gray-700 mb-2">{classDetails?.description || 'Class description'}</p>
          </div>
          <div className="relative">
            <div className="flex items-center bg-[#e2c3ae] border border-black-200 rounded-lg overflow-hidden min-w-fit">
              <span className="font-mono text-lg py-2 px-4 text-gray-800">{classDetails?.classCode || 'GRD-V5WLCS'}</span>
              <button
                onClick={handleClassCodeCopy}
                className={`p-2 border-l border-gray-200 hover:bg-[#e2c3ae]-50 transition-colors ${isCopied ? 'text-green-800' : 'text-gray-500'}`}
                aria-label="Copy class code"
              >
                {isCopied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Students Section */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-[#edead7]">
            <h2 className="text-2xl font-bold mb-4">Students</h2>
            
            {(!classDetails?.students || classDetails.students.length === 0) ? (
              <div className="flex justify-center items-center h-48">
                <p className="text-gray-500">No students joined yet.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {classDetails.students.map(student => (
                  <div key={student._id} className="flex items-center gap-3 p-3 border-b border-gray-100">
                    <div className="h-10 w-10 rounded-full bg-[#d5b69d] flex items-center justify-center text-white">
                      {student.profilePicture ? (
                        <Image src={student.profilePicture} alt={student.fname} className="rounded-full object-cover" width={40} height={40}/>
                      ) : (
                        <span>{student.fname[0]}{student.lname[0]}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{student.fname} {student.lname}</h3>
                      <p className="text-sm text-gray-500">{student.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Class Materials Section */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-[#edead7]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Class Materials</h2>
              <label 
                htmlFor="file-upload" 
                className="cursor-pointer bg-[#e2c3ae] text-black px-4 py-2 rounded-md hover:bg-[#d1a78f] inline-block flex items-center gap-2"
              >
                <Upload size={18} className="text-gray-800" />
                Upload PDF
              </label>
              <input id="file-upload" type="file" className="hidden" />
            </div>
            
            {classFiles.length === 0 ? (
              <div className="flex justify-center items-center h-48">
                <p className="text-gray-500">No materials uploaded yet.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {classFiles.map((fileName, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-3">
                      <File size={18} />
                      <span className="truncate max-w-xs">{fileName}</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteFile(fileName)}
                      disabled={deleteStatus.isDeleting && deleteStatus.fileName === fileName}
                      className="text-gray-500 hover:text-red-500"
                    >
                      {deleteStatus.isDeleting && deleteStatus.fileName === fileName ? (
                        <div className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                      ) : (
                        <Trash size={18} className="text-xl" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}