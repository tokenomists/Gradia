// frontend/src/app/oauth-success/page.js
"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useError } from "@/contexts/ErrorContext";

const OAuthSuccess = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showError } = useError();
  
  useEffect(() => {
    // Get URL parameters
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    const token = searchParams.get('token');
    
    // Handle error case
    if (error && message) {
      // Redirect to home with error parameters
      router.push(`/?error=${error}&message=${message}`);
      return;
    }
    
    // Handle success case
    if (token) {
      // Just redirect to home page as we're using httpOnly cookies
      router.push('/');
    } else {
      // No token found, redirect to signin
      router.push('/signin');
    }
  }, [searchParams, router, showError]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-xl">Processing your login...</p>
    </div>
  );
};

export default OAuthSuccess;