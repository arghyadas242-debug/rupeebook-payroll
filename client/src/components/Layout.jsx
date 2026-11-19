import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  PlayCircle,
  FileText,
  Landmark,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/employees', label: 'Employee Directory', icon: Users },
  { to: '/reconciliation', label: 'Attendance & LOP', icon: CalendarCheck },
  { to: '/payroll/run', label: 'Run Payroll', icon: PlayCircle },
  { to: '/payslips', label: 'Employee Payslips', icon: FileText },
  { to: '/compliance', label: 'Tax & Statutory', icon: Landmark },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex bg-[#0B1120] text-[#F8FAFC]">
      <aside className="no-print w-64 bg-[#1E293B] border-r border-[#334155] flex flex-col">
        <div className="p-6 border-b border-[#334155]">
          <h1 className="text-lg font-bold tracking-tight text-white">
            Payroll<span className="text-blue-500">Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Enterprise Accounting Suite</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#334155] text-xs text-slate-400">
          Cycle: <span className="text-slate-200 font-semibold">Nov 2026</span>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}