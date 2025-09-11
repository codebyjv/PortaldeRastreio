import React from 'react';
import { Footer } from './Footer';
import { AdminHeader } from './AdminHeader';
import { useIsAdminPage } from '../hooks/useIsAdminRoute';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isAdminPage = useIsAdminPage();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {isAdminPage && <AdminHeader />}
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};
