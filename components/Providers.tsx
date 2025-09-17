'use client'
import { SessionProvider } from 'next-auth/react'
import React from 'react'
import ToastProvider from './ToastProvider'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  )
}
