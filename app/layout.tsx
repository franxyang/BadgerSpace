
import './globals.css';
import React from 'react';
import Navbar from '@/components/Navbar';
import Providers from '@/components/Providers';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'MADSPACE — UW Madison Course Reviews',
  description: 'A community-driven course review site inspired by HKUST Space.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
