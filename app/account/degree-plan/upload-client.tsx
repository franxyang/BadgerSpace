'use client'
import React, { useState } from 'react'
import { useToast } from '@/components/ToastProvider'

export default function DegreePlanClient() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const { show } = useToast()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setBusy(true)
    setStatus('Uploading...')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/import/degree-plan', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Upload failed')
      show(`Imported ${json.imported} entries`, { type: 'success' })
      setStatus('')
      setTimeout(() => window.location.reload(), 800)
    } catch (err: any) {
      setStatus('')
      show(err.message || 'Error', { type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-3">
      <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="input" />
      <button className="app-btn blue" disabled={!file || busy} type="submit">Upload PDF</button>
      {status && <span className="text-sm text-gray-600">{status}</span>}
    </form>
  )
}
