import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const API_AUTH = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/auth`;

export default function Login() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('cfo@rupeebook.in');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [entity, setEntity] = useState('Global Treasury Corp (IN-01)');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter corporate credentials.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_AUTH}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('rupeebook_token', data.token);
        localStorage.setItem(
          'rupeebook_user',
          JSON.stringify({
            ...data.user,
            entity,
            loggedInAt: new Date().toISOString(),
          })
        );
        navigate('/dashboard');
      } else {
        setError(data.message || 'Invalid corporate email or password.');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError('Network error connecting to RupeeBook Auth API at port 5000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] font-['Inter',sans-serif] flex flex-col justify-between">
      {/* Top Bar */}
      <header className="w-full bg-white border-b-[1.5px] border-[#0F172A] px-6 md:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0033ff] border-[1.5px] border-[#0F172A] flex items-center justify-center shadow-[3px_3px_0px_#0F172A]">
            <span className="text-[18px] text-white font-bold tracking-wider">RB</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[18px] font-extrabold uppercase leading-none tracking-tight">
              RupeeBook
            </span>
            <span className="text-[10px] text-[#444657] font-bold tracking-widest mt-0.5 uppercase">
              MULTI-ENTITY TREASURY
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {/* Neo-Brutalist Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle color theme"
            className="w-9 h-9 border-[1.5px] border-[#0F172A] bg-white text-[#1a1c1c] flex items-center justify-center shadow-[2px_2px_0px_#0F172A] hover:bg-[#f3f3f4] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[19px]">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <Link
            to="/"
            className="px-4 py-2 border-[1.5px] border-[#0F172A] bg-white text-[13px] font-bold shadow-[2px_2px_0px_#0F172A] hover:bg-[#f3f3f4]"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Centered Split Login Card */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl bg-white border-2 border-[#0F172A] shadow-[6px_6px_0px_#0F172A] grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Cobalt Brand Panel */}
          <div className="md:col-span-5 bg-[#0033ff] text-white p-8 flex flex-col justify-between border-b-2 md:border-b-0 md:border-r-2 border-[#0F172A]">
            <div className="flex flex-col gap-5">
              <span className="inline-block self-start px-2.5 py-1 bg-[#acf847] text-[#0F172A] border-[1.5px] border-[#0F172A] text-[10px] font-extrabold uppercase tracking-wider">
                FY 2026-27 • STATUTORY READY
              </span>
              <h1 className="font-['Playfair_Display',serif] text-[32px] font-extrabold leading-tight">
                Institutional Payroll &amp; Ledger Control.
              </h1>
              <p className="text-[14px] text-[#dfe0ff] leading-relaxed">
                Sign in to execute prorated salary batches, verify EPF/ESIC/PT/TDS challans, and
                reconcile double-entry general ledger postings.
              </p>

              <ul className="space-y-2.5 pt-2 text-[12px] font-semibold">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#acf847] inline-block"></span>
                  EPF 12% Auto-Cap &amp; Sec 192 TDS
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#acf847] inline-block"></span>
                  Balanced Debit = Credit GL Sync
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#acf847] inline-block"></span>
                  MongoDB Atlas Cloud Persistence
                </li>
              </ul>
            </div>

            <div className="pt-8 mt-8 border-t border-white/25 flex items-center justify-between text-[11px] font-mono">
              <span>CYCLE: NOV 2026</span>
              <span className="text-[#acf847] font-bold">● API ONLINE</span>
            </div>
          </div>

          {/* Right White Login Form */}
          <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#0024c1]">
                TREASURY AUTHENTICATION
              </span>
              <h2 className="font-['Playfair_Display',serif] text-[28px] font-bold text-[#0F172A] mt-1">
                Sign in to Console
              </h2>
              <p className="text-[13px] text-[#444657] mt-1">
                Enter corporate treasury credentials to access the workspace.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-[#ffdad6] border-[1.5px] border-[#0F172A] shadow-[2px_2px_0px_#0F172A] text-[#93000a] text-[12px] font-bold flex items-center justify-between">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => setError('')}
                  className="text-[#93000a] font-bold ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">
                  Corporate Entity
                </label>
                <select
                  value={entity}
                  onChange={(e) => setEntity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f9f9f9] border-[1.5px] border-[#0F172A] text-[14px] font-semibold focus:outline-none focus:bg-white"
                >
                  <option>Global Treasury Corp (IN-01)</option>
                  <option>RupeeBook FinTech Services Pvt Ltd (IN-02)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">
                  Corporate Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cfo@rupeebook.in"
                  className="w-full px-3.5 py-2.5 bg-white border-[1.5px] border-[#0F172A] text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-[#0033ff]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0F172A]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('cfo@rupeebook.in');
                      setPassword('admin123');
                    }}
                    className="text-[11px] font-bold text-[#0033ff] hover:underline cursor-pointer"
                  >
                    Fill Demo Credentials
                  </button>
                </div>
                <div className="relative flex items-center bg-white border-[1.5px] border-[#0F172A] focus-within:ring-2 focus-within:ring-[#0033ff] transition-all">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 text-[14px] font-medium text-[#1a1c1c] bg-transparent border-0 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className={`mr-2 p-1.5 border-[1.5px] border-[#0F172A] text-[#1a1c1c] shadow-[1px_1px_0px_#0F172A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center transition-all duration-150 cursor-pointer ${
                      showPassword
                        ? 'bg-[#acf847] scale-105'
                        : 'bg-[#eeeeee] hover:bg-[#e2e2e2]'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${
                        showPassword ? 'rotate-180' : 'rotate-0'
                      }`}
                    >
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-6 bg-[#0033ff] text-white text-[14px] font-bold border-2 border-[#0F172A] shadow-[4px_4px_0px_#0F172A] hover:bg-[#0024c1] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#0F172A] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-transform cursor-pointer"
              >
                {loading ? 'Authenticating Corporate Session...' : 'Authenticate & Enter Dashboard →'}
              </button>
            </form>

            <div className="pt-6 mt-6 border-t-[1.5px] border-[#0F172A] flex flex-col sm:flex-row items-center justify-between gap-2">
              <Link
                to="/register"
                className="text-[12px] text-[#0033ff] font-bold hover:underline flex items-center gap-1"
              >
                New user? Provision Treasury Account →
              </Link>
              <div className="flex items-center gap-1.5 text-[12px] text-[#444657] font-mono">
                <span className="material-symbols-outlined text-[14px] text-[#1a1c1c]">lock</span>
                <span>256-bit Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
