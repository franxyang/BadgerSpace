
'use client';
import React from 'react';

function buildCalendar(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = [];
  const offset = (start.getDay() + 6) % 7; // Monday-first
  for (let i = 0; i < offset; i++) week.push(null);
  for (let d = 1; d <= end.getDate(); d++) {
    week.push(d);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length) { while (week.length < 7) week.push(null); weeks.push(week); }
  return weeks;
}

export default function Calendar() {
  const today = new Date();
  const monthName = today.toLocaleString('default', { month: 'short', year: 'numeric' });
  const weeks = buildCalendar(today);
  return (
    <div className="card">
      <div className="flex items-center justify-between p-3 border-b">
        <button className="text-gray-400 px-2" title="Prev" aria-label="Prev">‹</button>
        <div className="text-sm font-semibold">{monthName}</div>
        <button className="text-gray-400 px-2" title="Next" aria-label="Next">›</button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs text-gray-500 p-2">
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <div key={d} className="py-1">{d}</div>)}
        {weeks.flatMap((w, i) => w.map((n, j) => (
          <div key={`${i}-${j}`} className={`py-2 ${n === today.getDate() ? 'bg-red-50 rounded-md text-uw-dark font-semibold' : ''}`}>{n ?? ''}</div>
        )))}
      </div>
    </div>
  );
}
