export const metadata = {
  title: 'Gradia',
  description: 'AI-powered grading platform designed for seamless test creation, automated evaluations, and in-depth performance analysis. Empower teachers with dynamic class management and insightful student assessments while providing students with real-time feedback and progress tracking.'
};

import './globals.css';
import ClientProviders from './ClientProviders.js';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <link rel="icon" href="/favicon.ico" sizes="any" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}