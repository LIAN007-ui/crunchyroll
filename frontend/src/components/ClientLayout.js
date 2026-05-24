'use client';

import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NavigationProgress from '@/components/NavigationProgress';

export default function ClientLayout({ children }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <NavigationProgress />
        <Navbar />
        <main style={{ minHeight: '100vh', paddingTop: '72px', position: 'relative', zIndex: 1 }}>
          {children}
        </main>
        <Footer />
      </ToastProvider>
    </AuthProvider>
  );
}
