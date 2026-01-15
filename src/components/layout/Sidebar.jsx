'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Package, FileText, PlusCircle } from 'lucide-react';
import { useOrganization } from '@/context/OrganizationContext';

const MENU_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Items', href: '/items', icon: Package },
  { name: 'Templates', href: '/templates', icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { addOrganization } = useOrganization();

  const handleCreateOrg = () => {
      router.push('/organizations/new');
  };

  return (
    <aside className="w-56 bg-slate-900 text-slate-100 flex flex-col h-screen fixed left-0 top-0 z-20">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight">BizBill Manager</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
        
         <button 
           onClick={handleCreateOrg}
           className="flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-slate-400 hover:bg-slate-800 hover:text-white w-full text-left"
         >
            <PlusCircle size={20} />
            <span className="font-medium">Create Org</span>
         </button>
      </nav>

      <div className="p-4 border-t border-slate-800 text-center">
        <p className="text-xs text-slate-500">v1.0.0</p>
      </div>
    </aside>
  );
}
