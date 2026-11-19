import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('Arghya Das');
  const [email, setEmail] = useState('arghya@rupeebook.in');
  const [entity, setEntity] = useState('Global Treasury Corp (IN-01)');
  const [role, setRole] = useState('CFO / Treasury Admin');
  const [password, setPassword] = useState('Treasury#992$Kolkata');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fontHref =
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&display=swap';
    const iconHref =
      'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';

    if (!document.querySelector(`link[href="${fontHref}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fontHref;
      document.head.appendChild(link);
    }
    if (!document.querySelector(`link[href="${iconHref}"]`)) {
      const iconLink = document.createElement('link');
      iconLink.rel = 'stylesheet';
      iconLink.href = iconHref;
      document.head.appendChild(iconLink);
    }
  }, []);

  // Compute live 3-bar strength score
  const getStrengthScore = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score += 1;
    if (pwd.length >= 12 && /[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const strengthScore = getStrengthScore(password);
  const strengthMeta =
    strengthScore === 3
      ? { label: 'STRONG (ENTROPY: 88 BITS)', color: 'text-[#416900]', count: '3 / 3 COMPLIANT' }
      : strengthScore === 2
      ? { label: 'MODERATE (ENTROPY: 56 BITS)', color: 'text-[#0024c1]', count: '2 / 3 COMPLIANT' }
      : { label: 'WEAK (ADD SYMBOLS & CAPS)', color: 'text-[#ba1a1a]', count: '1 / 3 COMPLIANT' };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Full Name, Corporate Email, and Master Access Key are required.');
      return;
    }
    if (!agreedTerms) {
      setError('Please acknowledge the Statutory Operating Terms before provisioning.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          role,
          entity,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Account provisioning failed.');
      }

      localStorage.setItem('rupeebook_token', data.token);
      localStorage.setItem('rupeebook_user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] font-['Inter',sans-serif] antialiased flex flex-col justify-between selection:bg-[#acf847] selection:text-[#0F172A]">
      {/* FIXED TOP HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#f9f9f9]/95 backdrop-blur-md border-b-[1.5px] border-[#0F172A]">
        <div className="h-20 max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#0033ff] border-[1.5px] border-[#0F172A] flex items-center justify-center shadow-[3px_3px_0px_#0F172A]">
              <span className="text-[18px] text-white font-bold tracking-tight">RB</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[18px] text-[#1a1c1c] font-bold tracking-tight">
                RupeeBook
              </span>
              <span className="text-[10px] text-[#747689] tracking-wider uppercase mt-1 font-semibold">
                MULTI-ENTITY TREASURY
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4 md:gap-6">
            <Link
              to="/login"
              className="text-[14px] font-semibold text-[#444657] hover:text-[#1a1c1c] px-4 py-2 bg-white border-[1.5px] border-[#0F172A] shadow-[2px_2px_0px_#0F172A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              ← Back to Sign In
            </Link>
            <div className="w-8 h-8 rounded-full bg-[#0024c1] border-[1.5px] border-[#0F172A] flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN REGISTRATION WORKSPACE */}
      <main className="w-full pt-20 bg-[#f9f9f9] flex-1 bg-[radial-gradient(#c4c5da_1px,transparent_1px)] [background-size:24px_24px]">
        <div className="w-full max-w-5xl mx-auto px-6 md:px-8 py-10 flex flex-col items-center">
          {/* Breadcrumb / System Context Badge */}
          <div className="w-full max-w-[940px] flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 bg-[#acf847] border-[1.5px] border-[#0F172A] shadow-[1px_1px_0px_#0F172A]"></span>
              <span className="text-[10px] font-bold text-[#1a1c1c] uppercase tracking-wider">
                SECURE PROVISIONING GATEWAY // SUB-SYSTEM 04
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#747689]">
              <span>GATEKEEPER CLUSTER</span>
              <span className="text-[#1a1c1c]">•</span>
              <span className="text-[#0024c1] font-bold">MUM-WEST-1A</span>
            </div>
          </div>

          {/* Main Registration Neo-Brutalist Split Card */}
          <div className="w-full max-w-[940px] bg-white border-2 border-[#0F172A] shadow-[6px_6px_0px_#0F172A] flex flex-col md:flex-row items-stretch">
            {/* LEFT COLUMN: Cobalt Brand & Architecture Panel (42%) */}
            <div className="w-full md:w-[42%] bg-[#0033ff] p-6 md:p-10 flex flex-col justify-between border-b-2 md:border-b-0 md:border-r-2 border-[#0F172A] relative overflow-hidden text-white">
              {/* Subtle Vector Hatching Accents */}
              <div className="absolute -right-12 -top-12 w-36 h-36 border border-white/20 rotate-12 pointer-events-none"></div>
              <div className="absolute -right-6 -top-6 w-24 h-24 border border-white/10 rotate-12 pointer-events-none"></div>

              {/* Top Section */}
              <div className="flex flex-col relative z-10">
                <div className="inline-flex self-start items-center gap-1.5 bg-[#acf847] text-[#102000] border-[1.5px] border-[#0F172A] px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-[2px_2px_0px_#0F172A] mb-6">
                  <span className="w-1.5 h-1.5 bg-[#0F172A]"></span>
                  NEW ENTITY ONBOARDING • FY 2026-27
                </div>

                <h1 className="font-['Playfair_Display',serif] text-[32px] md:text-[36px] font-bold text-white mb-2 leading-tight">
                  Provision Corporate Treasury Access.
                </h1>

                <p className="text-[14px] text-[#c5caff] leading-relaxed">
                  Enterprise-grade statutory engine and double-entry general ledger synchronization
                  across all corporate subsidiaries.
                </p>
              </div>

              {/* Middle Feature Architectural Ledger Blocks */}
              <div className="my-8 flex flex-col gap-4 relative z-10">
                <div className="bg-white text-[#1a1c1c] p-4 border-[1.5px] border-[#0F172A] shadow-[3px_3px_0px_#0F172A]">
                  <div className="flex items-start gap-2.5">
                    <span
                      className="material-symbols-outlined text-[#0024c1] text-[20px] shrink-0 mt-0.5"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      account_tree
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[14px] text-[#0F172A] font-bold">
                        Multi-Entity Payroll &amp; GL Isolation
                      </span>
                      <span className="text-[12px] text-[#444657] mt-0.5">
                        Dedicated ledger namespaces &amp; multi-state tax pools with zero data
                        spill.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white text-[#1a1c1c] p-4 border-[1.5px] border-[#0F172A] shadow-[3px_3px_0px_#0F172A]">
                  <div className="flex items-start gap-2.5">
                    <span
                      className="material-symbols-outlined text-[#0024c1] text-[20px] shrink-0 mt-0.5"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      assured_workload
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[14px] text-[#0F172A] font-bold">
                        Automated EPF, ESIC, PT &amp; Sec 192 TDS
                      </span>
                      <span className="text-[12px] text-[#444657] mt-0.5">
                        Real-time statutory ceiling caps &amp; quarterly Form 24Q compliance
                        export.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white text-[#1a1c1c] p-4 border-[1.5px] border-[#0F172A] shadow-[3px_3px_0px_#0F172A]">
                  <div className="flex items-start gap-2.5">
                    <span
                      className="material-symbols-outlined text-[#0024c1] text-[20px] shrink-0 mt-0.5"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      verified
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[14px] text-[#0F172A] font-bold">
                        SHA-256 Audited Ledger Postings
                      </span>
                      <span className="text-[12px] text-[#444657] mt-0.5">
                        Atomic double-entry ERP synchronization for SAP, Tally Prime &amp;
                        NetSuite.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Cluster & Latency Indicator */}
              <div className="pt-4 border-t border-white/20 flex flex-col gap-1 relative z-10">
                <div className="inline-flex items-center gap-2 bg-[#acf847] text-[#102000] border-[1.5px] border-[#0F172A] px-3 py-1.5 shadow-[2px_2px_0px_#0F172A] self-start">
                  <span className="w-2 h-2 rounded-full bg-[#102000] animate-pulse"></span>
                  <span className="text-[10px] tracking-wide font-bold">
                    MongoDB Atlas Cluster Ready • Latency 38ms
                  </span>
                </div>
                <span className="text-[10px] text-[#c5caff] tracking-wider uppercase mt-1 font-bold">
                  INSTANCE ID: IND-BOM-NODE-09 • TLS 1.3 SECURED
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: Registration Form (58%) */}
            <div className="w-full md:w-[58%] bg-white p-6 md:p-10 flex flex-col justify-between">
              <div>
                {/* Form Header */}
                <div className="flex items-center justify-between pb-4 border-b-[1.5px] border-[#0F172A] mb-6">
                  <div>
                    <h2 className="font-['Playfair_Display',serif] text-[28px] font-bold text-[#0F172A]">
                      Create Treasury Account
                    </h2>
                    <p className="text-[12px] text-[#444657] mt-1">
                      Register a new CFO or Payroll Administrator operational profile.
                    </p>
                  </div>
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] text-[#747689] font-bold">TIER 1 ACCESS</span>
                    <span className="text-[10px] font-bold bg-[#e8e8e8] px-2 py-0.5 border border-[#0F172A] mt-1">
                      RB-AUTH
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-[#ffdad6] border-[1.5px] border-[#0F172A] text-[#93000a] text-[12px] font-bold shadow-[2px_2px_0px_#0F172A]">
                    {error}
                  </div>
                )}

                {/* Registration Form Body */}
                <form className="flex flex-col gap-4" onSubmit={handleRegister}>
                  {/* Row 1: Full Name */}
                  <div className="flex flex-col gap-1">
                    <label
                      className="text-[11px] font-bold uppercase tracking-wider text-[#0F172A]"
                      htmlFor="fullName"
                    >
                      Full Legal Name <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g., Arghya Das"
                      className="w-full px-3.5 py-2.5 text-[14px] text-[#1a1c1c] bg-white border-[1.5px] border-[#0F172A] focus:outline-none focus:border-[#0024c1] focus:shadow-[2px_2px_0px_#0033ff] transition-all"
                    />
                  </div>

                  {/* Row 2: Corporate Email / UPN */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <label
                        className="text-[11px] font-bold uppercase tracking-wider text-[#0F172A]"
                        htmlFor="corpEmail"
                      >
                        Corporate Email / UPN <span className="text-[#ba1a1a]">*</span>
                      </label>
                      <span className="text-[10px] font-bold text-[#747689]">
                        PRIMARY SSO IDENTITY
                      </span>
                    </div>
                    <input
                      id="corpEmail"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g., arghya@rupeebook.in"
                      className="w-full px-3.5 py-2.5 text-[14px] text-[#1a1c1c] bg-white border-[1.5px] border-[#0F172A] focus:outline-none focus:border-[#0024c1] focus:shadow-[2px_2px_0px_#0033ff] transition-all"
                    />
                  </div>

                  {/* Row 3: Entity / Org Name with Validation Token */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <label
                        className="text-[11px] font-bold uppercase tracking-wider text-[#0F172A]"
                        htmlFor="entityName"
                      >
                        Entity / Subsidiary Name <span className="text-[#ba1a1a]">*</span>
                      </label>
                      <span className="text-[10px] bg-[#acf847] text-[#304f00] px-1.5 py-0.5 border border-[#0F172A] font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">verified</span>
                        CIN VERIFIED
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        id="entityName"
                        type="text"
                        required
                        value={entity}
                        onChange={(e) => setEntity(e.target.value)}
                        placeholder="Global Treasury Corp (IN-01)"
                        className="w-full pl-3.5 pr-28 py-2.5 text-[14px] text-[#1a1c1c] bg-white border-[1.5px] border-[#0F172A] focus:outline-none focus:border-[#0024c1] focus:shadow-[2px_2px_0px_#0033ff] transition-all"
                      />
                      <div className="absolute right-2 px-2 py-0.5 bg-[#eeeeee] border border-[#0F172A] text-[11px] font-mono text-[#0F172A] font-bold">
                        ENTITY #4092
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Role Selection Segmented Control */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#0F172A]">
                      Assigned Operational Role <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('CFO / Treasury Admin')}
                        className={`p-2.5 text-left border-[1.5px] border-[#0F172A] flex items-center justify-between cursor-pointer transition-all ${
                          role === 'CFO / Treasury Admin'
                            ? 'bg-[#0024c1] text-white shadow-[2px_2px_0px_#0F172A]'
                            : 'bg-[#f3f3f4] text-[#1a1c1c] hover:bg-[#eeeeee]'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold">CFO / Treasury Admin</span>
                          <span
                            className={`text-[10px] mt-0.5 font-mono ${
                              role === 'CFO / Treasury Admin' ? 'opacity-90' : 'text-[#747689]'
                            }`}
                          >
                            Full Ledger &amp; Disbursement
                          </span>
                        </div>
                        {role === 'CFO / Treasury Admin' && (
                          <span className="material-symbols-outlined text-[16px]">
                            check_circle
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole('HR & Payroll Manager')}
                        className={`p-2.5 text-left border-[1.5px] border-[#0F172A] flex items-center justify-between cursor-pointer transition-all ${
                          role === 'HR & Payroll Manager'
                            ? 'bg-[#0024c1] text-white shadow-[2px_2px_0px_#0F172A]'
                            : 'bg-[#f3f3f4] text-[#1a1c1c] hover:bg-[#eeeeee]'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold">HR &amp; Payroll Manager</span>
                          <span
                            className={`text-[10px] mt-0.5 font-mono ${
                              role === 'HR & Payroll Manager' ? 'opacity-90' : 'text-[#747689]'
                            }`}
                          >
                            Batch Runs &amp; Approvals
                          </span>
                        </div>
                        {role === 'HR & Payroll Manager' && (
                          <span className="material-symbols-outlined text-[16px]">
                            check_circle
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Row 5: Password Creation & Neo-Brutalist Live Meter */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <label
                        className="text-[11px] font-bold uppercase tracking-wider text-[#0F172A]"
                        htmlFor="masterPassword"
                      >
                        Master Access Key / Password <span className="text-[#ba1a1a]">*</span>
                      </label>
                      <span className="text-[10px] font-bold text-[#747689]">
                        MIN. 14 CHARACTERS
                      </span>
                    </div>
                    <div className="relative flex items-center bg-white border-[1.5px] border-[#0F172A] focus-within:shadow-[2px_2px_0px_#0033ff] transition-all">
                      <input
                        id="masterPassword"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-[14px] font-mono text-[#1a1c1c] bg-transparent border-0 focus:outline-none"
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

                    {/* Neo-Brutalist 3-Bar Strength Indicator */}
                    <div className="mt-1 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1">
                          PASSWORD STRENGTH:{' '}
                          <span className={`${strengthMeta.color} font-extrabold`}>
                            {strengthMeta.label}
                          </span>
                        </span>
                        <span className="text-[10px] font-bold text-[#747689] font-mono">
                          {strengthMeta.count}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[1, 2, 3].map((bar) => (
                          <div
                            key={bar}
                            className={`h-2 border-[1.5px] border-[#0F172A] shadow-[1px_1px_0px_#0F172A] transition-colors duration-200 ${
                              strengthScore >= bar ? 'bg-[#acf847]' : 'bg-[#eeeeee]'
                            }`}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Checkbox Terms & FIDO2 Attestation */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreedTerms}
                        onChange={(e) => setAgreedTerms(e.target.checked)}
                        className="mt-1 w-4 h-4 accent-[#0024c1] border-2 border-[#0F172A] cursor-pointer"
                      />
                      <span className="text-[12px] text-[#1a1c1c] leading-tight">
                        Enforce Hardware Token / WebAuthn FIDO2 MFA on first login and acknowledge
                        Statutory Operating Terms &amp; Indian IT Act 2000 Ledger Compliance.
                      </span>
                    </label>
                  </div>

                  {/* Submit Action */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 px-6 bg-[#0033ff] hover:bg-[#0024c1] disabled:opacity-60 text-white text-[14px] font-bold border-2 border-[#0F172A] shadow-[4px_4px_0px_#0F172A] hover:shadow-[2px_2px_0px_#0F172A] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>
                      {loading
                        ? 'Provisioning Treasury Account...'
                        : 'Provision Account & Enter Console'}
                    </span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </form>
              </div>

              {/* Right Column Footer Meta Links */}
              <div className="pt-6 mt-6 border-t-[1.5px] border-[#0F172A] flex flex-col sm:flex-row items-center justify-between gap-2">
                <Link
                  to="/login"
                  className="text-[12px] text-[#0024c1] font-bold hover:underline flex items-center gap-1"
                >
                  Already registered? Sign In to Console →
                </Link>
                <div className="flex items-center gap-1.5 text-[12px] text-[#444657] font-mono">
                  <span className="material-symbols-outlined text-[14px] text-[#1a1c1c]">lock</span>
                  <span>256-bit Encrypted • ISO 20022</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Institutional Compliance Disclaimer */}
          <div className="w-full max-w-[940px] mt-6 text-center flex flex-col sm:flex-row items-center justify-between gap-1 px-2">
            <span className="text-[12px] text-[#444657] font-mono">
              RupeeBook Enterprise Edition v4.9.2 • Authorized Institutional Access Only.
            </span>
            <Link
              to="/login"
              className="text-[12px] text-[#1a1c1c] hover:text-[#0024c1] font-semibold hover:underline flex items-center gap-1"
            >
              Need assistance? Contact Treasury Operations Desk →
            </Link>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-white py-10 border-t-[1.5px] border-[#0F172A]">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex flex-col gap-1">
            <p className="text-[12px] text-[#1a1c1c] font-semibold">
              RupeeBook Enterprise Treasury Architecture • SOC-2 Type II Certified • ISO/IEC 27001
            </p>
            <p className="text-[12px] text-[#444657]">
              © 2026 RupeeBook Technologies Private Limited. All statutory multi-jurisdictional
              ledgers reserved.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-[10px] font-bold text-[#444657] hover:text-[#1a1c1c] uppercase"
            >
              Compliance Terms
            </Link>
            <Link
              to="/"
              className="text-[10px] font-bold text-[#444657] hover:text-[#1a1c1c] uppercase"
            >
              Regulatory Disclosures
            </Link>
            <Link
              to="/"
              className="text-[10px] font-bold text-[#444657] hover:text-[#1a1c1c] uppercase"
            >
              Data Protection
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}