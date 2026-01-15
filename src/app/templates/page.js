'use client';

import Link from 'next/link';
import { Plus, FileText, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function TemplatesPage() {
  // Mock Data for saved templates
  const [savedTemplates, setSavedTemplates] = useState([
      { id: 1, name: 'Standard Invoice', lastModified: '2025-01-10' },
      { id: 2, name: 'Professional Blue', lastModified: '2025-01-12' }
  ]);
  
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const handleDelete = (id) => {
    if(confirm('Are you sure you want to delete this template?')) {
        setSavedTemplates(savedTemplates.filter(t => t.id !== id));
    }
    setOpenDropdownId(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto" onClick={() => setOpenDropdownId(null)}>
       <div className="flex justify-between items-center mb-8">
         <h1 className="text-2xl font-bold text-slate-800">Invoice Templates</h1>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Create New Card */}
           <Link href="/templates/create" className="group border border-blue-200 bg-blue-50/50 rounded-lg p-6 flex flex-col items-center justify-center min-h-[240px] hover:border-blue-400 hover:bg-blue-100/50 transition-all cursor-pointer hover:shadow-sm">
               <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 group-hover:bg-blue-200 group-hover:text-blue-600 mb-4 transition-colors shadow-inner">
                   <Plus size={28} />
               </div>
               <span className="text-blue-700 font-semibold group-hover:text-blue-800">Create New Template</span>
           </Link>

          {savedTemplates.map(template => (
              <div key={template.id} className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow relative group">
                  <div className="h-40 bg-slate-100 border-b border-slate-100 flex items-center justify-center rounded-t-lg">
                      <FileText size={48} className="text-slate-300" />
                  </div>
                  <div className="p-4">
                      <h3 className="font-semibold text-slate-800 mb-1">{template.name}</h3>
                      <p className="text-xs text-slate-500">Last edited: {template.lastModified}</p>
                  </div>
                  
                  <div className="absolute top-3 right-3">
                      <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === template.id ? null : template.id);
                        }}
                        className="p-1.5 text-slate-400 hover:bg-white hover:text-slate-700 rounded-full transition-colors bg-white/50 backdrop-blur-sm"
                      >
                          <MoreVertical size={16} />
                      </button>

                      {openDropdownId === template.id && (
                          <div className="absolute top-full right-0 mt-1 w-32 bg-white rounded-md shadow-xl border border-slate-100 py-1 z-10" onClick={(e) => e.stopPropagation()}>
                              <Link href={`/templates/create`} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600">
                                  <Edit size={14} /> Edit
                              </Link>
                              <button 
                                onClick={() => handleDelete(template.id)}
                                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                  <Trash2 size={14} /> Delete
                              </button>
                          </div>
                      )}
                  </div>
              </div>
          ))}
       </div>
    </div>
  );
}
