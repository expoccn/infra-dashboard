import type { ReactNode } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import type { DashboardPayload } from '@/types/dashboard';

export function AppShell({
  title,
  description,
  data,
  children,
}: {
  title: string;
  description?: string;
  data: DashboardPayload;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="min-w-0 flex-1 space-y-4 p-5 xl:p-6">
        <Header title={title} description={description} data={data} />
        {children}
      </main>
    </div>
  );
}
