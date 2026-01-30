'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function CreateCustomerPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    customerName: '',
    gstNo: '',
    streetLine: '',
    city: '',
    zipCode: '',
    country: '',
    state: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState({ success: false, message: '' });

  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [states, setStates] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);

  // Fetch countries on component mount
  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,flags,cca2")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a, b) =>
          a.name.common.localeCompare(b.name.common)
        );
        setCountries(sorted);
        setLoadingCountries(false);
      })
      .catch(() => {
        setLoadingCountries(false);
      });
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    if (!formData.country || !countries.length) {
      setStates([]);
      return;
    }
    
    fetchStates(formData.country);
  }, [formData.country, countries]);

  const fetchStates = async (countryCode) => {
    setLoadingStates(true);
    try {
      const response = await fetch(
        `https://restcountries.com/v3.1/alpha/${countryCode}?fields=name,cca2`
      );
      if (!response.ok) throw new Error("Failed to fetch country details");
      const data = await response.json();
      
      const statesResponse = await fetch(
        `https://countriesnow.space/api/v0.1/countries/states`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: data.name.common }),
        }
      );
      
      if (statesResponse.ok) {
        const statesData = await statesResponse.json();
        if (statesData.data && statesData.data.states) {
          setStates(
            statesData.data.states.map((s) => ({
              name: s.name,
              code: s.state_code || s.name,
            }))
          );
        } else {
          setStates([]);
        }
      } else {
        setStates([]);
      }
    } catch (error) {
      console.error("Error fetching states:", error);
      setStates([]);
    } finally {
      setLoadingStates(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value   
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult({ success: false, message: '' });
    
    // Find country name from code for payload
    const selectedCountry = countries.find(c => c.cca2 === formData.country);
    const countryName = selectedCountry ? selectedCountry.name.common : formData.country;

    const payload = {
        customer_name: formData.customerName,
        gst_no: formData.gstNo,
        address: {
            street: formData.streetLine,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zipCode,
            country: countryName,
        }
    };
    
    try {
        const response = await apiFetch("/customers", {
            method: "POST",
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        
        if (response.ok) { 
            setResult({ success: true, message: data.message || "Customer created successfully" });
            setSubmitted(true);
        } else {
            setResult({ success: false, message: data.message || "Operation failed" });
            setSubmitted(true);
        }
    } catch (error) {
        console.error("Error saving customer:", error);
        setResult({ success: false, message: "An unexpected error occurred" });
        setSubmitted(true);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if (result.success) {
      router.push('/customers');
    } else {
      setSubmitted(false);
    }
  };

  return (
    <div className="bg-slate-50 flex items-center justify-center mt-16 ">
      {submitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full mx-4 transform transition-all">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
                {result.success ? (
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{result.success ? 'Success!' : 'Error'}</h3>
              <p className="text-slate-600 mb-6">{result.message}</p>
              <button
                onClick={handleCloseModal}
                className="w-full py-2.5 px-4 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-3xl max-h-screen bg-white rounded-lg shadow-lg p-12 mx-4 overflow-y-hidden">
        {/* Header Icon */}
        <div className="mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Create Customer
          </h1>
          <p className="text-slate-500">
              Enter your customer details below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Name and GST No */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-slate-900 mb-2">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                placeholder="e.g. Acme Corp"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
             <div>
              <label htmlFor="gstNo" className="block text-sm font-medium text-slate-900 mb-2">
                GST No
              </label>
              <input
                type="text"
                id="gstNo"
                name="gstNo"
                value={formData.gstNo}
                onChange={handleChange}
                placeholder="GST number"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Address
            </h3>
            
            <div>
              <label htmlFor="streetLine" className="block text-sm font-medium text-slate-900 mb-2">
                Street Address
              </label>
              <textarea
                id="streetLine"
                name="streetLine"
                value={formData.streetLine}
                onChange={handleChange}
                rows={2}
                placeholder="Street Address Line"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-slate-900 mb-2">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-slate-900 mb-2">
                  Zip / Postal Code
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="Zip Code"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div>
                  <label htmlFor="country" className="block text-sm font-medium text-slate-900 mb-2">
                    Country
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country.cca2} value={country.cca2}>
                        {country.name.common}
                      </option>
                    ))}
                  </select>
               </div>
               <div>
                 <label htmlFor="state" className="block text-sm font-medium text-slate-900 mb-2">
                    State / Province
                 </label>
                 {states.length > 0 ? (
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="">Select State</option>
                      {states.map((state) => (
                        <option key={state.name} value={state.name}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                 ) : (
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="State"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                 )}
               </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/customers')}
              className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                 <>
                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                   Creating...
                </>
              ) : (
                'Create Customer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
