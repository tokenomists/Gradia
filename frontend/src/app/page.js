"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/utils/auth.js";
import LandingPage from "@/components/pages/LandingPage";
import StudentDashboard from "@/components/pages/StudentDashboard";
import TeacherDashboard from "@/components/pages/TeacherDashboard";

const Home = () => {
  const [auth, setAuth] = useState(null);
  const [role, setRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { isLoggedIn, role } = await isAuthenticated();
      setAuth(isLoggedIn);
      setRole(role);
      if (isLoggedIn) {
        console.log("User is authenticated!");
      } else {
        console.log("User is not authenticated!");
      }
    };
    checkAuth();
  }, []);

  if (auth === null) return null; // Prevent flickering

  return auth ? (role === 'student' ? <StudentDashboard /> : <TeacherDashboard />) : <LandingPage />;
};

export default Home;
