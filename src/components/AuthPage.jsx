import React, { useState } from 'react';
import { ArrowRight, Loader2, Quote, AlertCircle } from 'lucide-react';
import { apiCall, setToken, setUser } from '../lib/api';

export default function AuthPage({ onAuthenticated, onBack }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const data = await apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      setToken(data.token);
      setUser(data.user);
      onAuthenticated(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex font-sans">

      {/* Left Pane — Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative">
        <button
          onClick={onBack}
          className="absolute top-8 left-8 text-sm font-medium text-slate-500 hover:text-slate-900 transition flex items-center"
        >
          &larr; Back to home
        </button>

        <div className="w-full max-w-sm mx-auto">
          {/* Logo */}
          <div className="flex items-center space-x-2 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white text-xl font-bold tracking-tighter">P</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">Postly</span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-slate-500 mb-8 text-sm">
            {isLogin
              ? 'Enter your credentials to access the enterprise dashboard.'
              : 'Start your 14-day free trial. No credit card required.'}
          </p>

          {error && (
            <div className="mb-5 flex items-start bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Work Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-sm"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                {isLogin && <a href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-800">Forgot password?</a>}
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg text-sm font-medium flex items-center justify-center transition disabled:opacity-70 disabled:cursor-not-allowed mt-2 shadow-sm"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="font-semibold text-indigo-600 hover:text-indigo-800 transition"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </div>
      </div>

      {/* Right Pane — Brand graphic */}
      <div className="hidden lg:flex w-[55%] bg-[#0a0a0a] relative overflow-hidden flex-col justify-end p-16">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-900/40 blur-[150px] rounded-full pointer-events-none"></div>

        {/* Mock dashboard window */}
        <div className="w-[120%] bg-[#111] border-t border-l border-white/10 rounded-tl-3xl shadow-2xl translate-y-16 translate-x-12 overflow-hidden relative">
          <div className="h-10 border-b border-white/5 flex items-center px-4 space-x-2 bg-[#0a0a0a]">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/40"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40"></div>
          </div>
          <div className="flex h-[400px]">
            <div className="w-48 border-r border-white/5 p-6 bg-[#0a0a0a]/50">
              <div className="w-6 h-6 bg-indigo-600/30 rounded mb-8"></div>
              <div className="space-y-4">
                <div className="h-6 w-full bg-slate-800/40 rounded"></div>
                <div className="h-6 w-full bg-slate-800/40 rounded"></div>
                <div className="h-6 w-3/4 bg-slate-800/40 rounded"></div>
              </div>
            </div>
            <div className="flex-1 p-8 grid grid-cols-2 gap-4 bg-[#111]">
              <div className="bg-slate-800/20 rounded-lg border border-white/5"></div>
              <div className="bg-slate-800/20 rounded-lg border border-white/5"></div>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="absolute top-16 left-16 max-w-sm z-10 hidden xl:block">
          <Quote className="w-10 h-10 text-indigo-500/30 mb-6" />
          <p className="text-xl font-medium text-white mb-6 leading-relaxed">
            "Switching our pipeline to Postly gave us back roughly 20 hours a week in formatting overhead."
          </p>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-slate-800 rounded-full mr-4 border border-slate-700"></div>
            <div>
              <p className="text-sm font-bold text-white">David Chen</p>
              <p className="text-xs text-slate-400">Marketing Operations, Globex</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
