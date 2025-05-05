'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { UserDropdown } from '@/components/dashboard/UserDropdown.jsx';
import { Copy, Check, Trash, Upload, ArrowLeft, File, Loader2, X } from "lucide-react";
import axios from 'axios';
import { useError } from '@/contexts/ErrorContext';
import { useSuccess } from '@/contexts/SuccessContext';

export default function ClassPage() {
  const router = useRouter();
  const params = useParams();
  const { showError } = useError();
  const { showSuccess } = useSuccess();
  const classId = params.classId;
  
  const [classDetails, setClassDetails] = useState(null);
  const [classFiles, setClassFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingClass, setDeletingClass] = useState(false);
  const [deleteClassConfirmationText, setDeleteClassConfirmationText] = useState("");
  const [classDeleteConfirmation, setClassDeleteConfirmation] = useState(false);
  const [materialDeleteConfirmation, setMaterialDeleteConfirmation] = useState({ isOpen: false, fileName: null });
  const [materialDeleteStatus, setMaterialDeleteStatus] = useState({ isDeleting: false, fileName: null });
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
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
  
  const fetchClassMaterials = useCallback(async () => {
    if (!classId) return;

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
    } finally {
      setMaterialsLoading(false);
    }
  }, [classId]);
 
  useEffect(() => {
    fetchClassMaterials();
  }, [classId, fetchClassMaterials]);

  const handleClassDeleteConfirmation = () => {
    setClassDeleteConfirmation(true);
  }; 

  const handleMaterialDeleteConfirmation = (fileName) => {
    setMaterialDeleteConfirmation({ isOpen: true, fileName });
  }; 
  
  const handleDeleteFile = async (fileName) => {
    try {
      setMaterialDeleteStatus({ isDeleting: true, fileName });
      setMaterialDeleteConfirmation({ isOpen: false, fileName: null });
  
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
      setMaterialDeleteStatus({ isDeleting: false, fileName: null });
    }
  };

  const handleDeleteClass = async () => {
    try {
      setDeletingClass(true);
      setClassDeleteConfirmation(false);
  
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/classes/delete`,
        { classId: classId },
        { withCredentials: true },
        { validateStatus: (status) => status === 200 || status === 207 }
      );

      if (response.status === 200) {
        showSuccess("Class deletion successful");
        router.push("/");
      } else if (response.status === 207) {
        showError("Class deletion successful. Failed to delete GCS Bucket");
        router.push("/");
      }
      
    } catch (err) {
      console.error("Error deleting class:", err);
      showError("Unexpected Error. Class deletion failed");
    } finally {
      setDeletingClass(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const MAX_FILE_SIZE = 30 * 1024 * 1024;
  
    for (let file of files) {
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(true);
        showError(`File is too large. Maximum file size is 30MB.`);
        e.target.value = '';
        setTimeout(() => setUploadError(false), 5000);
        return;
      }
    }

    const formData = new FormData();
    for (let file of files) {
      formData.append('classFiles', file);
    }
    formData.append('bucketName', classId);

    try {
      setUploading(true);
      setUploadSuccess(false);
      setUploadError(false);

      const res = await axios.post( `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/classes/upload-class-material`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      if (res.data.success) {
        await fetchClassMaterials();
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 2000);
      } else {
        throw new Error(res.data.message || "Upload failed!");
      }

    } catch (err) {
      console.error(err);
      setUploadError(true);
      setTimeout(() => setUploadError(false), 5000);
    } finally {
      setUploading(false);
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
          <div className="bg-white rounded-lg shadow-sm p-6 border border-[#edead7]">
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
          <div className="bg-white rounded-lg shadow-sm p-6 border border-[#edead7]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Class Materials</h2>
              <label 
                htmlFor="file-upload" 
                className="cursor-pointer bg-[#e2c3ae] text-black px-4 py-2 rounded-md hover:bg-[#d1a78f] inline-block flex items-center gap-2"
              >
                {uploading ? (
                  <Loader2 size={18} className="animate-spin text-black" />
                ) : uploadSuccess ? (
                  <Check size={18} className="text-green-700" />
                ) : uploadError ? (
                  <X size={18} className="text-red-700" />
                ) : (
                  <Upload size={18} className="text-gray-800" />
                )}
                <span>
                  {uploading ? "Uploading..." : uploadSuccess ? "Uploaded!" : uploadError ? "Upload Failed!" : "Upload PDF"}
                </span>
              </label>
              <input 
                id="file-upload" 
                type="file" 
                accept="application/pdf" 
                className="hidden" 
                multiple
                onChange={handleFileUpload}
              />
            </div>
                   
            {materialsLoading ? (
              <div className="flex flex-col justify-center items-center h-48">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full border-4 border-[#f8e2d8] border-t-[#dd7a5f] animate-spin"></div>
                </div>
              </div>
            ) : classFiles.length === 0 ? (
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
                      onClick={() => handleMaterialDeleteConfirmation(fileName)}
                      disabled={materialDeleteStatus.isDeleting && materialDeleteStatus.fileName === fileName}
                      className="text-gray-500 hover:text-red-500"
                    >
                      {materialDeleteStatus.isDeleting && materialDeleteStatus.fileName === fileName ? (
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
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-[#edead7] mt-4">
          <h2 className="text-2xl font-bold mb-4">Danger Zone</h2>
          <div className="flex justify-between py-4 border-t border-gray-700">
            <div>
              <h3 className="font-bold text-red-600">Delete this class</h3>
              <p className="text-gray-600">
                Once you delete this class, all related data will be permanently removed.
              </p>
            </div>
            <button 
              onClick={handleClassDeleteConfirmation}
              className="bg-red-500 text-white font-medium py-1.5 px-4 rounded-md hover:bg-red-600 transition-colors w-36 text-sm flex justify-center items-center h-10"
            >
              {deletingClass ? <Loader2 size={16} className="animate-spin text-white" /> : "Delete this class"}
            </button>
          </div>
        </div>
      </div>
      
      {classDeleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this class? This action cannot be undone.
            </p>
            <p className="text-gray-600 mb-2 text-sm">
              Type <span className="font-medium text-red-600">{classDetails?.name.toUpperCase()}</span> to confirm:
            </p>
            <input
              type="text"
              value={deleteClassConfirmationText}
              onChange={(e) => setDeleteClassConfirmationText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-6 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setClassDeleteConfirmation(false);
                  setDeleteClassConfirmationText("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClass}
                disabled={deleteClassConfirmationText.toUpperCase() !== classDetails?.name.toUpperCase()}
                className={`px-4 py-2 text-white rounded-md transition-all duration-200 ${
                  deleteClassConfirmationText.toUpperCase() === classDetails?.name.toUpperCase()
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-red-300 cursor-not-allowed"
                }`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {materialDeleteConfirmation.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-medium text-red-600">{materialDeleteConfirmation.fileName}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setMaterialDeleteConfirmation({ isOpen: false, fileName: null })}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteFile(materialDeleteConfirmation.fileName)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
