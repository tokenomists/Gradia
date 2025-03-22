import { useEffect } from "react";
import { useRouter } from "next/router";

const OAuthSuccess = () => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const role = urlParams.get("role");

      if (token) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("userRole", role);
        router.push("/role/dashboard"); // ✅ Redirect to dashboard
      } else {
        router.push("/login");
      }
    }
  }, [router]);

  return <p>Logging you in...</p>;
};

export default OAuthSuccess;
