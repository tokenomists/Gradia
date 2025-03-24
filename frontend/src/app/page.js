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

  if (auth === null) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  return auth ? (role === 'student' ? <StudentDashboard /> : <TeacherDashboard />) : <LandingPage />;
};

export default Home;