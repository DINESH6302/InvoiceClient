'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrganization } from '@/context/OrganizationContext';
import { Building2, Globe, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function NewOrganizationPage() {
  const router = useRouter();
  const { addOrganization } = useOrganization();
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    location: 'India',
    state: '',
    street1: '',
    street2: '',
    city: '',
    zip: '',
    currency: 'INR',
    language: 'English',
    timezone: '(GMT+05:30) India Standard Time - Kolkata',
    existingMethod: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name) {
        addOrganization(formData.name);
        router.push('/dashboard');
    }
  };

  const handleChange = (e) => {
      setFormData({...formData, [e.target.name]: e.target.value});
  };

  return (
    <div className="h-full bg-white">
       {/* Right Side - Form */}
       <div className="h-full overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-12">
            <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-8 transition-colors group"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
            </button>

            <div className="mb-8">
                <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                    <Building2 size={24} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Create New Organization</h1>
                <p className="text-slate-500 mt-1">Enter your organization details below.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Section 1: Basic Details */}
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Organization Name <span className="text-red-500">*</span></label>
                            <input 
                                type="text" name="name" required
                                className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-slate-50 focus:bg-white"
                                placeholder="e.g. Acme Corp"
                                value={formData.name} onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Industry</label>
                            <select 
                                name="industry"
                                className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-slate-50 focus:bg-white"
                                value={formData.industry} onChange={handleChange}
                            >
                                <option value="">Select Industry</option>
                                <option value="It">IT Services</option>
                                <option value="Retail">Retail</option>
                                <option value="Health">Healthcare</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="h-[1px] bg-slate-100"></div>

                {/* Section 2: Location */}
                <div className="space-y-6">
                    <h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Globe size={14} /> Location Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Country/Region</label>
                            <select 
                                name="location"
                                className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-slate-50 focus:bg-white"
                                value={formData.location} onChange={handleChange}
                            >
                                <option value="India">India</option>
                                <option value="USA">United States</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">State/Province</label>
                            <select 
                                name="state"
                                className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-slate-50 focus:bg-white"
                                value={formData.state} onChange={handleChange}
                            >
                                <option value="">Select State</option>
                                <option value="KA">Karnataka</option>
                                <option value="MH">Maharashtra</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <input 
                            type="text" name="street1" placeholder="Street Address Line 1"
                            className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-slate-50 focus:bg-white"
                            value={formData.street1} onChange={handleChange}
                        />
                        <div className="grid grid-cols-2 gap-6">
                            <input 
                                type="text" name="city" placeholder="City"
                                className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-slate-50 focus:bg-white"
                                value={formData.city} onChange={handleChange}
                            />
                            <input 
                                type="text" name="zip" placeholder="Postal Code"
                                className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-slate-50 focus:bg-white"
                                value={formData.zip} onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="h-[1px] bg-slate-100"></div>

                {/* Section 3: Localization */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Currency</label>
                        <select 
                            name="currency"
                            className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-slate-50 focus:bg-white"
                            value={formData.currency} onChange={handleChange}
                        >
                            <option value="INR">Indian Rupee (INR)</option>
                            <option value="USD">US Dollar (USD)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Time Zone</label>
                        <select 
                             name="timezone"
                             className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-slate-50 focus:bg-white"
                             value={formData.timezone} onChange={handleChange}
                        >
                            <option value="(GMT+05:30) India Standard Time - Kolkata">(GMT+05:30) Kolkata</option>
                        </select>
                    </div>
                </div>

                <div className="pt-8 flex items-center justify-end gap-4 border-t border-slate-100 mt-8">
                    <button 
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
                    >
                        Save
                    </button>
                </div>
            </form>
          </div>
       </div>
    </div>
  );
}
