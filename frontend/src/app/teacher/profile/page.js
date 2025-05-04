"use client"

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { isAuthenticated } from "../../../utils/auth.js";
import { UserDropdown } from '@/components/dashboard/UserDropdown.jsx';
import Link from 'next/link.js';
import { Calendar, Clock, Edit, Pencil } from 'lucide-react';
import axios from 'axios';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [classDetails, setClassDetails] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const userData = await isAuthenticated();
      setUser(userData);
      
      if (userData?.classes && userData.classes.length > 0) {
        const detailsPromises = userData.classes.map(async (classId) => {
          try {
            const response = await axios.get(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/classes/${classId}`,
              { withCredentials: true }
            );
            if (response.data.success) {
              return { 
                id: classId,
                details: response.data.class 
              };
            }
            return null;
          } catch (err) {
            console.error(`Error fetching details for class ${classId}:`, err);
            return null;
          }
        });

        const results = await Promise.all(detailsPromises);
        const detailsMap = {};
        results.forEach(result => {
          if (result) {
            detailsMap[result.id] = result.details;
          }
        });
        
        setClassDetails(detailsMap);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);
  
  const getProfileImage = () => {
    if (!user?.profilePicture) {
      return null;
    }
    if (user.profilePicture.startsWith('http') || user.profilePicture.startsWith('data:image')) {
      return user.profilePicture;
    }
    return null;
  };

  const getTeacherName = (classId) => {
    const details = classDetails[classId];
    if (details?.teacher) {
      return `${details.teacher.fname} ${details.teacher.lname}`;
    }
    return "Unknown";
  };

  const getMembershipDuration = () => {
    if (!user?.createdAt) return "New member";
    
    const createdDate = new Date(user.createdAt);
    const now = new Date();
    
    const diffInMs = now - createdDate;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''}`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffInDays / 365);
      return `${years} year${years !== 1 ? 's' : ''}`;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#fcf9ea] pb-10">
      <nav className="bg-[#d56c4e] text-white px-6 py-4 flex justify-between items-center">
        <motion.h1 
          initial={{ x: -3, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <Link href="/" style={{ fontFamily: "'Rage Italic', sans-serif" }} className="text-4xl font-bold text-black relative">
            Gradia
          </Link>
        </motion.h1>
        <div className="flex space-x-6 items-center">
          <motion.a whileHover={{ scale: 1.05 }} className="cursor-pointer font-sans font-medium" href="/practice">Practice</motion.a>
          <motion.a whileHover={{ scale: 1.05 }} className="cursor-pointer font-sans font-medium" href="/student/test/past-tests">Performance</motion.a>
          <UserDropdown />
        </div>
      </nav>

      {loading ? (
        <div className="flex flex-col justify-center items-center min-h-[90vh]">
          <div className="w-12 h-12 rounded-full border-4 border-[#f8e2d8] border-t-[#dd7a5f] animate-spin mb-4"></div>
          <p className="text-[#d56c4e] text-lg font-medium">Fetching user details...</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto mt-10">
          <div className="bg-white rounded-xl shadow-md relative">
            <button className="absolute top-4 right-4 bg-[#fcf9ea] p-2 rounded-full hover:bg-[#f8e2d8] transition-colors">
              <Edit className="w-5 h-5 text-[#d56c4e]" />
            </button>
            
            {/* Profile Section */}
            <div className="p-8">
              <div className="flex items-center">
                <div className="relative mr-8">
                  {getProfileImage() ? (
                    <img 
                      src={getProfileImage()} 
                      alt="Profile" 
                      className="w-40 h-40 rounded-full object-cover" 
                    />
                  ) : (
                    <div className="w-40 h-40 rounded-full bg-[#fcf9ea] flex items-center justify-center text-[42px] font-semibold text-[#d56c4e] uppercase">
                      <span>{user.fname[0]}{user.lname[0]}</span>
                    </div>
                  )}
                  <button className="absolute bottom-1 right-1 bg-white p-1.5 rounded-full shadow-md hover:bg-[#fcf9ea] transition-colors">
                    <Pencil className="w-4 h-4 text-[#d56c4e]" />
                  </button>
                </div>
                
                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <h2 className="text-3xl font-bold">{user.fname} {user.lname}</h2>
                    <span className="ml-3 bg-[#fceee8] text-[#d56c4e] text-xs px-3 py-1 rounded-full font-medium">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-6">{user.email}</p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-5 h-5 mr-2 text-[#d56c4e]" />
                      <span>Joined {user.createdAt ? formatDate(user.createdAt) : "Recently"}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-5 h-5 mr-2 text-[#d56c4e]" />
                      <span>Gradian for {getMembershipDuration()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 mx-8"></div>
            
            {/* Classes Section */}
            <div className="p-8">
              <h3 className="text-xl font-bold mb-4">Classes Taught</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.classes.map((classId) => {
                  const details = classDetails[classId];
                  return (
                    <div key={classId} className="bg-[#fcf9ea] rounded-lg p-4 hover:shadow-md">
                      <h4 className="text-lg font-medium mb-1">{details?.name ?? 'Class'}</h4>
                      <p className="text-gray-500 text-sm">
                      {details
                        ? `${details.students.length} student${details.students.length !== 1 ? 's' : ''}`
                        : 'Loading...'}
                      </p>
                    </div>
                  );
                })}
                
                {user.classes.length === 0 && (
                  <div className="col-span-2 text-center py-6 text-gray-500">
                    <p>No classes enrolled yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
