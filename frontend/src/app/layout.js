// frontend/src/app/layout.js
"use client";
import { ErrorProvider } from '@/contexts/ErrorContext';
import './globals.css'; // Your global CSS if you have one

// export const metadata = {
//   title: 'Your App Name',
//   description: 'Your app description',
// };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ErrorProvider>
          {children}
        </ErrorProvider>
      </body>
    </html>
  );
}