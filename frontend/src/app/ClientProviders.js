"use client";

import { ErrorProvider } from '@/contexts/ErrorContext';
import { SuccessProvider } from '@/contexts/SuccessContext';

export default function ClientProviders({ children }) {
  return <ErrorProvider><SuccessProvider>{children}</SuccessProvider></ErrorProvider>;
}