
'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchBar() {
  const [q, setQ] = useState('');
  const router = useRouter();
  return (
    <form onSubmit={(e)=>{e.preventDefault(); router.push(`/reviews?q=${encodeURIComponent(q)}`);}} className="relative">
      <input
        value={q}
        onChange={(e)=>setQ(e.target.value)}
        placeholder="Search for courses..."
        className="w-full rounded-xl border-gray-300 pe-10"
        type="search"
      />
      <button type="submit" className="absolute right-1 top-1.5 px-2 py-1 rounded-lg bg-gray-900 text-white text-xs">Search</button>
    </form>
  );
}
