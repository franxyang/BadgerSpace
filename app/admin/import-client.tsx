'use client'
import React, { useState } from 'react'
import { useToast } from '@/components/ToastProvider'

export default function AdminImportClient() {
  const [file, setFile] = useState<File | null>(null)
  const [term, setTerm] = useState('')
  const [busy, setBusy] = useState(false)
  const { show } = useToast()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !term) return
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('term', term)
      const res = await fetch('/api/admin/import/enroll', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Import failed')
      show(`Imported ${json.offerings} offerings, linked ${json.instructorsLinked} instructors`, { type: 'success' })
    } catch (e: any) {
      show(e.message || 'Error', { type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="card p-4 mt-6 flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Import Schedule (Enroll HAR/JSON)</h2>
      <p className="text-sm text-gray-600">Upload a <code>.har</code> captured from public.enroll.wisc.edu/search or a raw JSON response. Only course code, section, and instructors are used.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input type="text" placeholder="Term (e.g., 2025-Fall)" className="input" value={term} onChange={(e) => setTerm(e.target.value)} required />
        <input type="file" accept=".har,application/json" className="input" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button className="app-btn blue" type="submit" disabled={!file || !term || busy}>Import</button>
      </div>
    </form>
  )
}

