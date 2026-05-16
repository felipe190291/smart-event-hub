import { ReactNode } from 'react';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-500/30 transition-colors duration-300">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </main>
      <footer className="border-t border-slate-200 dark:border-slate-900 py-8 text-center text-slate-500 dark:text-slate-400">
        <p>© 2026 Mis Eventos S.A.</p>
      </footer>
    </div>
  );
};
