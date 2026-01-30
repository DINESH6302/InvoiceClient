'use client';

import { User, ChevronDown, LogOut, Settings, Plus, Pencil, Trash2, X } from 'lucide-react';
import { useOrganization } from '@/context/OrganizationContext';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { clearTokens } from '@/lib/auth';
import { API_BASE_URL, apiFetch } from '@/lib/api';

export default function Header() {
    const { currentOrg, switchOrganization, setOrganizations, organizations } = useOrganization();
    
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    
    // Organization Dropdown States
    const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
    const [loadingOrgs, setLoadingOrgs] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, orgId: null, orgName: '' });
    const [deleteStatus, setDeleteStatus] = useState({ type: null, message: '' });

    const router = useRouter();
    const profileDropdownRef = useRef(null);
    const orgDropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (orgDropdownRef.current && !orgDropdownRef.current.contains(event.target)) {
                setIsOrgDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Fetch org names on component mount
    useEffect(() => {
        fetchOrgNames();
    }, []);

    // Redirect to org creation if no orgs exist
    useEffect(() => {
        if (!loadingOrgs && organizations.length === 0) {
            if (!window.location.pathname.includes('/organizations/new')) {
                router.push('/organizations/new');
            }
        }
    }, [loadingOrgs, organizations.length, router]);

    // Auto-close delete status notification after 3 seconds
    useEffect(() => {
        if (deleteStatus.type) {
            const timer = setTimeout(() => {
                setDeleteStatus({ type: null, message: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [deleteStatus.type]);

    // Fetch org names
    const fetchOrgNames = useCallback(async () => {
        setLoadingOrgs(true);
        try {
            const res = await apiFetch('/orgs/summary', { method: 'GET' });
            if (res.ok) {
                const data = await res.json();
                const orgList = Array.isArray(data) ? data : data.data || [];
                
                if (setOrganizations) {
                    setOrganizations(orgList);
                    const savedOrgId = localStorage.getItem('current_org_id');
                    if (!savedOrgId && orgList.length > 0) {
                        switchOrganization(orgList[0].org_id);
                    }
                }
            } else {
                if (setOrganizations) setOrganizations([]);
            }
        } catch (e) {
            console.error("Error fetching org summary:", e);
            if (setOrganizations) setOrganizations([]);
        }
        setLoadingOrgs(false);
    }, []);

    const handleDeleteOrg = async () => {
        try {
            const res = await apiFetch(`/orgs/${deleteConfirm.orgId}`, { method: 'DELETE' });
            
            if (res.status === 204 || res.ok) {
                const updatedOrgs = organizations.filter(org => org.org_id !== deleteConfirm.orgId);
                
                if (updatedOrgs.length > 0) {
                    const nextOrgId = updatedOrgs[0].org_id;
                    const wasCurrentDeleted = String(currentOrg?.org_id) === String(deleteConfirm.orgId);
                    if (wasCurrentDeleted) {
                        localStorage.setItem('current_org_id', nextOrgId);
                    }
                    window.location.reload();
                } else {
                    localStorage.removeItem('current_org_id');
                    setOrganizations([]);
                    router.push('/organizations/new');
                }
                
                setDeleteConfirm({ open: false, orgId: null, orgName: '' });
                setIsOrgDropdownOpen(false);
            } else {
                let errorMsg = 'Failed to delete organization.';
                try {
                    const data = await res.json();
                    errorMsg = data.message || data.error || errorMsg;
                } catch (e) {
                    errorMsg = res.statusText || errorMsg;
                }
                setDeleteStatus({ type: 'error', message: errorMsg });
            }
        } catch (err) {
            setDeleteStatus({ type: 'error', message: err.message || 'Failed to delete organization.' });
        }
    };

  const handleLogout = async () => {
      try {
          await fetch(`${API_BASE_URL}/auth/logout`, {
              method: 'POST',
              credentials: 'include'
          });
      } catch (e) {
          console.error("Logout failed", e);
      } finally {
          clearTokens();
          router.push('/login');
      }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 fixed top-0 right-0 left-56 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Breadcrumbs or other left-side content */}
      </div>

      <div className="flex items-center gap-6">
        
        {/* Organization Dropdown */}
        {organizations.length > 0 && (
            <div className="relative" ref={orgDropdownRef}>
                <button 
                  onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <span className="max-w-[150px] truncate">{currentOrg?.org_name || currentOrg?.name || "Select Org"}</span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOrgDropdownOpen ? 'rotate-180' : ''}`}/>
                </button>
                
                {isOrgDropdownOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white rounded-md shadow-lg border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="max-h-[300px] overflow-y-auto">
                        {organizations.map((org, idx) => {
                        const orgId = org.org_id;
                        const orgName = org.org_name;
                        const isSelected = currentOrg?.org_id === orgId || currentOrg?.id === orgId;
                        return (
                            <div key={orgId || idx} className={`flex items-center group px-1 mx-1 rounded-md mb-0.5 ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                            <button
                                onClick={() => {
                                localStorage.setItem('current_org_id', orgId);
                                switchOrganization(orgId);
                                setIsOrgDropdownOpen(false);
                                window.location.reload();
                                }}
                                className={`flex-1 text-left px-2 py-2 text-sm truncate rounded-md ${isSelected ? 'text-blue-600 font-medium' : 'text-slate-600'}`}
                            >
                                {orgName}
                            </button>
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity px-1 gap-1">
                                <button
                                    onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/organizations/new?id=${orgId}`);
                                    setIsOrgDropdownOpen(false);
                                    }}
                                    className={`p-1.5 rounded-md transition-colors ${isSelected ? 'text-blue-400 hover:text-blue-600 hover:bg-blue-100' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                                    title="Edit organization"
                                >
                                    <Pencil size={14} />
                                </button>
                                <button
                                    onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirm({ open: true, orgId, orgName });
                                    }}
                                    className={`p-1.5 rounded-md transition-colors ${isSelected ? 'text-blue-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                                    title="Delete organization"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            </div>
                        );
                        })}
                    </div>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={() => {
                        router.push('/organizations/new');
                        setIsOrgDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2 mx-1 rounded-md"
                    >
                      <Plus size={14} />
                      New Organization
                    </button>
                  </div>
                )}
            </div>
        )}

        <div className="h-8 w-px bg-slate-200"></div>

        <div className="flex items-center gap-3 pl-2 relative" ref={profileDropdownRef}>
            <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-lg transition-colors outline-none"
            >
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-slate-700">Dinesh</p>
                </div>
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 border border-slate-200">
                    <User size={20} />
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}/>
            </button>

                        {isProfileOpen && (
                                 <div className="absolute top-full right-0 w-36 bg-slate-50 rounded-md shadow-lg border border-slate-100 py-1 z-50">
                                         <button
                                                 onClick={() => {
                                                         // router.push('/settings');
                                                         setIsProfileOpen(false);
                                                 }}
                                                 className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                         >
                                                 <Settings size={16} />
                                                 Settings
                                         </button>
                                         <div className="border-t border-slate-100 my-1"></div>
                                         <button
                                                 onClick={() => setShowLogoutConfirm(true)}
                                                 className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                         >
                                                 <LogOut size={16} />
                                                 Logout
                                         </button>
                                 </div>
                         )}

                        {/* Logout Confirmation Modal */}
                        {showLogoutConfirm && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xs border border-slate-200 animate-in fade-in">
                                        <div className="mb-4 text-center">
                                            <div className="text-lg font-semibold mb-2">Confirm Logout</div>
                                            <div className="text-slate-600 text-sm">Are you sure you want to logout?</div>
                                        </div>
                                        <div className="flex gap-3 mt-6">
                                            <button
                                                className="flex-1 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                                                onClick={() => setShowLogoutConfirm(false)}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                className="flex-1 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold"
                                                onClick={() => {
                                                    setShowLogoutConfirm(false);
                                                    setIsProfileOpen(false);
                                                    handleLogout();
                                                }}
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                </div>
                        )}
        </div>
      </div>
       {/* Delete Confirmation Modal for Organization */}
       {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4 border border-slate-200 text-slate-900">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Delete Organization?</h3>
              <p className="text-slate-600 text-sm mt-2">
                Are you sure you want to delete <span className="font-medium">{deleteConfirm.orgName}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm({ open: false, orgId: null, orgName: '' })}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteOrg}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Status Notification for Organization */}
      {deleteStatus.type && (
          <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-lg p-4 shadow-lg max-w-md border flex items-start gap-3 ${
            deleteStatus.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200' 
              : 'bg-red-50 border-red-200'
          }`}>
               <p className={`flex-1 text-sm font-medium ${
            deleteStatus.type === 'success' 
              ? 'text-emerald-900' 
              : 'text-red-900'
          }`}>
            {deleteStatus.message}
          </p>
          <button
            onClick={() => setDeleteStatus({ type: null, message: '' })}
            className={`flex-shrink-0 transition-colors ${
              deleteStatus.type === 'success'
                ? 'text-emerald-600 hover:text-emerald-700'
                : 'text-red-600 hover:text-red-700'
            }`}
          >
            <X size={18} />
          </button>
          </div>
      )}
    </header>
  );
}