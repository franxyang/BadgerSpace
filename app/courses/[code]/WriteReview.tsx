'use client'
import React, { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useToast } from '@/components/ToastProvider'

export default function WriteReview({ courseCode, terms }: { courseCode: string; terms?: string[] }) {
  const { data: session, status } = useSession()
  const [form, setForm] = useState({
    semester: '',
    instructorName: '',
    ta: '',
    content: '',
    ratingContent: 3,
    ratingTeaching: 3,
    ratingGrading: 3,
    ratingWorkload: 3,
  })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const { show } = useToast()

  if (status !== 'loading' && !session) {
    return (
      <div className="card p-4">
        <p className="text-sm">Sign in to write a review.</p>
        <button className="app-btn blue mt-2" onClick={() => signIn()}>Sign in</button>
      </div>
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseCode, ...form, ratingContent: Number(form.ratingContent), ratingTeaching: Number(form.ratingTeaching), ratingGrading: Number(form.ratingGrading), ratingWorkload: Number(form.ratingWorkload) })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to submit')
      show('Review submitted!', { type: 'success' })
      setMsg('')
      setTimeout(() => window.location.reload(), 800)
    } catch (err: any) {
      setMsg('')
      show(err.message || 'Error', { type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="card p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
      <label className="text-xs text-gray-600" htmlFor="semester">Semester</label>
      <input id="semester" list="term-options" aria-label="Semester" className="input" placeholder="e.g., 2025-Fall" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} required />
      {!!terms?.length && (
        <datalist id="term-options">
          {terms.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      )}
      <label className="text-xs text-gray-600" htmlFor="instructor">Instructor</label>
      <input id="instructor" aria-label="Instructor" className="input" placeholder="Optional" value={form.instructorName} onChange={(e) => setForm({ ...form, instructorName: e.target.value })} />
      <label className="text-xs text-gray-600" htmlFor="ta">TA</label>
      <input id="ta" aria-label="TA" className="input" placeholder="Optional" value={form.ta} onChange={(e) => setForm({ ...form, ta: e.target.value })} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <label className="text-xs text-gray-600">Content
          <input type="number" min={1} max={5} className="input" value={form.ratingContent} onChange={(e) => setForm({ ...form, ratingContent: Number(e.target.value) })} />
        </label>
        <label className="text-xs text-gray-600">Teaching
          <input type="number" min={1} max={5} className="input" value={form.ratingTeaching} onChange={(e) => setForm({ ...form, ratingTeaching: Number(e.target.value) })} />
        </label>
        <label className="text-xs text-gray-600">Grading
          <input type="number" min={1} max={5} className="input" value={form.ratingGrading} onChange={(e) => setForm({ ...form, ratingGrading: Number(e.target.value) })} />
        </label>
        <label className="text-xs text-gray-600">Workload
          <input type="number" min={1} max={5} className="input" value={form.ratingWorkload} onChange={(e) => setForm({ ...form, ratingWorkload: Number(e.target.value) })} />
        </label>
      </div>
      <label className="text-xs text-gray-600 md:col-span-2" htmlFor="content">Detailed comments</label>
      <textarea id="content" aria-label="Detailed comments" className="input md:col-span-2" placeholder="50–2000 chars" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={5} required />
      <div className="md:col-span-2 flex items-center gap-3">
        <button className="app-btn blue" disabled={busy} type="submit">Submit Review</button>
        {msg && <span className="text-sm text-gray-600">{msg}</span>}
      </div>
    </form>
  )
}
