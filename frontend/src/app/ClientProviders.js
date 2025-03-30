"use client";

import { ErrorProvider } from '@/contexts/ErrorContext';
import { SuccessProvider } from '@/contexts/SuccessContext';
import { DarkModeProvider } from '@/contexts/DarkModeContext';

export default function ClientProviders({ children }) {
  return <ErrorProvider><SuccessProvider><DarkModeProvider>{children}</DarkModeProvider></SuccessProvider></ErrorProvider>;
}