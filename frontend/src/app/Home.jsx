'use client';

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isAuthenticated } from "@/utils/auth.js";
import LandingPage from "@/components/pages/LandingPage";
import StudentDashboard from "@/components/pages/StudentDashboard";
import TeacherDashboard from "@/components/pages/TeacherDashboard";
import { useError } from "@/contexts/ErrorContext";
import { useSuccess } from "@/contexts/SuccessContext";

const Home = () => {
  const [auth, setAuth] = useState(null);
  const [role, setRole] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showError } = useError();
  const { showSuccess } = useSuccess();

  useEffect(() => {
    const notification = localStorage.getItem("notification");

    if (notification) {
      const { type, message } = JSON.parse(notification);
      if (type === "error") showError(message);
      else if (type === "success") showSuccess(message);
      localStorage.removeItem("notification");
    }
  }, [showError, showSuccess]);

  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    if (error && message) {
      showError(decodeURIComponent(message));
      window.history.replaceState({}, '', '/');
    }

    const success = searchParams.get('success');
    const successMessage = searchParams.get('message');
    if (success && successMessage) {
      showSuccess(decodeURIComponent(successMessage));
      window.history.replaceState({}, '', '/');
    }
  }, [searchParams, showError, showSuccess]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { isLoggedIn, role } = await isAuthenticated();
        setAuth(isLoggedIn);
        setRole(role);
      } catch (error) {
        console.error("Auth check failed:", error);
        setAuth(false);
      }
    };
    checkAuth();
  }, []);

  if (auth === null) return (
    <div className="flex justify-center items-center min-h-screen bg-[#edead7]">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative w-14 h-14 opacity-100">
          <div className="absolute inset-0 rounded-full border-t-4 border-r-4 border-[#d56c4e] animate-spin" />
          <div className="absolute inset-1 rounded-full bg-[#edead7]" />
        </div>
        <div className="flex flex-col items-center space-y-2">
          <p className="text-xl font-medium tracking-wide text-gray-800">
            Loading a revolution...
          </p>
          <p className="text-md text-gray-600">Please wait</p>
        </div>
      </div>
    </div>
  );

  return auth ? (role === 'student' ? <StudentDashboard /> : <TeacherDashboard />) : <LandingPage />;
};

export default Home;
