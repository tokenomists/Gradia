"use client";

import { ErrorProvider } from '@/contexts/ErrorContext';

export default function ClientProviders({ children }) {
  return <ErrorProvider>{children}</ErrorProvider>;
}