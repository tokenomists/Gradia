import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Gradia | AI-Powered Teacher Assistant Platform',
  description: 'Revolutionize grading with AI-powered feedback',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white`}>{children}</body>
    </html>
  );
}