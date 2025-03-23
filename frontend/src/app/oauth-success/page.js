"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const OAuthSuccess = () => {
  // const router = useRouter();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");
    const role = searchParams.get("role");

    if (token) {
      // Redirect to dashboard after login
      router.push(`/`);
    } else {
      router.push("/signin");
    }
  }, [router, searchParams]);

  return <p>Logging you in...</p>;
};

export default OAuthSuccess;
