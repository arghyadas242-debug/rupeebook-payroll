import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  useEffect(() => {
    // Load Playfair Display, Inter & Material Symbols if not already in index.html
    const fontHref =
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700;800&display=swap';
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

  return (
    <div className="min-h-screen bg-[#f9f9f9] dark:bg-[#0B1120] text-[#1a1c1c] dark:text-[#F8FAFC] font-['Inter',sans-serif] antialiased">
      {/* FIXED TOP HEADER */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-[#111827] border-b-[1.5px] border-[#0F172A] dark:border-[#475569]">
        <div className="h-20 max-w-[1440px] mx-auto px-6 md:px-8 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-4 shrink-0">
            <div className="w-10 h-10 bg-[#0033ff] border-[1.5px] border-[#0F172A] flex items-center justify-center shadow-[3px_3px_0px_#0F172A]">
              <span className="text-[18px] text-white font-bold tracking-wider">RB</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[18px] text-[#1a1c1c] dark:text-[#F8FAFC] font-extrabold uppercase leading-none tracking-tight">
                RupeeBook
              </span>
              <span className="text-[10px] text-[#444657] dark:text-[#CBD5E1] font-bold tracking-widest mt-0.5 uppercase">
                MULTI-ENTITY TREASURY
              </span>
            </div>
          </Link>

          {/* Center Nav */}
          <nav className="hidden lg:flex items-center gap-1 p-1 border-[1.5px] border-[#0F172A] dark:border-[#475569] bg-[#f9f9f9] dark:bg-[#0B1120]">
            <a
              href="#statutory-engine"
              className="px-4 py-1.5 text-[14px] font-semibold text-[#444657] dark:text-[#CBD5E1] hover:text-[#1a1c1c] dark:hover:text-[#F8FAFC] hover:bg-[#f3f3f4] dark:hover:bg-[#1E293B]"
            >
              Statutory Engine
            </a>
            <a
              href="#double-entry-gl"
              className="px-4 py-1.5 text-[14px] font-semibold text-[#444657] dark:text-[#CBD5E1] hover:text-[#1a1c1c] dark:hover:text-[#F8FAFC] hover:bg-[#f3f3f4] dark:hover:bg-[#1E293B]"
            >
              Double-Entry GL
            </a>
            <a
              href="#neft-treasury"
              className="px-4 py-1.5 text-[14px] font-semibold text-[#444657] dark:text-[#CBD5E1] hover:text-[#1a1c1c] dark:hover:text-[#F8FAFC] hover:bg-[#f3f3f4] dark:hover:bg-[#1E293B]"
            >
              NEFT Treasury
            </a>
            <a
              href="#architecture"
              className="px-4 py-1.5 text-[14px] font-semibold text-[#444657] dark:text-[#CBD5E1] hover:text-[#1a1c1c] dark:hover:text-[#F8FAFC] hover:bg-[#f3f3f4] dark:hover:bg-[#1E293B]"
            >
              Architecture
            </a>
          </nav>

          {/* Right Auth & Console CTAs */}
          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            {/* Neo-Brutalist Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle color theme"
              className="w-9 h-9 border-[1.5px] border-[#0F172A] dark:border-[#475569] bg-white dark:bg-[#111827] text-[#1a1c1c] dark:text-[#F8FAFC] flex items-center justify-center shadow-[2px_2px_0px_#0F172A] dark:shadow-[2px_2px_0px_#334155] hover:bg-[#eeeeee] dark:hover:bg-[#1E293B] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[19px]">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            <Link
              to="/login"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 border-[1.5px] border-[#0F172A] dark:border-[#475569] bg-white dark:bg-[#111827] text-[14px] font-semibold text-[#1a1c1c] dark:text-[#F8FAFC] hover:bg-[#eeeeee] dark:hover:bg-[#1E293B] shadow-[2px_2px_0px_#0F172A] dark:shadow-[2px_2px_0px_#334155] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-4 py-2 border-[1.5px] border-[#0F172A] bg-[#0033ff] text-[14px] font-semibold text-white hover:bg-[#0024c1] shadow-[3px_3px_0px_#0F172A] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            >
              Launch Pay Console →
            </Link>
            <Link
              to="/login"
              title="CFO Console Login"
              className="w-8 h-8 rounded-full bg-[#0024c1] flex items-center justify-center shrink-0 border-[1.5px] border-[#0F172A]"
            >
              <span className="material-symbols-outlined text-white text-[18px]">person</span>
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="w-full pt-20 bg-[#f9f9f9]">
        <div className="flex flex-col w-full">
          {/* Top Notification / Ticker Band */}
          <div className="w-full bg-[#0F172A] text-white border-b-2 border-[#0F172A] py-2 px-6 md:px-8">
            <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold tracking-wider uppercase">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#acf847] animate-ping"></span>
                <span className="text-[#acf847] font-bold">RBI HOST-TO-HOST GATEWAYS ONLINE</span>
                <span className="text-[#e2e2e2] hidden md:inline">|</span>
                <span className="text-[#e8e8e8] hidden md:inline">
                  HDFC • ICICI • AXIS • SBI APIS SYNCED (LATENCY: 42MS)
                </span>
              </div>
              <div className="flex items-center gap-4 text-[#e2e2e2] font-mono text-[11px]">
                <span>CBDT TRACES SLABS: FY 2026-27 ACTIVE</span>
                <span className="hidden sm:inline">SHA-256 AUDIT LEDGER LOCKED</span>
              </div>
            </div>
          </div>

          {/* SECTION 1: HERO SECTION */}
          <section className="w-full py-12 lg:py-16 px-6 md:px-8">
            <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Column: Copy & CTAs (7 Cols) */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="inline-flex items-center gap-2 self-start px-3 py-1 bg-[#acf847] text-[#0F172A] border-[1.5px] border-[#0F172A] shadow-[2px_2px_0px_#0F172A]">
                  <span className="w-2 h-2 rounded-full bg-[#15803D] inline-block animate-pulse"></span>
                  <span className="text-[10px] font-bold tracking-widest uppercase">
                    CYCLE NOV 2026 • INDIA STATUTORY COMPLIANT
                  </span>
                </div>

                <h1 className="font-['Playfair_Display',serif] text-[36px] sm:text-[48px] font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight leading-[1.12] max-w-2xl">
                  Precision Payroll &amp; Double-Entry Treasury.
                </h1>

                <p className="text-[16px] leading-[24px] text-[#444657] dark:text-[#CBD5E1] max-w-xl">
                  Automate complex Indian statutory payroll with zero reconciliation drift. From
                  prorated LOP attendance and automated EPF/ESIC/PT/TDS challans to instant
                  host-to-host NEFT bank disbursement and atomic general ledger postings.
                </p>

                {/* CTA Buttons Row */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-6 py-3.5 bg-[#0033ff] text-white text-[14px] font-bold border-2 border-[#0F172A] dark:border-[#475569] shadow-[4px_4px_0px_#0F172A] dark:shadow-[4px_4px_0px_#334155] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#0F172A] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-transform"
                  >
                    Enter Treasury Console →
                  </Link>
                  <a
                    href="#voucher-matrix"
                    className="inline-flex items-center justify-center px-6 py-3.5 bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC] text-[14px] font-bold border-2 border-[#0F172A] dark:border-[#475569] shadow-[4px_4px_0px_#0F172A] dark:shadow-[4px_4px_0px_#334155] hover:bg-[#f3f3f4] dark:hover:bg-[#1E293B] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#0F172A] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-transform"
                  >
                    Inspect Live Ledger
                  </a>
                </div>

                {/* Enterprise Proof Strip */}
                <div className="pt-4 border-t-[1.5px] border-[#0F172A] dark:border-[#475569] flex flex-wrap items-center gap-x-4 gap-y-2 text-[#0F172A] dark:text-[#F8FAFC] text-[12px] font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#0024c1] dark:text-[#ACF847] text-[18px]">
                      verified
                    </span>
                    <span>240+ Multi-Entity Indian Corporates</span>
                  </div>
                  <span className="text-[#c4c5da]">•</span>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#0024c1] dark:text-[#ACF847] text-[18px]">
                      account_balance
                    </span>
                    <span>₹480 Cr+ Annual Disbursed</span>
                  </div>
                  <span className="text-[#c4c5da]">•</span>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#0024c1] dark:text-[#ACF847] text-[18px]">
                      shield
                    </span>
                    <span>99.99% Ledger Uptime</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Balanced Voucher Card (5 Cols) */}
              <div className="lg:col-span-5 w-full" id="voucher-matrix">
                <div className="bg-white dark:bg-[#111827] border-2 border-[#0F172A] dark:border-[#475569] shadow-[6px_6px_0px_#0F172A] dark:shadow-[6px_6px_0px_#334155] p-5 sm:p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-3 border-b-2 border-[#0F172A] dark:border-[#475569] gap-2">
                    <div className="flex flex-col">
                      <span className="font-mono text-[11px] font-bold text-[#444657] dark:text-[#CBD5E1] tracking-wider">
                        VOUCHER ID: RB-2026-11-V402
                      </span>
                      <span className="text-[12px] text-[#0F172A] dark:text-[#F8FAFC] font-bold">
                        Pay Run: November 2026 • Batch Clearing
                      </span>
                    </div>
                    <div className="px-2.5 py-1 bg-[#acf847] text-[#0F172A] border-[1.5px] border-[#0F172A] text-[10px] font-extrabold uppercase shadow-[2px_2px_0px_#0F172A]">
                      BALANCED ✓
                    </div>
                  </div>

                  {/* DR / CR T-Account Summary Grid */}
                  <div className="grid grid-cols-2 gap-2 bg-[#f3f3f4] dark:bg-[#1E293B] p-3 border-[1.5px] border-[#0F172A] dark:border-[#475569]">
                    <div className="flex flex-col border-r-[1.5px] border-[#0F172A] dark:border-[#475569] pr-3">
                      <span className="text-[10px] uppercase font-bold text-[#444657] dark:text-[#CBD5E1]">
                        TOTAL DEBITS (DR)
                      </span>
                      <span className="text-[18px] tabular-nums font-black text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
                        ₹8,67,002.00
                      </span>
                      <span className="text-[10px] text-[#444657] dark:text-[#CBD5E1] font-mono">
                        EXP-501 Sal &amp; Wages
                      </span>
                    </div>
                    <div className="flex flex-col pl-3">
                      <span className="text-[10px] uppercase font-bold text-[#444657] dark:text-[#CBD5E1]">
                        TOTAL CREDITS (CR)
                      </span>
                      <span className="text-[18px] tabular-nums font-black text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
                        ₹8,67,002.00
                      </span>
                      <span className="text-[10px] text-[#444657] dark:text-[#CBD5E1] font-mono">
                        LIAB-201..205 Net &amp; Pools
                      </span>
                    </div>
                  </div>

                  {/* Journal Table Matrix */}
                  <div className="w-full overflow-x-auto border-[1.5px] border-[#0F172A]">
                    <table className="w-full text-left border-collapse text-[12px]">
                      <thead>
                        <tr className="bg-[#e8e8e8] border-b-[1.5px] border-[#0F172A] text-[10px] uppercase text-[#0F172A]">
                          <th className="py-1.5 px-2 font-bold">Account</th>
                          <th className="py-1.5 px-2 font-bold text-right">DR (₹)</th>
                          <th className="py-1.5 px-2 font-bold text-right">CR (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#0F172A] tabular-nums">
                        <tr className="hover:bg-[#acf847]/15">
                          <td className="py-2 px-2">
                            <div className="font-semibold text-[#0F172A]">
                              EXP-501 Payroll Expense
                            </div>
                            <div className="text-[10px] text-[#444657]">
                              Gross Salaries &amp; Retainers
                            </div>
                          </td>
                          <td className="py-2 px-2 text-right font-bold text-[#0F172A]">8,67,002</td>
                          <td className="py-2 px-2 text-right text-[#747689]">—</td>
                        </tr>
                        <tr className="hover:bg-[#acf847]/15 bg-white">
                          <td className="py-1.5 px-2">
                            <div className="font-medium text-[#0F172A]">
                              LIAB-201 Salary Clearing
                            </div>
                            <div className="text-[10px] text-[#444657]">
                              Direct Bank H2H NEFT Batch
                            </div>
                          </td>
                          <td className="py-1.5 px-2 text-right text-[#747689]">—</td>
                          <td className="py-1.5 px-2 text-right font-bold text-[#0F172A]">
                            7,48,202
                          </td>
                        </tr>
                        <tr className="hover:bg-[#acf847]/15">
                          <td className="py-1.5 px-2">
                            <div className="font-medium text-[#0F172A]">
                              LIAB-202 EPF Trust Pool
                            </div>
                            <div className="text-[10px] text-[#444657]">
                              Employee + Employer (12%+12%)
                            </div>
                          </td>
                          <td className="py-1.5 px-2 text-right text-[#747689]">—</td>
                          <td className="py-1.5 px-2 text-right font-bold text-[#0F172A]">
                            54,200
                          </td>
                        </tr>
                        <tr className="hover:bg-[#acf847]/15">
                          <td className="py-1.5 px-2">
                            <div className="font-medium text-[#0F172A]">
                              LIAB-203 ESIC Contribution
                            </div>
                            <div className="text-[10px] text-[#444657]">
                              Under Wage Limit (4.00%)
                            </div>
                          </td>
                          <td className="py-1.5 px-2 text-right text-[#747689]">—</td>
                          <td className="py-1.5 px-2 text-right font-bold text-[#0F172A]">
                            14,800
                          </td>
                        </tr>
                        <tr className="hover:bg-[#acf847]/15">
                          <td className="py-1.5 px-2">
                            <div className="font-medium text-[#0F172A]">
                              LIAB-204 State PT Clearing
                            </div>
                            <div className="text-[10px] text-[#444657]">
                              KA Slab ₹200 + WB Tiered
                            </div>
                          </td>
                          <td className="py-1.5 px-2 text-right text-[#747689]">—</td>
                          <td className="py-1.5 px-2 text-right font-bold text-[#0F172A]">
                            4,200
                          </td>
                        </tr>
                        <tr className="hover:bg-[#acf847]/15">
                          <td className="py-1.5 px-2">
                            <div className="font-medium text-[#0F172A]">
                              LIAB-205 TDS Withholding
                            </div>
                            <div className="text-[10px] text-[#444657]">
                              IT Act Sec 192 Monthly Challan
                            </div>
                          </td>
                          <td className="py-1.5 px-2 text-right text-[#747689]">—</td>
                          <td className="py-1.5 px-2 text-right font-bold text-[#0F172A]">
                            45,600
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Audit Ledger Verified Footer */}
                  <div className="flex items-center justify-between p-2.5 bg-[#acf847]/25 border-[1.5px] border-[#0F172A]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#15803D] text-[18px]">
                        verified_user
                      </span>
                      <span className="text-[10px] font-bold text-[#0F172A]">
                        Variance: 0.00 INR • Ledger Auto-Locked
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#0F172A] font-bold">
                      28-NOV 17:42:01 IST
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: METRICS & TRUST BAR */}
          <section className="w-full px-6 md:px-8 pb-12">
            <div className="max-w-[1440px] mx-auto bg-white border-2 border-[#0F172A] shadow-[4px_4px_0px_#0F172A]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y-2 sm:divide-y-0 sm:divide-x-2 divide-[#0F172A]">
                <div className="p-6 flex flex-col justify-between gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-[#444657]">
                      DISBURSED RUN-RATE
                    </span>
                    <span className="material-symbols-outlined text-[#0024c1] text-[20px]">
                      currency_rupee
                    </span>
                  </div>
                  <div className="font-['Playfair_Display',serif] text-[36px] text-[#0F172A] font-black tracking-tight tabular-nums">
                    ₹480+ CR
                  </div>
                  <p className="text-[12px] text-[#444657]">
                    Processed across 28 states with direct clearing.
                  </p>
                </div>

                <div className="p-6 flex flex-col justify-between gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-[#444657]">
                      LEDGER RECONCILIATION
                    </span>
                    <span className="material-symbols-outlined text-[#15803D] text-[20px]">
                      sync_alt
                    </span>
                  </div>
                  <div className="font-['Playfair_Display',serif] text-[36px] text-[#0F172A] font-black tracking-tight tabular-nums">
                    0.00 INR
                  </div>
                  <p className="text-[12px] text-[#444657]">
                    Unreconciled drift across subsidiary general ledgers.
                  </p>
                </div>

                <div className="p-6 flex flex-col justify-between gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-[#444657]">
                      STATUTORY PRECISION
                    </span>
                    <span className="material-symbols-outlined text-[#0024c1] text-[20px]">
                      gavel
                    </span>
                  </div>
                  <div className="font-['Playfair_Display',serif] text-[36px] text-[#0F172A] font-black tracking-tight tabular-nums">
                    100%
                  </div>
                  <p className="text-[12px] text-[#444657]">
                    PF, ESIC &amp; TDS slabs dynamically updated via MCA sync.
                  </p>
                </div>

                <div className="p-6 flex flex-col justify-between gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-[#444657]">
                      DISBURSEMENT SPEED
                    </span>
                    <span className="material-symbols-outlined text-[#0024c1] text-[20px]">
                      bolt
                    </span>
                  </div>
                  <div className="font-['Playfair_Display',serif] text-[36px] text-[#0F172A] font-black tracking-tight tabular-nums">
                    &lt; 3 MINS
                  </div>
                  <p className="text-[12px] text-[#444657]">
                    Average clearance time for 500-employee batch salary runs.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: 3-CARD ARCHITECTURE STRIP */}
          <section
            id="architecture"
            className="w-full py-16 px-6 md:px-8 bg-[#f3f3f4] border-y-2 border-[#0F172A]"
          >
            <div className="max-w-[1440px] mx-auto flex flex-col gap-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-[#0F172A] pb-6">
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[#0024c1]">
                    CORE INFRASTRUCTURE
                  </span>
                  <h2 className="font-['Playfair_Display',serif] text-[36px] text-[#0F172A] font-bold tracking-tight mt-1">
                    Institutional Architecture Built for Scale
                  </h2>
                </div>
                <p className="text-[14px] text-[#444657] max-w-md">
                  Every component engineered and audited for rigorous Indian statutory governance
                  and double-entry accounting integrity.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Statutory Engine */}
                <div
                  id="statutory-engine"
                  className="bg-white border-2 border-[#0F172A] shadow-[4px_4px_0px_#0F172A] p-6 flex flex-col justify-between"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-[#eeeeee] text-[#0F172A] border-[1.5px] border-[#0F172A] text-[10px] font-bold uppercase">
                        GOVT GATEWAY COMPLIANT
                      </span>
                      <span className="material-symbols-outlined text-[#0024c1]">balance</span>
                    </div>
                    <h3 className="font-['Playfair_Display',serif] text-[28px] font-bold text-[#0F172A]">
                      Indian Statutory Engine
                    </h3>
                    <p className="text-[14px] text-[#444657]">
                      Automated calculations for EPF (12% wage cap at ₹15,000), ESIC (0.75% / 3.25%
                      under ₹21,000), multi-state Professional Tax (KA, MH, WB, TN), and real-time
                      Section 192 TDS brackets (New 115BAC &amp; Old Regime).
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t-[1.5px] border-[#0F172A] flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[12px] tabular-nums bg-[#f9f9f9] p-2 border-[1.5px] border-[#0F172A]">
                      <span className="font-medium text-[#0F172A]">EPF 12% Auto-Ceiling</span>
                      <span className="px-1.5 py-0.5 bg-[#acf847] text-[#0F172A] text-[10px] font-bold">
                        VERIFIED
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[12px] tabular-nums bg-[#f9f9f9] p-2 border-[1.5px] border-[#0F172A]">
                      <span className="font-medium text-[#0F172A]">Sec 192 New Regime Tax</span>
                      <span className="px-1.5 py-0.5 bg-[#acf847] text-[#0F172A] text-[10px] font-bold">
                        SYNCED
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[12px] tabular-nums bg-[#f9f9f9] p-2 border-[1.5px] border-[#0F172A]">
                      <span className="font-medium text-[#0F172A]">Form 24Q Quarterly Return</span>
                      <span className="px-1.5 py-0.5 bg-[#acf847] text-[#0F172A] text-[10px] font-bold">
                        READY
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Double-Entry General Ledger */}
                <div
                  id="double-entry-gl"
                  className="bg-white border-2 border-[#0F172A] shadow-[4px_4px_0px_#0F172A] p-6 flex flex-col justify-between"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-[#eeeeee] text-[#0F172A] border-[1.5px] border-[#0F172A] text-[10px] font-bold uppercase">
                        ATOMIC DRIFT PROTECTION
                      </span>
                      <span className="material-symbols-outlined text-[#0024c1]">
                        account_tree
                      </span>
                    </div>
                    <h3 className="font-['Playfair_Display',serif] text-[28px] font-bold text-[#0F172A]">
                      Double-Entry General Ledger
                    </h3>
                    <p className="text-[14px] text-[#444657]">
                      Zero payroll discrepancy. Every salary computation automatically posts
                      balanced debit and credit vouchers directly into SAP, NetSuite, Zoho, or
                      Tally with full maker-checker dual-signature locks.
                    </p>
                  </div>

                  <div className="mt-6 pt-4 bg-[#eeeeee] p-3 border-[1.5px] border-[#0F172A] font-mono text-[11px] text-[#0F172A]">
                    <div className="flex justify-between items-center text-[#0024c1] font-bold pb-1 border-b border-[#0F172A]/20">
                      <span>POSTING ENGINE</span>
                      <span>2-LEGGED VOUCHER</span>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[#444657]">DR / Cost Center: Engineering</span>
                        <span className="font-bold">₹8,67,002</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#444657]">CR / Liab Pools: Escrow &amp; Bank</span>
                        <span className="font-bold">₹8,67,002</span>
                      </div>
                      <div className="pt-1.5 text-[#15803D] font-bold flex items-center gap-1">
                        <span>✔</span> SHA-256 Checksum Validated
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Host-to-Host NEFT Clearance */}
                <div
                  id="neft-treasury"
                  className="bg-white border-2 border-[#0F172A] shadow-[4px_4px_0px_#0F172A] p-6 flex flex-col justify-between"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-[#eeeeee] text-[#0F172A] border-[1.5px] border-[#0F172A] text-[10px] font-bold uppercase">
                        DIRECT BANK API
                      </span>
                      <span className="material-symbols-outlined text-[#0024c1]">swap_horiz</span>
                    </div>
                    <h3 className="font-['Playfair_Display',serif] text-[28px] font-bold text-[#0F172A]">
                      Host-to-Host NEFT Clearance
                    </h3>
                    <p className="text-[14px] text-[#444657]">
                      One-click bulk salary disbursement via direct H2H API gateways (ICICI, HDFC,
                      Axis, SBI) with instant penny-drop validation and encrypted ISO 20022 payment
                      files.
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t-[1.5px] border-[#0F172A] flex flex-col gap-2 font-mono text-[12px]">
                    <div className="flex items-center justify-between p-2 bg-[#f9f9f9] border-[1.5px] border-[#0F172A]">
                      <span className="font-bold text-[#0F172A]">HDFC Corporate Direct H2H</span>
                      <span className="text-[11px] text-[#15803D] font-bold">28ms • LIVE</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-[#f9f9f9] border-[1.5px] border-[#0F172A]">
                      <span className="font-bold text-[#0F172A]">ICICI CIB Host Connect</span>
                      <span className="text-[11px] text-[#15803D] font-bold">34ms • LIVE</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-[#f9f9f9] border-[1.5px] border-[#0F172A]">
                      <span className="font-bold text-[#0F172A]">Axis / SBI Bulk Gateway</span>
                      <span className="text-[11px] text-[#15803D] font-bold">41ms • LIVE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: WORKFLOW SHOWCASE GRID */}
          <section className="w-full py-16 px-6 md:px-8">
            <div className="max-w-[1440px] mx-auto flex flex-col gap-10">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#0024c1]">
                  FULL CYCLE PAYROLL OS
                </span>
                <h2 className="font-['Playfair_Display',serif] text-[36px] font-bold text-[#0F172A] tracking-tight">
                  Eliminate Reconciliation Friction Across Teams
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Feature Card 1 */}
                <div className="bg-white border-2 border-[#0F172A] shadow-[4px_4px_0px_#0F172A] p-6 lg:p-8 flex flex-col justify-between gap-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-[#0024c1] font-bold">
                      <span className="material-symbols-outlined text-[24px]">fingerprint</span>
                      <span className="text-[10px] tracking-widest uppercase">
                        ATTENDANCE SYNCHRONIZATION
                      </span>
                    </div>
                    <h3 className="font-['Playfair_Display',serif] text-[28px] font-bold text-[#0F172A]">
                      Automated Attendance &amp; LOP Proration
                    </h3>
                    <p className="text-[14px] text-[#444657] leading-relaxed">
                      Integrates seamlessly with biometric terminals, Darwinbox, Zoho People, and
                      Slack check-ins. Calculates working-days vs calendar-days proration
                      automatically, adjusting unearned leaves and salary deductions in real-time.
                    </p>
                  </div>

                  <div className="bg-[#f3f3f4] border-2 border-[#0F172A] p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-[12px] font-bold border-b border-[#0F172A]/20 pb-2">
                      <span className="text-[#0F172A]">Sample Proration: 2.5 Days Unpaid LOP</span>
                      <span className="text-[#ba1a1a] tabular-nums font-bold">-₹14,240.00</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-[12px]">
                      <div className="p-2 bg-white border border-[#0F172A]">
                        <div className="text-[10px] text-[#444657] uppercase font-mono">
                          CALENDAR DAYS
                        </div>
                        <div className="font-bold text-[#0F172A] tabular-nums">30 Days</div>
                      </div>
                      <div className="p-2 bg-white border border-[#0F172A]">
                        <div className="text-[10px] text-[#444657] uppercase font-mono">
                          PAID PAYABLE
                        </div>
                        <div className="font-bold text-[#0F172A] tabular-nums">27.5 Days</div>
                      </div>
                      <div className="p-2 bg-[#acf847]/40 border border-[#0F172A]">
                        <div className="text-[10px] text-[#444657] uppercase font-mono">
                          GROSS ADJUSTED
                        </div>
                        <div className="font-bold text-[#0F172A] tabular-nums">₹1,56,820</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-[12px] font-bold text-[#0F172A]">
                    <span className="flex items-center gap-1 text-[#15803D]">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      Bio-Gate Auto-Pull
                    </span>
                    <span className="flex items-center gap-1 text-[#15803D]">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      Comp-Off Accrual
                    </span>
                    <span className="flex items-center gap-1 text-[#15803D]">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      Zero Manual Excel Work
                    </span>
                  </div>
                </div>

                {/* Feature Card 2 */}
                <div className="bg-white border-2 border-[#0F172A] shadow-[4px_4px_0px_#0F172A] p-6 lg:p-8 flex flex-col justify-between gap-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-[#0024c1] font-bold">
                      <span className="material-symbols-outlined text-[24px]">lock</span>
                      <span className="text-[10px] tracking-widest uppercase">
                        TAX &amp; EMPLOYEE VAULT
                      </span>
                    </div>
                    <h3 className="font-['Playfair_Display',serif] text-[28px] font-bold text-[#0F172A]">
                      Compliant Digital Payslips &amp; Form 16 Vault
                    </h3>
                    <p className="text-[14px] text-[#444657] leading-relaxed">
                      Employee self-service portal with password-protected PDF payslips itemizing
                      Basic, HRA, Special Allowance, PF, and TDS withholding. Generate verified Form
                      16 Part A &amp; Part B with one click at fiscal year-end.
                    </p>
                  </div>

                  <div className="bg-[#f3f3f4] border-2 border-[#0F172A] p-4 flex flex-col gap-2 font-mono text-[11px]">
                    <div className="flex items-center justify-between pb-1 border-b border-[#0F172A]/20">
                      <span className="font-bold text-[#0F172A]">
                        PAYSLIP SAMPLE • PAN: ABCDE1234F
                      </span>
                      <span className="text-[#0024c1] font-bold">DIGITALLY SIGNED</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-[12px] pt-1">
                      <div>
                        <div className="text-[10px] text-[#444657]">EARNINGS</div>
                        <div className="flex justify-between tabular-nums">
                          <span>Basic Salary:</span> <span>₹75,000</span>
                        </div>
                        <div className="flex justify-between tabular-nums">
                          <span>HRA Allowance:</span> <span>₹37,500</span>
                        </div>
                        <div className="flex justify-between tabular-nums">
                          <span>Special Allowance:</span> <span>₹42,500</span>
                        </div>
                      </div>
                      <div className="border-l border-[#0F172A]/20 pl-3">
                        <div className="text-[10px] text-[#444657]">DEDUCTIONS</div>
                        <div className="flex justify-between tabular-nums">
                          <span>Provident Fund:</span> <span>₹1,800</span>
                        </div>
                        <div className="flex justify-between tabular-nums">
                          <span>Professional Tax:</span> <span>₹200</span>
                        </div>
                        <div className="flex justify-between tabular-nums">
                          <span>Income Tax TDS:</span> <span>₹16,400</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-[12px] font-bold text-[#0F172A]">
                    <span className="flex items-center gap-1 text-[#15803D]">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      Form 16 Part A/B
                    </span>
                    <span className="flex items-center gap-1 text-[#15803D]">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      24Q E-Filing Export
                    </span>
                    <span className="flex items-center gap-1 text-[#15803D]">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      WhatsApp Payslip Bot
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 5: HIGH-IMPACT CTA BANNER */}
          <section className="w-full py-16 px-6 md:px-8">
            <div className="max-w-[1440px] mx-auto bg-[#0F172A] border-2 border-[#0F172A] shadow-[6px_6px_0px_#1D4ED8] p-8 md:p-14 text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="flex flex-col gap-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 self-start px-2.5 py-1 bg-[#0024c1] text-white border border-white text-[10px] font-bold uppercase tracking-wider">
                  FAST TURNKEY ROLLOUT
                </div>
                <h2 className="font-['Playfair_Display',serif] text-[36px] sm:text-[44px] font-extrabold text-white tracking-tight leading-tight">
                  Modernize Your Corporate Treasury &amp; Payroll.
                </h2>
                <p className="text-[16px] text-[#e2e2e2]">
                  Deploy RupeeBook across subsidiaries in under 48 hours with pre-configured Tally,
                  SAP, NetSuite, and direct corporate bank gateway adapters.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0 w-full lg:w-auto">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-8 py-4 bg-[#acf847] text-[#0F172A] text-[14px] font-extrabold border-2 border-[#0F172A] shadow-[4px_4px_0px_#FFFFFF] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#FFFFFF] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-transform text-center"
                >
                  Launch Live Console →
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#0F172A] text-[14px] font-extrabold border-2 border-[#0F172A] shadow-[4px_4px_0px_#FFFFFF] hover:bg-[#e8e8e8] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#FFFFFF] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-transform text-center"
                >
                  Explore Sandbox
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-white border-t-[1.5px] border-[#0F172A] mt-10">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8 pt-10 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#0033ff] border-[1.5px] border-[#0F172A] flex items-center justify-center shadow-[2px_2px_0px_#0F172A]">
                  <span className="text-[14px] text-white font-bold">RB</span>
                </div>
                <span className="text-[18px] text-[#1a1c1c] font-extrabold">RupeeBook</span>
              </div>
              <p className="text-[12px] text-[#444657] max-w-xs">
                Algorithmic treasury routing, double-entry payroll ledgering, and multi-entity
                statutory compliance for high-velocity Indian enterprises.
              </p>
              <div className="flex items-center gap-1.5 tabular-nums text-[10px] font-bold text-[#1a1c1c]">
                <span className="w-2.5 h-2.5 bg-[#acf847] border border-[#0F172A]"></span>
                <span>SYSTEMS OPERATIONAL • 99.995% SLA</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-[14px] text-[#1a1c1c] uppercase tracking-wider border-b-[1.5px] border-[#0F172A] pb-1 font-bold">
                Platform Ledger
              </h3>
              <ul className="flex flex-col gap-1 text-[12px] text-[#444657]">
                <li className="hover:text-[#1a1c1c] cursor-pointer">Multi-Entity Balancing</li>
                <li className="hover:text-[#1a1c1c] cursor-pointer">Autonomous TDS &amp; PF Engine</li>
                <li className="hover:text-[#1a1c1c] cursor-pointer">Bulk NEFT/RTGS Gateway</li>
                <li className="hover:text-[#1a1c1c] cursor-pointer">Contractor Escrow Matrix</li>
                <li className="hover:text-[#1a1c1c] cursor-pointer">Audit Trail Immutable Log</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-[14px] text-[#1a1c1c] uppercase tracking-wider border-b-[1.5px] border-[#0F172A] pb-1 font-bold">
                Treasury Core
              </h3>
              <ul className="flex flex-col gap-1 text-[12px] text-[#444657]">
                <li className="hover:text-[#1a1c1c] cursor-pointer">RBI Clearing Integration</li>
                <li className="hover:text-[#1a1c1c] cursor-pointer">Corporate Virtual Accounts</li>
                <li className="hover:text-[#1a1c1c] cursor-pointer">Liquidity Sweep Rules</li>
                <li className="hover:text-[#1a1c1c] cursor-pointer">GST E-Invoicing Engine</li>
                <li className="hover:text-[#1a1c1c] cursor-pointer">Direct Bank Connect (Open API)</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-[14px] text-[#1a1c1c] uppercase tracking-wider border-b-[1.5px] border-[#0F172A] pb-1 font-bold">
                Security &amp; Statutory
              </h3>
              <div className="flex flex-col gap-2 mt-1">
                <div className="p-1.5 border-[1.5px] border-[#0F172A] bg-[#f3f3f4] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-[#0024c1]">
                    verified
                  </span>
                  <span className="text-[10px] font-bold text-[#1a1c1c]">
                    ISO 20022 Financial Messaging
                  </span>
                </div>
                <div className="p-1.5 border-[1.5px] border-[#0F172A] bg-[#f3f3f4] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-[#0024c1]">
                    account_balance
                  </span>
                  <span className="text-[10px] font-bold text-[#1a1c1c]">
                    MCA &amp; CBDT Direct Gateway
                  </span>
                </div>
                <div className="p-1.5 border-[1.5px] border-[#0F172A] bg-[#f3f3f4] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-[#0024c1]">
                    lock
                  </span>
                  <span className="text-[10px] font-bold text-[#1a1c1c]">
                    256-bit Bank Grade Encrypted
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t-[1.5px] border-[#0F172A] flex flex-col md:flex-row items-center justify-between gap-2 text-[12px] font-semibold text-[#444657]">
            <div>
              © 2026 RupeeBook Technologies Pvt Ltd. All rights reserved. Registered RBI TSP
              Architecture.
            </div>
            <div className="flex items-center gap-4">
              <a className="hover:text-[#1a1c1c]" href="#statutory-engine">
                Regulatory Disclosure
              </a>
              <a className="hover:text-[#1a1c1c]" href="#architecture">
                Security Architecture
              </a>
              <Link className="hover:text-[#1a1c1c]" to="/login">
                Console Access
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}