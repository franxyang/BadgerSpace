
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-xl text-sm font-medium ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
    >
      {children}
    </Link>
  );
};

export default function Navbar() {
  const { data: session, status } = useSession();
  return (
    <header className="border-b bg-white">
      <div className="container flex items-center justify-between h-16 gap-4">
        <Link href="/" className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect width="24" height="24" rx="6" fill="#c5050c" />
            <path d="M7 16l5-8 5 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-bold tracking-tight text-lg">MADSPACE</span>
          <span className="text-gray-400 text-sm">| UW 社群</span>
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/reviews">Course Review</NavLink>
          <NavLink href="/account">Account</NavLink>
          {status === 'loading' ? null : session ? (
            <button
              onClick={() => signOut()}
              className="px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              Sign out
            </button>
          ) : (
            <button
              onClick={() => signIn()}
              className="px-3 py-2 rounded-xl text-sm font-medium bg-gray-900 text-white hover:bg-black"
            >
              Sign in
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
