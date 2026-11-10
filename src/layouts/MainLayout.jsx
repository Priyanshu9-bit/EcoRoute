import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MainLayout({ children, fullWidth = false, noFooter = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-green-100 selection:text-green-900">
      <Navbar />
      <main className={`flex-1 w-full ${fullWidth ? 'p-0 max-w-none' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5'}`}>
        {children}
      </main>
      {!noFooter && <Footer />}
    </div>
  );
}

