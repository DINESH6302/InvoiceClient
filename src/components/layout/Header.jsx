'use client';

import { User, ChevronDown, Plus } from 'lucide-react';
import { useOrganization } from '@/context/OrganizationContext';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { currentOrg, organizations, switchOrganization } = useOrganization();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 fixed top-0 right-0 left-56 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Breadcrumb or Title could go here */}
      </div>

      <div className="flex items-center gap-6">
        {/* Organization Switcher */}
        <div className="relative" ref={dropdownRef}>
             <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200"
             >
                 {currentOrg?.name}
                 <ChevronDown size={14} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}/>
             </button>
             
             {isDropdownOpen && (
                 <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-100 py-1 z-50">
                     {organizations.map(org => (
                         <button
                             key={org.id}
                             onClick={() => {
                                 switchOrganization(org.id);
                                 setIsDropdownOpen(false);
                             }}
                             className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${currentOrg.id === org.id ? 'text-blue-600 font-medium' : 'text-slate-600'}`}
                         >
                             {org.name}
                         </button>
                     ))}
                     <div className="border-t border-slate-100 my-1"></div>
                     <button
                         onClick={() => {
                             router.push('/organizations/new');
                             setIsDropdownOpen(false);
                         }}
                         className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-slate-50 flex items-center gap-2"
                     >
                         <Plus size={14} />
                        New Organization
                     </button>
                 </div>
             )}
        </div>
        
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
            <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-700">Dinesh</p>
                <p className="text-xs text-slate-500">Admin</p>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 border border-slate-200">
                <User size={20} />
            </div>
        </div>
      </div>
    </header>
  );
}
