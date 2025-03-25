// frontend/src/app/page.js
"use client";
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

      // Display the appropriate message
      if (type === "error") {
        showError(message);
      } else if (type === "success") {
        showSuccess(message);
      }

      // Clear the notification from storage
      localStorage.removeItem("notification");
    }
  }, [showError, showSuccess]);



  useEffect(() => {
    // Check for error parameters in the URL
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    
    if (error && message) {
      // Show the error message
      showError(decodeURIComponent(message));
      
      // Remove the error parameters from the URL by redirecting
      window.history.replaceState({}, '', '/');
    }

    // Check for success parameters in the URL
    const success = searchParams.get('success');
    const successMessage = searchParams.get('message');

    if (success && successMessage) {
      // Show the success message
      showSuccess(decodeURIComponent(successMessage));
      
      // Remove the success parameters from the URL by redirecting
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
    <div
      className="flex justify-center items-center min-h-screen"
      style={{ backgroundColor: "#edead7" }}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin w-12 h-12 border-t-4 border-gray-800 rounded-full"></div>
        <p className="text-xl text-gray-800 font-semibold">Loading...</p>
      </div>
    </div>
  );

  return auth ? (role === 'student' ? <StudentDashboard /> : <TeacherDashboard />) : <LandingPage />;
};

export default Home;