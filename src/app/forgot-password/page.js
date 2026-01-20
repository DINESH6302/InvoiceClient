'use client';

import Link from 'next/link';
import { Mail, ArrowRight, Loader2, KeyRound, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
        setLoading(false);
        setEmailSent(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute -top-[30%] -left-[10%] w-[70rem] h-[70rem] rounded-full bg-blue-100/40 blur-3xl opacity-60" />
            <div className="absolute -bottom-[30%] -right-[10%] w-[70rem] h-[70rem] rounded-full bg-indigo-100/40 blur-3xl opacity-60" />
        </div>

        <div className="w-full max-w-md z-10 p-6">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 text-orange-600 mb-4 shadow-sm">
                        <KeyRound size={24} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Forgot Password?</h1>
                    <p className="text-slate-500">No worries, we'll send you reset instructions.</p>
                </div>

                {emailSent ? (
                    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                            <CheckCircle className="text-green-600 shrink-0 mt-0.5" size={20} />
                            <div>
                                <h3 className="font-semibold text-green-900 text-sm">Check your email</h3>
                                <p className="text-green-700 text-sm mt-1">
                                    We have sent a password reset link to <span className="font-medium">{email}</span>.
                                </p>
                            </div>
                        </div>
                        
                        <div className="text-center text-sm text-slate-500">
                            Didn't receive the email?{' '}
                            <button 
                                onClick={() => setEmailSent(false)}
                                className="text-blue-600 hover:text-blue-700 hover:underline font-medium focus:outline-none"
                            >
                                Click to resend
                            </button>
                        </div>

                        <Link 
                            href="/login"
                            className="flex items-center justify-center w-full gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            <ArrowRight className="rotate-180" size={16} />
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 ml-1" htmlFor="email">Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="name@company.com"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    Reset Password
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                        
                        <div className="text-center">
                            <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center gap-2">
                                <ArrowRight className="rotate-180" size={16} />
                                Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
            
            <div className="mt-8 text-center text-xs text-slate-400">
                &copy; {new Date().getFullYear()} BizBill Manager. All rights reserved.
            </div>
        </div>
    </div>
  );
}
