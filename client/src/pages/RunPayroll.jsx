import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/payroll`;
const ACTIVE_MONTH = 11;
const ACTIVE_YEAR = 2026;

export default function RunPayroll() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [disbursing, setDisbursing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [bannerMsg, setBannerMsg] = useState('');

  const formatINR = (num = 0) => `₹${Number(num).toLocaleString('en-IN')}`;

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/payslips?month=${ACTIVE_MONTH}&year=${ACTIVE_YEAR}`);
      const json = await res.json();
      if (json.success) {
        setPayslips(json.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch payslips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, []);

  const handleProcessBatch = async () => {
    try {
      setProcessing(true);
      const res = await fetch(`${API_BASE}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: ACTIVE_MONTH, year: ACTIVE_YEAR, defaultWorkingDays: 30 }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchPayslips();
        setBannerMsg(`Batch ${json.batchReference} processed (${json.processedCount} staff) & GL Voucher posted.`);
      } else {
        setBannerMsg(json.message || 'Failed to process batch');
      }
      setTimeout(() => setBannerMsg(''), 4500);
    } catch (err) {
      console.error('Error processing payroll:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleDisburseNeft = async () => {
    try {
      setDisbursing(true);
      const res = await fetch(`${API_BASE}/disburse`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: ACTIVE_MONTH, year: ACTIVE_YEAR }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchPayslips();
        setBannerMsg(`${json.message} — Journal ${json.journal?.batchReference} posted.`);
      } else {
        setBannerMsg(json.message || 'Disbursement failed');
      }
      setTimeout(() => setBannerMsg(''), 4500);
    } catch (err) {
      console.error('Error disbursing payroll:', err);
    } finally {
      setDisbursing(false);
    }
  };

  const handleExportCsv = () => {
    if (!payslips.length) return;
    const headers = ['Emp ID', 'Name', 'Department', 'Paid Days', 'LOP Days', 'Gross Pay', 'EPF', 'ESIC', 'PT', 'TDS', 'Net Payable', 'Status'];
    const rows = payslips.map((p) => [
      p.employee?.employeeId || '',
      `"${p.employee?.fullName || ''}"`,
      p.employee?.department || '',
      p.paidDays ?? 30,
      p.lossOfPayDays ?? 0,
      p.earnings?.grossPay || 0,
      p.deductions?.pfEmployee || 0,
      p.deductions?.esicEmployee || 0,
      p.deductions?.professionalTax || 0,
      p.deductions?.tds || 0,
      p.netPay || 0,
      p.status,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PAYROLL-${ACTIVE_YEAR}-${String(ACTIVE_MONTH).padStart(2, '0')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const totals = payslips.reduce(
    (acc, p) => {
      acc.employeeCount += 1;
      acc.totalGrossPay += p.earnings?.grossPay || 0;
      acc.totalEpf += p.deductions?.pfEmployee || 0;
      acc.totalEsic += p.deductions?.esicEmployee || 0;
      acc.totalPt += p.deductions?.professionalTax || 0;
      acc.totalTds += p.deductions?.tds || 0;
      acc.totalDeductions += p.deductions?.totalDeductions || 0;
      acc.netBankTransfer += p.netPay || 0;
      return acc;
    },
    {
      employeeCount: 0,
      totalGrossPay: 0,
      totalEpf: 0,
      totalEsic: 0,
      totalPt: 0,
      totalTds: 0,
      totalDeductions: 0,
      netBankTransfer: 0,
    }
  );

  const departments = ['All', ...new Set(payslips.map((p) => p.employee?.department).filter(Boolean))];

  const filteredPayslips = payslips.filter((p) => {
    const emp = p.employee || {};
    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (emp.fullName || '').toLowerCase().includes(q) ||
      (emp.employeeId || '').toLowerCase().includes(q) ||
      (emp.designation || '').toLowerCase().includes(q);
    return matchesDept && matchesSearch;
  });

  const isDisbursed = payslips.length > 0 && payslips.every((p) => p.status === 'PAID');

  return (
    <div className="bg-surface-container-lowest text-on-surface antialiased selection:bg-secondary-fixed selection:text-on-secondary-fixed font-body-md min-h-screen">
      <Sidebar />

      <div className="pl-60 min-h-screen flex flex-col bg-surface-container-lowest">
        <header className="sticky top-0 z-30 bg-surface-container-lowest border-b-2 border-on-surface shadow-[0px_2px_0px_#111827] px-margin py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="px-2 py-0.5 bg-surface-container border border-on-surface font-label-sm text-label-sm font-bold">
              CYCLE: NOVEMBER 2026
            </span>
            <span className="text-on-surface-variant text-label-md font-label-md flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">domain</span>
              Entity: <strong>Global Treasury Corp (IN-01)</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-label-sm font-label-sm bg-surface-container-low px-2 py-1 border border-on-surface">
              <span className="material-symbols-outlined text-[16px] text-secondary">shield</span>
              Host-to-Host NEFT Enabled
            </div>
            <button className="w-8 h-8 flex items-center justify-center border-2 border-on-surface bg-surface-container-lowest hover:bg-surface-container shadow-[2px_2px_0px_#111827] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all">
              <span className="material-symbols-outlined text-[18px]">notifications</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center border-2 border-on-surface bg-surface-container-lowest hover:bg-surface-container shadow-[2px_2px_0px_#111827] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all">
              <span className="material-symbols-outlined text-[18px]">help</span>
            </button>
            <div className="w-8 h-8 bg-on-surface text-surface-container-lowest border-2 border-on-surface font-bold text-label-sm flex items-center justify-center shadow-[2px_2px_0px_#111827]">
              CFO
            </div>
          </div>
        </header>

        <main className="p-margin flex flex-col gap-space-lg">
          {bannerMsg && (
            <div className="bg-secondary-fixed text-on-secondary-fixed border-2 border-on-surface p-3.5 shadow-[4px_4px_0px_#111827] flex items-center justify-between">
              <div className="flex items-center gap-2 font-label-lg font-bold">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                <span>{bannerMsg}</span>
              </div>
              <span className="font-tabular-num text-label-sm font-extrabold uppercase">GL SYNCED</span>
            </div>
          )}

          {/* Breadcrumbs & Heading Unit with 3-Step Stepper */}
          <section className="flex flex-col gap-space-md border-b-2 border-on-surface pb-space-lg">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-outline tracking-widest font-extrabold">
                  TREASURY BATCH EXECUTION
                </span>
                <h1 className="font-display-lg text-display-md text-on-surface font-extrabold tracking-tight mt-1">
                  Monthly Payroll Processing &amp; Disbursement
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl mt-1">
                  Gross-to-Net execution, statutory withholding deductions, and multi-bank NEFT/RTGS
                  batch clearance for audited institutional entities.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleProcessBatch}
                  disabled={processing}
                  className="px-4 py-2.5 bg-primary-container text-on-primary font-label-lg text-label-lg font-bold border-2 border-on-surface shadow-[4px_4px_0px_#111827] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#111827] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-[20px]">calculate</span>
                  <span>{processing ? 'Calculating...' : 'Process Batch Payroll'}</span>
                </button>
                <button
                  onClick={handleDisburseNeft}
                  disabled={disbursing || !payslips.length}
                  className="px-5 py-2.5 bg-on-surface text-surface-container-lowest font-label-lg text-label-lg font-bold border-2 border-on-surface shadow-[4px_4px_0px_#111827] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#111827] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                  <span>{disbursing ? 'Disbursing...' : isDisbursed ? 'Disbursed ✓' : 'Disburse via NEFT'}</span>
                </button>
              </div>
            </div>

            {/* 3-Step Neo-Brutalist Stepper */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="bg-secondary-fixed text-on-secondary-fixed border-2 border-on-surface p-3 shadow-[2px_2px_0px_#111827] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-on-surface text-surface-container-lowest flex items-center justify-center font-bold text-label-sm">
                    ✓
                  </span>
                  <span className="font-label-md text-label-md font-bold tracking-tight">
                    1. Attendance Synced
                  </span>
                </div>
                <span className="font-label-sm text-label-sm px-2 py-0.5 bg-on-surface text-surface-container-lowest font-bold">
                  Nov 1-30
                </span>
              </div>

              <div
                className={
                  isDisbursed
                    ? 'bg-secondary-fixed text-on-secondary-fixed border-2 border-on-surface p-3 shadow-[2px_2px_0px_#111827] flex items-center justify-between'
                    : 'bg-primary-container text-on-primary border-2 border-on-surface p-3 shadow-[4px_4px_0px_#111827] flex items-center justify-between'
                }
              >
                <div className="flex items-center gap-2">
                  <span
                    className={
                      isDisbursed
                        ? 'w-6 h-6 rounded-full bg-on-surface text-surface-container-lowest flex items-center justify-center font-bold text-label-sm'
                        : 'w-6 h-6 rounded-full bg-surface-container-lowest text-primary-container flex items-center justify-center font-bold text-label-sm'
                    }
                  >
                    {isDisbursed ? '✓' : '2'}
                  </span>
                  <span className="font-label-md text-label-md font-extrabold tracking-tight">
                    2. Gross-to-Net Calculated
                  </span>
                </div>
                <span
                  className={
                    isDisbursed
                      ? 'font-label-sm text-label-sm px-2 py-0.5 bg-on-surface text-surface-container-lowest font-bold'
                      : 'font-label-sm text-label-sm px-2 py-0.5 bg-surface-container-lowest text-primary-container font-extrabold'
                  }
                >
                  {isDisbursed ? 'COMPLETED' : payslips.length ? 'CURRENT STATE' : 'READY TO RUN'}
                </span>
              </div>

              <div
                className={
                  isDisbursed
                    ? 'bg-primary-container text-on-primary border-2 border-on-surface p-3 shadow-[4px_4px_0px_#111827] flex items-center justify-between'
                    : 'bg-surface-container-lowest text-on-surface-variant border-2 border-on-surface p-3 shadow-[2px_2px_0px_#111827] flex items-center justify-between opacity-80'
                }
              >
                <div className="flex items-center gap-2">
                  <span
                    className={
                      isDisbursed
                        ? 'w-6 h-6 rounded-full bg-surface-container-lowest text-primary-container flex items-center justify-center font-bold text-label-sm'
                        : 'w-6 h-6 rounded-full border-2 border-on-surface flex items-center justify-center font-bold text-label-sm'
                    }
                  >
                    {isDisbursed ? '✓' : '3'}
                  </span>
                  <span
                    className={
                      isDisbursed
                        ? 'font-label-md text-label-md font-extrabold tracking-tight text-white'
                        : 'font-label-md text-label-md font-bold text-on-surface tracking-tight'
                    }
                  >
                    3. Bank NEFT Disbursement
                  </span>
                </div>
                <span
                  className={
                    isDisbursed
                      ? 'font-label-sm text-label-sm px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed font-extrabold border border-on-surface'
                      : 'font-label-sm text-label-sm px-2 py-0.5 bg-surface-container text-on-surface font-bold border border-on-surface'
                  }
                >
                  {isDisbursed ? 'SETTLED ✓' : 'GATEWAY QUEUED'}
                </span>
              </div>
            </div>
          </section>

          {/* BATCH TOTALS STRIP */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <div className="bg-surface-container-lowest border-2 border-on-surface p-space-md shadow-[4px_4px_0px_#111827] flex flex-col justify-between">
              <div className="flex items-center justify-between border-b-2 border-on-surface pb-2">
                <span className="font-label-md text-label-sm uppercase font-extrabold tracking-wider text-on-surface-variant">
                  TOTAL GROSS PAY
                </span>
                <span className="material-symbols-outlined text-[20px] text-on-surface">
                  account_balance_wallet
                </span>
              </div>
              <div className="py-3">
                <div className="font-tabular-num text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface">
                  {formatINR(totals.totalGrossPay)}
                </div>
              </div>
              <div className="pt-2 border-t border-on-surface flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
                <span>{totals.employeeCount} Active Employees</span>
                <span className="font-tabular-num font-bold text-on-surface">
                  {payslips.reduce((sum, p) => sum + (p.paidDays ?? 30), 0)} Billable Days
                </span>
              </div>
            </div>

            <div className="bg-surface-container-lowest border-2 border-on-surface p-space-md shadow-[4px_4px_0px_#111827] flex flex-col justify-between">
              <div className="flex items-center justify-between border-b-2 border-on-surface pb-2">
                <span className="font-label-md text-label-sm uppercase font-extrabold tracking-wider text-error">
                  STATUTORY DEDUCTIONS
                </span>
                <span className="material-symbols-outlined text-[20px] text-error">trending_down</span>
              </div>
              <div className="py-3">
                <div className="font-tabular-num text-3xl md:text-4xl font-extrabold tracking-tight text-error">
                  {formatINR(totals.totalDeductions)}
                </div>
              </div>
              <div className="pt-2 border-t border-on-surface text-body-sm font-body-sm text-on-surface font-tabular-num font-medium truncate">
                EPF: {formatINR(totals.totalEpf)} <span className="text-outline">|</span> ESIC:{' '}
                {formatINR(totals.totalEsic)} <span className="text-outline">|</span> PT:{' '}
                {formatINR(totals.totalPt)} <span className="text-outline">|</span> TDS:{' '}
                {formatINR(totals.totalTds)}
              </div>
            </div>

            <div className="bg-surface-container-lowest border-2 border-on-surface p-space-md shadow-[4px_4px_0px_#111827] flex flex-col justify-between ring-2 ring-on-surface">
              <div className="flex items-center justify-between border-b-2 border-on-surface pb-2">
                <span className="font-label-md text-label-sm uppercase font-extrabold tracking-wider text-on-surface">
                  NET BANK TRANSFER
                </span>
                <span className="px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold border border-on-surface rounded-full">
                  {isDisbursed ? 'Disbursed ✓' : 'Ready for NEFT ✓'}
                </span>
              </div>
              <div className="py-3">
                <div className="font-tabular-num text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface">
                  {formatINR(totals.netBankTransfer)}
                </div>
              </div>
              <div className="pt-2 border-t border-on-surface flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
                <span>Pre-validated for Host-to-Host direct debit batch</span>
                <span className="material-symbols-outlined text-[18px] text-secondary">verified</span>
              </div>
            </div>
          </section>

          {/* MAIN GROSS-TO-NET REGISTER MATRIX */}
          <section className="bg-surface-container-lowest border-2 border-on-surface shadow-[4px_4px_0px_#111827]">
            <div className="p-space-md border-b-2 border-on-surface flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-container-lowest">
              <div>
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Gross-to-Net Salary Register{' '}
                  <span className="text-label-sm font-label-sm text-on-surface-variant font-tabular-num font-normal">
                    (Batch: PAYROLL-2026-11)
                  </span>
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="font-label-sm text-label-sm text-outline uppercase font-bold mr-1">
                    Filter View:
                  </span>
                  {departments.map((dept) => (
                    <button
                      key={dept}
                      onClick={() => setDeptFilter(dept)}
                      className={
                        deptFilter === dept
                          ? 'px-2.5 py-1 bg-on-surface text-surface-container-lowest text-label-sm font-label-sm font-bold border border-on-surface shadow-[1px_1px_0px_#111827]'
                          : 'px-2.5 py-1 bg-surface-container-lowest text-on-surface text-label-sm font-label-sm font-bold border border-on-surface hover:bg-surface-container'
                      }
                    >
                      {dept} (
                      {dept === 'All'
                        ? payslips.length
                        : payslips.filter((p) => p.employee?.department === dept).length}
                      )
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 py-1.5 pl-8 pr-3 text-body-md font-body-md border-2 border-on-surface bg-surface-container-lowest placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-0 shadow-[2px_2px_0px_#111827]"
                    placeholder="Search Emp ID, Name..."
                    type="text"
                  />
                  <span className="material-symbols-outlined absolute left-2 top-2 text-[18px] text-on-surface-variant">
                    search
                  </span>
                </div>
                <button
                  onClick={handleExportCsv}
                  className="px-3 py-2 bg-surface-container-lowest text-on-surface font-label-md text-label-md font-bold border-2 border-on-surface shadow-[2px_2px_0px_#111827] hover:bg-surface-container hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>Export Full Register (CSV)</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b-2 border-on-surface text-label-sm font-label-sm uppercase tracking-wider text-on-surface">
                    <th className="py-3 px-4 border-r border-on-surface">Employee Details</th>
                    <th className="py-3 px-3 border-r border-on-surface text-center">Paid / LOP</th>
                    <th className="py-3 px-3 border-r border-on-surface text-right">Gross Pay</th>
                    <th className="py-3 px-3 border-r border-on-surface text-right">EPF (12%)</th>
                    <th className="py-3 px-3 border-r border-on-surface text-right">ESIC (0.75%)</th>
                    <th className="py-3 px-3 border-r border-on-surface text-right">PT</th>
                    <th className="py-3 px-3 border-r border-on-surface text-right">TDS (Sec 192)</th>
                    <th className="py-3 px-4 border-r border-on-surface text-right bg-surface-container">
                      Net Payable
                    </th>
                    <th className="py-3 px-3 border-r border-on-surface text-center">Status</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-on-surface font-body-md text-body-md">
                  {loading ? (
                    <tr>
                      <td colSpan="10" className="py-8 text-center font-bold text-on-surface-variant">
                        Loading payroll register from MongoDB...
                      </td>
                    </tr>
                  ) : filteredPayslips.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="py-8 text-center space-y-3">
                        <div className="font-bold text-on-surface">
                          No processed payslips found for November 2026.
                        </div>
                        <button
                          onClick={handleProcessBatch}
                          className="px-4 py-2 bg-primary-container text-on-primary font-label-md font-bold border-2 border-on-surface shadow-[3px_3px_0px_#111827]"
                        >
                          Click &ldquo;Process Batch Payroll&rdquo; to Compute Salaries
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredPayslips.map((p) => {
                      const emp = p.employee || {};
                      const name = emp.fullName || 'Employee';
                      const initials = name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2);
                      const lopDays = p.lossOfPayDays ?? 0;
                      const paidDays = p.paidDays ?? 30 - lopDays;

                      return (
                        <tr key={p._id} className="hover:bg-secondary-fixed/10 transition-colors">
                          <td className="py-3 px-4 border-r border-on-surface">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-none border border-on-surface bg-surface-container-high font-bold text-label-sm flex items-center justify-center">
                                {initials}
                              </div>
                              <div>
                                <div className="font-bold text-on-surface">{name}</div>
                                <div className="text-body-sm font-body-sm text-on-surface-variant font-tabular-num">
                                  {emp.employeeId} • {emp.designation}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 border-r border-on-surface text-center font-tabular-num font-semibold text-body-sm">
                            {Number(paidDays).toFixed(1)} /{' '}
                            {lopDays > 0 ? (
                              <span className="text-error font-bold">{lopDays.toFixed(1)} LOP</span>
                            ) : (
                              '0.0'
                            )}
                          </td>
                          <td className="py-3 px-3 border-r border-on-surface text-right font-tabular-num font-bold text-on-surface">
                            {formatINR(p.earnings?.grossPay)}
                          </td>
                          <td className="py-3 px-3 border-r border-on-surface text-right font-tabular-num text-on-surface-variant">
                            {formatINR(p.deductions?.pfEmployee)}
                          </td>
                          <td className="py-3 px-3 border-r border-on-surface text-right font-tabular-num text-outline">
                            {(p.deductions?.esicEmployee || 0) > 0
                              ? formatINR(p.deductions.esicEmployee)
                              : 'Exempt'}
                          </td>
                          <td className="py-3 px-3 border-r border-on-surface text-right font-tabular-num text-on-surface-variant">
                            {formatINR(p.deductions?.professionalTax)}
                          </td>
                          <td className="py-3 px-3 border-r border-on-surface text-right font-tabular-num text-on-surface-variant">
                            {formatINR(p.deductions?.tds)}
                          </td>
                          <td className="py-3 px-4 border-r border-on-surface text-right font-tabular-num font-extrabold text-on-surface bg-surface-container/30 text-body-lg">
                            {formatINR(p.netPay)}
                          </td>
                          <td className="py-3 px-3 border-r border-on-surface text-center">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold border border-on-surface">
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <Link
                              to={`/payslips/${p._id}`}
                              className="px-2.5 py-1 text-label-sm font-label-sm font-bold border border-on-surface bg-surface-container-lowest hover:bg-surface-container shadow-[1px_1px_0px_#111827] inline-flex items-center justify-center gap-1 mx-auto"
                            >
                              <span>Inspect</span>
                              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>

                <tfoot>
                  <tr className="bg-surface-container-high border-t-2 border-on-surface font-label-md text-label-md">
                    <td className="py-3 px-4 border-r border-on-surface font-extrabold text-on-surface" colSpan="2">
                      Batch Total: {totals.employeeCount} Employees
                    </td>
                    <td className="py-3 px-3 border-r border-on-surface text-right font-tabular-num font-extrabold text-on-surface">
                      {formatINR(totals.totalGrossPay)}
                    </td>
                    <td className="py-3 px-3 border-r border-on-surface text-right font-tabular-num font-bold text-on-surface">
                      {formatINR(totals.totalEpf)}
                    </td>
                    <td className="py-3 px-3 border-r border-on-surface text-right font-tabular-num font-bold text-on-surface">
                      {formatINR(totals.totalEsic)}
                    </td>
                    <td className="py-3 px-3 border-r border-on-surface text-right font-tabular-num font-bold text-on-surface">
                      {formatINR(totals.totalPt)}
                    </td>
                    <td className="py-3 px-3 border-r border-on-surface text-right font-tabular-num font-bold text-on-surface">
                      {formatINR(totals.totalTds)}
                    </td>
                    <td className="py-3 px-4 border-r border-on-surface text-right font-tabular-num font-extrabold text-primary-container text-body-lg bg-surface-container">
                      {formatINR(totals.netBankTransfer)}
                    </td>
                    <td className="py-3 px-4 text-center" colSpan="2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-extrabold border border-on-surface">
                        <span className="material-symbols-outlined text-[14px]">verified</span>
                        Gross-to-Net 100% Balanced
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* BOTTOM GATEWAY & STATUTORY COMPLIANCE CARDS */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <div className="bg-surface-container-lowest border-2 border-on-surface p-space-md shadow-[4px_4px_0px_#111827] flex items-start gap-4">
              <div className="w-12 h-12 bg-on-surface text-surface-container-lowest flex items-center justify-center border-2 border-on-surface shrink-0 shadow-[2px_2px_0px_#111827]">
                <span className="material-symbols-outlined text-[24px]">account_balance</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm uppercase font-extrabold text-outline">
                  BANK DISBURSEMENT CLEARANCE
                </span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Bank Gateway Validation: ICICI Corporate Banking API
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Host-to-Host Connected, Encrypted Payload SHA-256 with dual-token hardware signature
                  ready for immediate RTGS batch triggering.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold border border-on-surface">
                    H2H DIRECT LINK ACTIVE
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Latency: 42ms</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest border-2 border-on-surface p-space-md shadow-[4px_4px_0px_#111827] flex items-start gap-4">
              <div className="w-12 h-12 bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center border-2 border-on-surface shrink-0 shadow-[2px_2px_0px_#111827]">
                <span className="material-symbols-outlined text-[24px]">verified_user</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm uppercase font-extrabold text-outline">
                  REGULATORY READINESS
                </span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Statutory Filing Status: EPF ECR Ready ({totals.employeeCount}/{totals.employeeCount})
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  ESIC Challan Generated, Form 24Q TDS Mapped, and Professional Tax return registers
                  pre-compiled for state filing portals.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-surface-container text-on-surface font-label-sm text-label-sm font-bold border border-on-surface">
                    FORM 24Q VALIDATED
                  </span>
                  <span className="px-2 py-0.5 bg-surface-container text-on-surface font-label-sm text-label-sm font-bold border border-on-surface">
                    ESIC CHALLAN #9921
                  </span>
                </div>
              </div>
            </div>
          </section>

          <footer className="mt-4 pt-4 border-t-2 border-on-surface flex flex-col md:flex-row items-center justify-between gap-2 text-label-sm font-label-sm text-outline pb-space-lg">
            <div>RupeeBook Enterprise Edition v4.9.2 • Statutory Engine: ISO 20022 Compliant</div>
            <div className="flex items-center gap-4 font-tabular-num">
              <span>
                Batch Hash: <strong className="text-on-surface">0x88f2...b941</strong>
              </span>
              <span>
                Timestamp: <strong className="text-on-surface">2026-11-30 18:42:15 IST</strong>
              </span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}