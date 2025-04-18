import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Settings, LogOut } from "lucide-react";
import { logout, isAuthenticated } from "../../utils/auth.js";
import { useRouter } from "next/navigation";
import Image from "next/image.js";

export const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await isAuthenticated();
      // console.log("User Data:", userData);
      setUser(userData);
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await logout();
    localStorage.setItem("notification", JSON.stringify({ type: "success", message: "Successfully logged out!" }));
    router.push("/");
    // router.refresh();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const dropdownVariants = {
    hidden: { opacity: 0, y: -5, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
    exit: {
      opacity: 0,
      y: -5,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  const menuItems = [
    { icon: <User size={16} />, label: "Profile", action: () => console.log("Profile clicked") },
    { icon: <LogOut size={16} />, label: "Logout", action: handleLogout },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.div
        whileHover={{ scale: 1.1 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white rounded-full w-10 h-10 flex items-center justify-center cursor-pointer overflow-hidden"
      >
        {user?.profilePic ? (
          <Image src={user.profilePic} width={20} height={20} alt="User Profile" className="w-full h-full rounded-full" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[15px] font-semibold text-[#d56c4e] uppercase">
            <span>{user?.fname?.[0]}{user?.lname?.[0]}</span>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-50"
          >
            <div className="py-1">
              {menuItems.map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{
                    backgroundColor: "#f8f0e6",
                    transition: { duration: 0.2 },
                  }}
                  className="px-4 py-3 flex items-center cursor-pointer text-gray-700 hover:text-[#d56c4e] transition-colors duration-200"
                  onClick={item.action}
                >
                  <span className="mr-3 text-gray-500">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
