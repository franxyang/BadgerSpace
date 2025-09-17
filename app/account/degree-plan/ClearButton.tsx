'use client'
import React, { useState } from 'react'
import { useToast } from '@/components/ToastProvider'

export default function ClearButton() {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const { show } = useToast()
  async function onClick() {
    if (!confirm('Clear all imported courses? This cannot be undone.')) return
    setBusy(true)
    setMsg('Clearing...')
    try {
      const res = await fetch('/api/import/degree-plan/clear', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to clear')
      show(`Cleared ${json.deleted} entries`, { type: 'success' })
      setMsg('')
      setTimeout(() => window.location.reload(), 800)
    } catch (e: any) {
      setMsg('')
      show(e.message || 'Error', { type: 'error' })
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="flex items-center gap-2">
      <button type="button" className="app-btn gold" disabled={busy} onClick={onClick}>Clear History</button>
      {msg && <span className="text-sm text-gray-600">{msg}</span>}
    </div>
  )
}
