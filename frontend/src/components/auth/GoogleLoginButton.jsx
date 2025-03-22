import React from "react";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";

const GoogleLoginButton = ({ userType }) => {
  const handleGoogleLogin = () => {
    window.location.href = `http://localhost:5000/api/auth/${userType}/google`;
  };

  return (
    <motion.button
      type="button"
      onClick={handleGoogleLogin}
      className="w-full border border-gray-300 bg-[#faf9f5] text-gray-700 py-3 rounded-full font-medium flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50 transition-all relative overflow-hidden group"
      whileHover={{ 
        scale: 1.02,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}
      whileTap={{ scale: 0.98 }}
    >
      <FcGoogle size={20} className="text-[#f5a061]" />
      <span className="relative z-10">Continue with Google</span>
    </motion.button>
  );
};

export default GoogleLoginButton;
