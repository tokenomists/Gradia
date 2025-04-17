'use client';

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useError } from "@/contexts/ErrorContext";


const OAuthSuccess = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showError } = useError();

  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    const token = searchParams.get('token');

    if (error && message) {
      window.location.href = `/?error=${error}&message=${message}`;
      return;
    }

    if (token) {
      window.location.href = `/`;
    } else {
      window.location.href = '/signin';
    }
  }, [searchParams, router, showError]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#edead7]">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative w-14 h-14 opacity-100">
          <div className="absolute inset-0 rounded-full border-t-4 border-r-4 border-[#d56c4e] animate-spin" />
          <div className="absolute inset-1 rounded-full bg-[#edead7]" />
        </div>
        <p className="text-xl font-medium tracking-wide text-gray-800">
          Processing your login...
        </p>
      </div>
    </div>
  );
};

export default OAuthSuccess;
