"use client";

import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  const goBack = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center px-4" style={{ backgroundColor: "#fffde7" }}>
      <div className="text-6xl font-extrabold mb-6" style={{ color: "#3d405b" }}>
        404
      </div>

      <h1 className="text-3xl font-bold mb-4" style={{ color: "#3d405b" }}>
        Well, this is awkward...
      </h1>

      <p className="text-lg mb-6" style={{ color: "#3d405b" }}>
        Either this page isn&apos;t ready yet, or you clicked something weird.
        <br />
        Hard to say.
      </p>

      <button 
        onClick={goBack}
        className="px-5 py-2 text-base font-medium rounded-lg text-white shadow transition-all focus:outline-none"
        style={{ 
          backgroundColor: "#e07a5f",
          transition: "background-color 0.2s ease-in-out"
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#d0644f"}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = "#e07a5f"}
      >
        Take me back
      </button>
    </div>
  );
}
