'use client'
import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'

type Toast = {
  id: string
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
}

type ToastCtx = {
  show: (message: string, opts?: { type?: Toast['type']; duration?: number }) => void
}

const Ctx = createContext<ToastCtx | null>(null)

export function useToast() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((message: string, opts?: { type?: Toast['type']; duration?: number }) => {
    const t: Toast = { id: Math.random().toString(36).slice(2), message, type: opts?.type || 'info', duration: opts?.duration || 3000 }
    setToasts((prev) => [...prev, t])
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== t.id))
    }, t.duration)
  }, [])

  const value = useMemo(() => ({ show }), [show])

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className={`rounded-xl shadow-lg px-3 py-2 text-sm text-white ${
            t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-gray-900'
          }`}>
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

