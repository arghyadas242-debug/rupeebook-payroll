import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      label: 'Dashboard',
      to: '/dashboard',
      icon: 'account_balance',
      isActive: pathname === '/' || pathname === '/dashboard',
    },
    {
      label: 'Employee Directory',
      to: '/employees',
      icon: 'lan',
      isActive: pathname === '/employees',
    },
    {
      label: 'Attendance & LOP',
      to: '/reconciliation',
      icon: 'event_busy',
      isActive: pathname === '/reconciliation',
    },
    {
      label: 'Run Payroll',
      to: '/payroll/run',
      icon: 'receipt_long',
      isActive: pathname === '/payroll/run',
    },
    {
      label: 'Employee Payslips',
      to: '/payslips',
      icon: 'description',
      isActive: pathname.startsWith('/payslips'),
    },
    {
      label: 'Tax & Statutory',
      to: '/compliance',
      icon: 'verified_user',
      isActive: pathname === '/compliance',
    },
    {
      label: 'Settings',
      to: '/settings',
      icon: 'settings',
      isActive: pathname === '/settings',
    },
  ];

  return (
    <aside className="w-60 fixed left-0 top-0 h-full bg-surface-container-lowest brutal-border-r shadow-[4px_0px_0px_#111827] flex flex-col justify-between p-space-md select-none z-40">
      {/* Top Branding & Nav Cluster */}
      <div>
        {/* Institutional Monogram Emblem & Brand */}
        <div className="flex items-center gap-space-sm pb-space-md brutal-border-b">
          <div className="w-10 h-10 bg-primary text-on-primary font-headline-sm text-headline-sm flex items-center justify-center brutal-border brutal-shadow-sm">
            RB
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">
              RupeeBook
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant tracking-wider font-semibold">
              MULTI-ENTITY TREASURY
            </span>
          </div>
        </div>

        {/* Quick Pay Run CTA */}
        <div className="pt-space-md pb-space-sm">
          <button
            type="button"
            onClick={() => navigate('/payroll/run')}
            className="w-full bg-secondary-container text-on-secondary-fixed font-label-lg text-label-lg py-2.5 px-3 brutal-border brutal-shadow brutal-btn-hover brutal-btn-active flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined">payments</span>
            <span>Initiate Pay Run</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav aria-label="Main Navigation" className="mt-space-md space-y-1.5">
          {navItems.map((item) =>
            item.isActive ? (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center justify-between px-3 py-2 bg-primary text-on-primary font-label-lg text-label-lg brutal-border brutal-shadow-sm transition-all duration-150"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <span className="w-2 h-2 bg-secondary-fixed rounded-full"></span>
              </Link>
            ) : (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 px-3 py-2 bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container brutal-border-thin brutal-btn-hover brutal-btn-active transition-all duration-150 font-label-md text-label-md"
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          )}
        </nav>
      </div>

      {/* Bottom Container: System Ledger Sync & Active Cycle Indicator */}
      <div className="space-y-space-sm pt-space-md brutal-border-t">
        {/* Sync Status Card */}
        <div className="p-2.5 bg-surface-container-low brutal-border-thin">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2.5 h-2.5 bg-secondary-fixed rounded-full inline-block border border-on-surface animate-pulse"></span>
            <span className="font-label-sm text-label-sm font-bold text-on-surface tracking-wide">
              LEDGER SYNC: GL API
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-tight">
            Biometric Gateway connected. Instant clock-in auto-ingested.
          </p>
        </div>

        {/* Locked Cycle Indicator */}
        <div className="flex items-center justify-between p-2 bg-surface brutal-border-thin">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">check_circle</span>
            <span className="font-label-md text-label-md font-semibold text-on-surface">
              Cycle Nov 2026
            </span>
          </div>
          <span className="font-label-sm text-label-sm bg-secondary-container text-on-secondary-fixed px-1.5 py-0.5 rounded-full border border-on-surface font-bold">
            Active
          </span>
        </div>

        {/* Sign Out Action */}
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem('rupeebook_token');
            localStorage.removeItem('rupeebook_user');
            navigate('/login');
          }}
          className="w-full mt-1.5 py-2 px-3 bg-surface-container-lowest text-error font-label-md text-label-md font-bold brutal-border-thin brutal-btn-hover brutal-btn-active flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
