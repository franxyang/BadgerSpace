'use client'
import React, { useState } from 'react'
import { useToast } from '@/components/ToastProvider'

type ReportItem = {
  id: string
  status: 'OPEN' | 'RESOLVED' | 'REJECTED'
  reason: string
  createdAt: string
  review: { id: string; semester: string; content: string; hidden: boolean; courseCode: string; courseName: string }
}

export default function AdminReportsClient({ reports }: { reports: ReportItem[] }) {
  const [items, setItems] = useState(reports)
  const { show } = useToast()
  async function act(id: string, action: string, note?: string) {
    const res = await fetch(`/api/admin/reports/${id}/action`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, note }) })
    if (res.ok) {
      setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status: action === 'reject' ? 'REJECTED' : 'RESOLVED', review: { ...r.review, hidden: action === 'hide' ? true : action === 'restore' ? false : r.review.hidden } } : r)))
      show('Action applied', { type: 'success' })
    } else {
      show('Failed to apply action', { type: 'error' })
    }
  }
  return (
    <div className="card p-4 mt-4 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500">
            <th className="py-2">Course</th>
            <th className="py-2">Semester</th>
            <th className="py-2">Reason</th>
            <th className="py-2">Status</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id} className="border-t align-top">
              <td className="py-2 whitespace-nowrap">{r.review.courseCode} — {r.review.courseName}</td>
              <td className="py-2">{r.review.semester}</td>
              <td className="py-2 max-w-md">{r.reason}</td>
              <td className="py-2">{r.status}{r.review.hidden ? ' (hidden)' : ''}</td>
              <td className="py-2">
                <div className="flex flex-wrap gap-2">
                  <button className="app-btn gray" onClick={() => act(r.id, 'resolve')}>Resolve</button>
                  <button className="app-btn gray" onClick={() => act(r.id, 'reject')}>Reject</button>
                  {!r.review.hidden ? (
                    <button className="app-btn gold" onClick={() => act(r.id, 'hide')}>Hide</button>
                  ) : (
                    <button className="app-btn blue" onClick={() => act(r.id, 'restore')}>Restore</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
