"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { isAuthenticated } from "../../../utils/auth.js";
import { UserDropdown } from '@/components/dashboard/UserDropdown.jsx';
import Link from 'next/link.js';
import { Calendar, Clock, Edit, Pencil, Trash2 } from 'lucide-react';
import instance from '@/utils/axios.js';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [classDetails, setClassDetails] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    fname: '',
    lname: '',
    profilePicture: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const userData = await isAuthenticated();
      setUser(userData);

      if (userData?.classes?.length > 0) {
        const detailsPromises = userData.classes.map(async (classItem) => {
          try {
            const response = await instance.get(
              `/api/classes/${classItem._id}`,
              { withCredentials: true }
            );
            if (response.data.success) {
              return {
                id: classItem._id,
                details: response.data.class
              };
            }
            return null;
          } catch (err) {
            console.error(`Error fetching class ${classItem._id}:`, err);
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
    if (!user?.profilePicture) return null;
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
    if (diffInDays < 30) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''}`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} month${diffInDays / 30 !== 1 ? 's' : ''}`;
    return `${Math.floor(diffInDays / 365)} year${diffInDays / 365 !== 1 ? 's' : ''}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDelete = async () => {
    try {
      await instance.delete(`/api/auth/student/delete`, {
        withCredentials: true,
      });
      alert("Profile deleted. Logging out...");
      window.location.href = '/';
    } catch (error) {
      alert("Error deleting profile");
      console.error("Delete error:", error);
    }
  };

  const handleEditClick = () => {
    setEditForm({
      fname: user.fname,
      lname: user.lname,
      profilePicture: user.profilePicture || ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await instance.put(`/api/auth/student/update-profile`, editForm, {
        withCredentials: true
      });
      if (res.data.success) {
        setUser({ ...user, ...editForm });
        setShowEditModal(false);
        alert("Profile updated!");
      }
    } catch (err) {
      console.error("Profile update failed:", err);
      alert("Failed to update profile.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9ea] pb-10">
      <nav className="bg-[#d56c4e] text-white px-6 py-4 flex justify-between items-center">
        <motion.h1 
          initial={{ x: -3, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <Link href="/" className="text-4xl font-bold text-black" style={{ fontFamily: "'Rage Italic', sans-serif" }}>
            Gradia
          </Link>
        </motion.h1>
        <div className="flex space-x-6 items-center">
          <motion.a whileHover={{ scale: 1.05 }} className="cursor-pointer font-medium" href="/practice">Practice</motion.a>
          <motion.a whileHover={{ scale: 1.05 }} className="cursor-pointer font-medium" href="/student/test/past-tests">Performance</motion.a>
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
            <div className="absolute top-4 right-4 flex space-x-2">
              <button onClick={handleEditClick} className="bg-[#fcf9ea] p-2 rounded-full hover:bg-[#f8e2d8]">
                <Edit className="w-5 h-5 text-[#d56c4e]" />
              </button>
              <button onClick={() => setShowDeleteConfirm(true)} className="bg-[#fcf9ea] p-2 rounded-full hover:bg-red-200">
                <Trash2 className="w-5 h-5 text-red-500" />
              </button>
            </div>

            {/* Profile */}
            <div className="p-8">
              <div className="flex items-center">
                <div className="relative mr-8">
                  {getProfileImage() ? (
                    <img src={getProfileImage()} alt="Profile" className="w-40 h-40 rounded-full object-cover" />
                  ) : (
                    <div className="w-40 h-40 rounded-full bg-[#fcf9ea] flex items-center justify-center text-[42px] font-semibold text-[#d56c4e] uppercase">
                      <span>{user.fname[0]}{user.lname[0]}</span>
                    </div>
                  )}
                </div>
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

            {/* Joined Classes */}
            <div className="p-8">
              <h3 className="text-xl font-bold mb-4">Joined Classes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.classes.map((classItem, index) => (
                  <div key={index} className="bg-[#fcf9ea] rounded-lg p-4 hover:shadow-md">
                    <h4 className="text-lg font-medium mb-1">{classItem.name}</h4>
                    <p className="text-gray-500 text-sm">
                      <span className="italic">Taught by </span>
                      <span className="font-semibold">{getTeacherName(classItem._id)}</span>
                    </p>
                  </div>
                ))}
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

      {/* 🔒 Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold text-red-600 mb-3">Confirm Deletion</h2>
            <p className="text-sm text-gray-700 mb-6">Are you sure you want to delete your profile? This action cannot be undone.</p>
            <div className="flex justify-center space-x-4">
              <button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md">
                Yes, Delete
              </button>
              <button onClick={() => setShowDeleteConfirm(false)} className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✏️ Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <form onSubmit={handleEditSubmit} className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
            <label className="block mb-3 text-sm">
              First Name:
              <input
                type="text"
                value={editForm.fname}
                onChange={(e) => setEditForm({ ...editForm, fname: e.target.value })}
                className="w-full mt-1 border rounded px-3 py-1"
              />
            </label>
            <label className="block mb-3 text-sm">
              Last Name:
              <input
                type="text"
                value={editForm.lname}
                onChange={(e) => setEditForm({ ...editForm, lname: e.target.value })}
                className="w-full mt-1 border rounded px-3 py-1"
              />
            </label>
            <label className="block mb-4 text-sm">
              Profile Picture URL:
              <input
                type="text"
                value={editForm.profilePicture}
                onChange={(e) => setEditForm({ ...editForm, profilePicture: e.target.value })}
                className="w-full mt-1 border rounded px-3 py-1"
              />
            </label>
            <div className="flex justify-end space-x-3">
              <button type="submit" className="bg-[#d56c4e] text-white px-4 py-2 rounded-md">Save</button>
              <button onClick={() => setShowEditModal(false)} type="button" className="bg-gray-200 px-4 py-2 rounded-md">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
