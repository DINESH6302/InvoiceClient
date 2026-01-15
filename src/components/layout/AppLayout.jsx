'use client';

import { usePathname } from 'next/navigation';
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppLayout({ children }) {
  const pathname = usePathname();
  // Check if the current page is the template builder (create or edit) or new org setup
  const isFullScreen = pathname === '/templates/create' || pathname.startsWith('/templates/edit/') || pathname === '/organizations/new';

  if (isFullScreen) {
      return <main className="h-screen w-full bg-slate-50 overflow-hidden text-slate-900">{children}</main>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-56 h-screen">
            <Header />
            <main className="mt-16 bg-slate-50 flex-1 overflow-hidden relative">
                {children}
            </main>
        </div>
    </div>
  );
}
