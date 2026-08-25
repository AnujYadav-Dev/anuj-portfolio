import React from 'react';
import type { Metadata } from 'next';
import { AdminAuthProvider } from '@/components/providers/AdminAuthProvider';
import { AdminLayoutShell } from '@/components/admin/layout/AdminLayoutShell';

export const metadata: Metadata = {
  title: {
    template: '%s | Admin CMS — Anuj Yadav',
    default: 'Admin Portal & CMS — Anuj Yadav',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </AdminAuthProvider>
  );
}
