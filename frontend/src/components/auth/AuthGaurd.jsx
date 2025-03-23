"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/utils/auth";

const AuthGuard = ({ children }) => {
  const router = useRouter();
  const [auth, setAuth] = useState(null); // null for loading state

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        console.log("AuthGuard: No token found, redirecting to /");
        router.push("/");
      } else {
        console.log("AuthGuard: Token found, user is authenticated!");
        setAuth(true);
      }
    };

    checkAuth();
  }, [router]);

  if (auth === null) return null; // Prevents flickering

  return auth ? children : null;
};

export default AuthGuard;
