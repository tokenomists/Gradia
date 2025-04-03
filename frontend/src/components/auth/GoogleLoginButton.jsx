import React from "react";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import { useDarkMode } from "@/contexts/DarkModeContext";

const PORT = process.env.PORT || 8000;

const GoogleLoginButton = ({ userType }) => {
  const { darkMode } = useDarkMode();

  const handleGoogleLogin = () => {
    window.location.href = `http://localhost:${PORT}/api/auth/${userType}/google`;
  };

  return (
    <motion.button
      type="button"
      onClick={handleGoogleLogin}
      className={`
        w-full border py-3 rounded-full font-medium flex items-center justify-center gap-2 shadow-sm transition-all relative overflow-hidden group
        ${darkMode 
          ? "border-gray-600 bg-[#1a1a1a] text-[#e8eaed] hover:bg-[#222] shadow-md"  // Dark Mode
          : "border-gray-300 bg-[#faf9f5] text-gray-700 hover:bg-gray-50 shadow-sm"} // Light Mode
      `}
      whileHover={{ 
        scale: 1.02,
        boxShadow: darkMode 
          ? '0 2px 10px rgba(255, 255, 255, 0.1)'  
          : '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}
      whileTap={{ scale: 0.98 }}
    >
      <FcGoogle size={20} />
      <span className="relative z-10">Continue with Google</span>
    </motion.button>

  );
};

export default GoogleLoginButton;
