'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { UserDropdown } from '@/components/dashboard/UserDropdown.jsx';
import { Copy, Check, Download, Loader2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useError } from '@/contexts/ErrorContext';

export default function StudentClassPage() {
  const router = useRouter();
  const params = useParams();
  const { showError } = useError();
  const classId = params.classId;

  const [classDetails, setClassDetails] = useState(null);
  const [classFiles, setClassFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState(null);

  useEffect(() => {
    if (!classId) return;
    const fetchDetails = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/classes/${classId}`,
          { withCredentials: true }
        );
        if (response.data.success) {
          setClassDetails(response.data.class);
        } else {
          setError('Failed to load class details');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [classId]);

  const fetchMaterials = useCallback(async () => {
    if (!classId) return;
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/classes/get-class-materials`,
        { classId },
        { withCredentials: true }
      );
      if (response.data.success) {
        const files = Array.isArray(response.data.files.pdf_files)
          ? response.data.files.pdf_files
          : [];
        setClassFiles(files);
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
    }
  }, [classId]);

  useEffect(() => {
    fetchMaterials();
  }, [classId, fetchMaterials]);

  const handleDownload = async (fileName) => {
    if (!classId || !fileName) {
      return;
    }
    setDownloadStatus(fileName);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/classes/download-class-material`,
        { classId, fileName },
        { 
          withCredentials: true,
          responseType: 'blob' 
        }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      showError('Could not download file. Please try again.');
    } finally {
      setDownloadStatus(null);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classDetails?.classCode || '');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcf9ea] flex flex-col">
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
          <UserDropdown />
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
      <div className="min-h-screen bg-[#fcf9ea] flex flex-col">
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
          <UserDropdown />
        </nav>
        <div className="flex-grow flex flex-col items-center justify-center text-gray-700">
          <p className="text-xl mb-4">Oops, something went wrong:</p>
          <p className="mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-[#d56c4e] text-white rounded-md hover:bg-[#c55636] transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
        <UserDropdown />
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="flex items-center text-[#d56c4e] hover:underline mb-6">
            <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
        </Link>

        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">
              {classDetails?.name}
            </h1>
            <p className="text-sm text-gray-500">
              Taught by <span className="font-medium">{classDetails?.teacher?.fname + " " + classDetails?.teacher?.lname}</span>
            </p>
          </div>
          <div className="mt-4 md:mt-0 inline-flex items-center bg-[#e2c3ae] border border-gray-200 rounded-lg overflow-hidden">
            <span className="font-mono text-lg px-4 py-2 text-gray-800">
              {classDetails?.classCode}
            </span>
            <button
              onClick={handleCopyCode}
              className={`p-2 border-l border-gray-200 transition-colors ${isCopied ? 'text-green-800' : 'text-gray-500'}`}
            >
              {isCopied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-[#edead7]">
          <h2 className="text-2xl font-bold mb-4">Class Materials</h2>
          {classFiles.length === 0 ? (
            <p className="text-gray-500">No materials available.</p>
          ) : (
            <ul className="space-y-3">
              {classFiles.map((file, idx) => (
                <li key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <span className="truncate max-w-xs">{file}</span>
                  <button
                    onClick={() => handleDownload(file)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    {downloadStatus === file
                      ? <Loader2 className="animate-spin" size={18} />
                      : <Download size={18} />
                    }
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
