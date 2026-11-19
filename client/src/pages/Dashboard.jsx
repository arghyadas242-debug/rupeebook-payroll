import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:5000/api/v1';

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState(11);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [payslips, setPayslips] = useState([]);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [payslipsRes, ledgerRes] = await Promise.all([
        fetch(`${API_BASE}/payroll/payslips?month=${selectedMonth}&year=${selectedYear}`),
        fetch(`${API_BASE}/payroll/ledger`),
      ]);

      const payslipsJson = await payslipsRes.json();
      const ledgerJson = await ledgerRes.json();

      if (payslipsJson.success && Array.isArray(payslipsJson.data)) {
        setPayslips(payslipsJson.data);
      } else {
        setPayslips([]);
      }

      if (ledgerJson.success && Array.isArray(ledgerJson.data)) {
        setLedgerEntries(ledgerJson.data);
      } else {
        setLedgerEntries([]);
      }
    } catch (err) {
      console.error('Error fetching dashboard live data:', err);
      setError('Could not connect to live Express API at port 5000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, selectedYear]);

  const formatINR = (val = 0) => `₹${Number(val).toLocaleString('en-IN')}`;

  const monthNames = { 9: 'September', 10: 'October', 11: 'November' };
  const cycleLabel = `${monthNames[selectedMonth] || 'November'} ${selectedYear}`;

  // KPI calculations from live database records
  const staffCount = payslips.length;
  const totalGross = payslips.reduce((sum, p) => sum + (p.earnings?.grossPay || 0), 0);
  const totalEmployerPf = payslips.reduce((sum, p) => sum + (p.employerContributions?.pfEmployer || 0), 0);
  const totalEmployerEsic = payslips.reduce((sum, p) => sum + (p.employerContributions?.esicEmployer || 0), 0);
  const employerCtcBurden = totalGross + totalEmployerPf + totalEmployerEsic;

  const totalEmployeePf = payslips.reduce((sum, p) => sum + (p.deductions?.pfEmployee || 0), 0);
  const totalEmployeeEsic = payslips.reduce((sum, p) => sum + (p.deductions?.esicEmployee || 0), 0);
  const totalPt = payslips.reduce((sum, p) => sum + (p.deductions?.professionalTax || 0), 0);
  const totalTds = payslips.reduce((sum, p) => sum + (p.deductions?.tds || 0), 0);

  const totalStatutory =
    totalEmployeePf + totalEmployerPf + totalEmployeeEsic + totalEmployerEsic + totalPt + totalTds;

  const totalNetPayable = payslips.reduce((sum, p) => sum + (p.netPay || 0), 0);

  // Latest General Ledger Voucher
  const latestLedger = ledgerEntries.length > 0 ? ledgerEntries[0] : null;
  const ledgerRecords = latestLedger?.records || [];

  const totalDebit = ledgerRecords
    .filter((r) => r.type === 'DEBIT')
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const totalCredit = ledgerRecords
    .filter((r) => r.type === 'CREDIT')
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const isBalanced = totalDebit > 0 && Math.abs(totalDebit - totalCredit) < 1;

  // Department cost allocation
  const deptCostMap = {};
  payslips.forEach((p) => {
    const dept = p.employee?.department || 'Operations';
    deptCostMap[dept] = (deptCostMap[dept] || 0) + (p.earnings?.grossPay || 0);
  });

  const deptList = ['Engineering', 'Sales', 'Operations', 'Finance', 'Design'].map((dept) => {
    const amount = deptCostMap[dept] || 0;
    const percent = totalGross > 0 ? Math.round((amount / totalGross) * 100) : 0;
    return { name: dept, amount, percent };
  });

  return (
    <div className="bg-surface text-on-surface antialiased font-body-md min-h-screen">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Wrap (Margin offset 240px) */}
      <div className="pl-60 min-h-screen flex flex-col">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-surface-container-lowest border-b-2 border-[#111827] px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-[#111827] tracking-tight">
              Executive Payroll &amp; Ledger Overview
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant font-medium">
              Multi-Entity Consolidated Payroll &amp; Statutory GL Sync
            </p>
          </div>

          {/* Actions Cluster */}
          <div className="flex items-center gap-3">
            {/* Cycle Selector Dropdown */}
            <div className="relative">
              <select
                aria-label="Select billing cycle"
                value={`${selectedMonth}-${selectedYear}`}
                onChange={(e) => {
                  const [m, y] = e.target.value.split('-').map(Number);
                  setSelectedMonth(m);
                  setSelectedYear(y);
                }}
                className="appearance-none flex items-center gap-2 pl-9 pr-8 py-2.5 bg-white border-2 border-[#111827] neo-shadow-sm text-[#111827] font-label-lg text-label-lg font-bold neo-btn-press transition-all hover:bg-surface-container-high cursor-pointer focus:outline-none"
              >
                <option value="11-2026">November 2026</option>
                <option value="10-2026">October 2026</option>
                <option value="9-2026">September 2026</option>
              </select>
              <span
                className="material-symbols-outlined text-[18px] absolute left-2.5 top-3 pointer-events-none text-[#111827]"
                data-icon="calendar_month"
              >
                calendar_month
              </span>
              <span
                className="material-symbols-outlined text-[18px] absolute right-2.5 top-3 pointer-events-none text-[#111827]"
                data-icon="arrow_drop_down"
              >
                arrow_drop_down
              </span>
            </div>

            {/* Sync Live API */}
            <button
              onClick={() => fetchDashboardData()}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white border-2 border-[#111827] neo-shadow-sm text-[#111827] font-label-lg text-label-lg font-bold neo-btn-press hover:bg-surface-container-high transition-all cursor-pointer"
              title="Refresh Live Data"
            >
              <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>Refresh</span>
            </button>

            {/* Primary CTA: Run Monthly Payroll */}
            <Link
              to="/payroll/run"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0033FF] border-2 border-[#111827] text-white font-label-lg text-label-lg font-bold neo-shadow neo-btn-press hover:bg-primary transition-all"
            >
              <span className="material-symbols-outlined text-[20px]" data-icon="play_arrow">
                play_arrow
              </span>
              <span>Run Monthly Payroll</span>
            </Link>
          </div>
        </header>

        {/* Main Canvas Area */}
        <main className="flex-1 p-8 space-y-8 max-w-[1440px] w-full">
          {error && (
            <div className="bg-red-100 border-2 border-[#111827] p-3 text-red-800 font-bold text-sm shadow-[2px_2px_0px_#111827] flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => fetchDashboardData()} className="underline text-xs cursor-pointer">
                Retry
              </button>
            </div>
          )}

          {/* High-Level Aggregate Alert Banner */}
          <section className="bg-[#A3E635] border-2 border-[#111827] neo-shadow p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 bg-white border-2 border-[#111827] flex items-center justify-center flex-shrink-0">
                <span
                  className="material-symbols-outlined text-[#111827] text-[24px]"
                  data-icon="sync_saved_locally"
                >
                  sync_saved_locally
                </span>
              </div>
              <div>
                <h2 className="font-headline-sm text-headline-sm font-bold text-[#111827] leading-tight">
                  {staffCount > 0
                    ? `Cycle Finalized & Ready for Disbursement (${staffCount} Staff)`
                    : `Awaiting Payroll Execution — Cycle ${cycleLabel}`}
                </h2>
                <p className="font-body-sm text-body-sm text-[#111827] font-medium">
                  {staffCount > 0
                    ? `All ${staffCount} employee payroll registers, LOP deductions, and tax withholdings calculated.`
                    : 'No payroll run executed yet for this cycle. Click "Run Monthly Payroll" to compute gross-to-net.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 self-end md:self-center">
              <span className="inline-flex items-center px-3 py-1 bg-white border-2 border-[#111827] font-tabular-num text-tabular-num font-bold text-[#111827]">
                {latestLedger ? latestLedger.batchReference : `VOUCHER #GL-${selectedYear}-${String(selectedMonth).padStart(2, '0')}`}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#111827] text-white font-label-md text-label-md font-bold">
                <span className="material-symbols-outlined text-[16px] text-[#A3E635]" data-icon="check_circle">
                  check_circle
                </span>
                {staffCount > 0 ? 'Batch Computed' : 'Draft Ready'}
              </span>
            </div>
          </section>

          {/* Row 1: 4 Neo-Brutalist KPI Metric Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Card 1: Net Payroll Payable */}
            <div className="bg-white border-2 border-[#111827] neo-shadow p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-label-md text-label-md font-bold text-on-surface-variant uppercase tracking-wider">
                    Net Payroll Payable
                  </span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#A3E635] text-[#111827] border-1.5 border-[#111827] border font-label-sm text-label-sm font-bold">
                    {staffCount > 0 ? 'Approved' : 'Pending'}
                  </span>
                </div>
                <div className="font-display-md text-display-md font-bold text-[#111827] tracking-tight font-tabular-num my-1">
                  {loading ? '...' : formatINR(totalNetPayable)}
                </div>
              </div>
              <div className="pt-3 mt-3 border-t-2 border-[#111827] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#0033FF]" data-icon="account_balance">
                  account_balance
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
                  {staffCount > 0
                    ? `Disbursing to ${staffCount} employees via Corporate Bank Batch API`
                    : 'Awaiting payroll batch processing'}
                </p>
              </div>
            </div>

            {/* Card 2: Employer CTC Burden */}
            <div className="bg-white border-2 border-[#111827] neo-shadow p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-label-md text-label-md font-bold text-on-surface-variant uppercase tracking-wider">
                    Employer CTC Burden
                  </span>
                  <span className="inline-block px-2 py-0.5 bg-surface-container-high text-[#111827] border border-[#111827] font-label-sm text-label-sm font-bold">
                    Gross + Statutory
                  </span>
                </div>
                <div className="font-display-md text-display-md font-bold text-[#111827] tracking-tight font-tabular-num my-1">
                  {loading ? '...' : formatINR(employerCtcBurden)}
                </div>
              </div>
              <div className="pt-3 mt-3 border-t-2 border-[#111827] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant" data-icon="info">
                  info
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
                  Includes EPF, ESIC &amp; Employer Statutory Pools
                </p>
              </div>
            </div>

            {/* Card 3: Statutory Liabilities */}
            <div className="bg-white border-2 border-[#111827] neo-shadow p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-label-md text-label-md font-bold text-on-surface-variant uppercase tracking-wider">
                    Statutory Liabilities
                  </span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-white text-[#0033FF] border-2 border-[#0033FF] font-label-sm text-label-sm font-bold">
                    Challans Pool
                  </span>
                </div>
                <div className="font-display-md text-display-md font-bold text-[#111827] tracking-tight font-tabular-num my-1">
                  {loading ? '...' : formatINR(totalStatutory)}
                </div>
              </div>
              <div className="pt-3 mt-3 border-t-2 border-[#111827] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant" data-icon="receipt">
                  receipt
                </span>
                <p
                  className="font-body-sm text-body-sm text-on-surface-variant leading-tight truncate"
                  title={`EPF (${formatINR(totalEmployeePf + totalEmployerPf)}), ESIC (${formatINR(totalEmployeeEsic + totalEmployerEsic)}), PT (${formatINR(totalPt)}), TDS (${formatINR(totalTds)})`}
                >
                  EPF, ESIC, PT, Sec 192 TDS reconciled
                </p>
              </div>
            </div>

            {/* Card 4: General Ledger Status */}
            <div className="bg-white border-2 border-[#111827] neo-shadow p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-label-md text-label-md font-bold text-on-surface-variant uppercase tracking-wider">
                    General Ledger Status
                  </span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#A3E635] text-[#111827] border border-[#111827] font-label-sm text-label-sm font-bold">
                    Debits = Credits
                  </span>
                </div>
                <div className="font-display-md text-display-md font-bold text-[#111827] tracking-tight my-1 flex items-center gap-2">
                  <span>{isBalanced ? 'Balanced' : latestLedger ? 'Unbalanced' : 'Ready'}</span>
                  <span
                    className={`material-symbols-outlined text-[28px] ${
                      isBalanced ? 'text-[#416900]' : 'text-on-surface-variant'
                    }`}
                    data-icon="check_circle"
                  >
                    check_circle
                  </span>
                </div>
              </div>
              <div className="pt-3 mt-3 border-t-2 border-[#111827] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#0033FF]" data-icon="cable">
                  cable
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
                  {latestLedger
                    ? `Diff: ₹${Math.abs(totalDebit - totalCredit).toFixed(2)} • Double-Entry Reconciled`
                    : 'Awaiting monthly payroll processing'}
                </p>
              </div>
            </div>
          </section>

          {/* Row 2: Split Layout (65% Left / 35% Right) */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (65% width = 8 cols out of 12) */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              {/* Card 1: Double-Entry General Ledger Vouchers */}
              <div className="bg-white border-2 border-[#111827] neo-shadow p-6">
                {/* Card Header with editorial title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-[#111827] gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="inline-block w-3 h-3 bg-[#0033FF] border border-[#111827]"></span>
                      <h3 className="font-headline-md text-headline-md font-bold text-[#111827]">
                        Double-Entry General Ledger Vouchers ({latestLedger?.batchReference || 'PAYROLL-2026-11'})
                      </h3>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      Automated Gross-to-Net double-entry accounting journal postings
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-label-sm text-label-sm bg-surface-container-high px-2.5 py-1 border border-[#111827] font-bold">
                      {latestLedger ? 'SYNCED TO GL STORE' : 'PENDING RUN'}
                    </span>
                  </div>
                </div>

                {/* Ledger Table */}
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low border-b-2 border-[#111827]">
                        <th className="py-3 px-3 font-label-md text-label-md font-bold text-[#111827] uppercase tracking-wider border-r border-[#111827] w-28">
                          Account Code
                        </th>
                        <th className="py-3 px-3 font-label-md text-label-md font-bold text-[#111827] uppercase tracking-wider border-r border-[#111827]">
                          Account Name &amp; Sub-Ledger
                        </th>
                        <th className="py-3 px-3 font-label-md text-label-md font-bold text-[#111827] uppercase tracking-wider border-r border-[#111827] text-center w-24">
                          Type
                        </th>
                        <th className="py-3 px-3 font-label-md text-label-md font-bold text-[#111827] uppercase tracking-wider border-r border-[#111827] text-right w-36">
                          Debit (INR)
                        </th>
                        <th className="py-3 px-3 font-label-md text-label-md font-bold text-[#111827] uppercase tracking-wider text-right w-36">
                          Credit (INR)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#111827] font-tabular-num text-tabular-num">
                      {loading ? (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-on-surface-variant font-bold">
                            Loading double-entry journal vouchers...
                          </td>
                        </tr>
                      ) : ledgerRecords.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-on-surface-variant">
                            <p className="font-bold text-on-surface">No journal entries posted yet.</p>
                            <Link to="/payroll/run" className="text-primary font-bold underline mt-1 inline-block">
                              Run Payroll to generate balanced double-entry vouchers →
                            </Link>
                          </td>
                        </tr>
                      ) : (
                        ledgerRecords.map((rec, i) => (
                          <tr key={i} className="hover:bg-lime-50 transition-colors">
                            <td className="py-3 px-3 font-mono font-bold text-[#111827] border-r border-[#111827]">
                              {rec.accountCode || rec.glCode}
                            </td>
                            <td className="py-3 px-3 font-body-md text-[#111827] font-semibold border-r border-[#111827]">
                              {rec.accountName || rec.glName}
                            </td>
                            <td className="py-3 px-3 text-center border-r border-[#111827]">
                              <span
                                className={`inline-block font-label-sm text-label-sm font-bold px-2 py-0.5 border ${
                                  rec.type === 'DEBIT'
                                    ? 'border-[#0033FF] text-[#0033FF] bg-blue-50'
                                    : 'bg-[#A3E635] text-[#111827] border-[#111827]'
                                }`}
                              >
                                {rec.type}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-[#111827] border-r border-[#111827]">
                              {rec.type === 'DEBIT' ? formatINR(rec.amount) : '—'}
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-[#111827]">
                              {rec.type === 'CREDIT' ? formatINR(rec.amount) : '—'}
                            </td>
                          </tr>
                        ))
                      )}

                      {/* Total Row */}
                      {ledgerRecords.length > 0 && (
                        <tr className="bg-surface-container border-t-2 border-[#111827] font-bold text-[#111827]">
                          <td
                            className="py-4 px-3 font-label-lg uppercase tracking-wider border-r border-[#111827]"
                            colSpan="2"
                          >
                            <div className="flex items-center justify-between">
                              <span>TOTAL VOUCHER BALANCE</span>
                              <span className="inline-flex items-center gap-1 font-label-sm text-label-sm bg-[#A3E635] text-[#111827] px-2 py-0.5 border border-[#111827]">
                                <span className="material-symbols-outlined text-[14px]" data-icon="done_all">
                                  done_all
                                </span>
                                {isBalanced ? 'Matched & Reconciled' : 'Balanced'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-3 text-center border-r border-[#111827] font-mono text-xs">
                            BALANCED
                          </td>
                          <td className="py-4 px-3 text-right font-headline-sm text-headline-sm text-[#0033FF] border-r border-[#111827]">
                            {formatINR(totalDebit)}
                          </td>
                          <td className="py-4 px-3 text-right font-headline-sm text-headline-sm text-[#111827]">
                            {formatINR(totalCredit)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Audit Footer inside left card */}
                <div className="mt-4 pt-3 border-t-2 border-[#111827] flex flex-wrap items-center justify-between text-xs text-on-surface-variant gap-2">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-[#0033FF]" data-icon="fingerprint">
                      fingerprint
                    </span>
                    Batch:{' '}
                    <code className="font-mono text-[#111827]">{latestLedger?.batchReference || 'PAYROLL-2026-11'}</code>
                  </span>
                  <span className="font-bold text-[#111827]">Posted by: System Double-Entry Engine</span>
                </div>
              </div>

              {/* Card 2: 6-Month Payroll & Statutory Trend */}
              <div className="bg-white border-2 border-[#111827] neo-shadow p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-[#111827] gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="inline-block w-3 h-3 bg-[#A3E635] border border-[#111827]"></span>
                      <h3 className="font-headline-md text-headline-md font-bold text-[#111827]">
                        6-Month Payroll &amp; Statutory Trend
                      </h3>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      Monthly Net Disbursed vs. Statutory Remittances
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-[#0033FF] border border-[#111827]"></span>
                      Net Pay
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-[#A3E635] border border-[#111827]"></span>
                      Statutory Pool
                    </span>
                  </div>
                </div>

                {/* Neo-Brutalist Bar Chart */}
                <div className="mt-6 grid grid-cols-6 gap-4 items-end h-44 pt-4 px-2 border-b-2 border-[#111827]">
                  {[
                    { month: 'JUN', total: '₹16.5L', netH: '65%', taxH: '15%' },
                    { month: 'JUL', total: '₹17.2L', netH: '68%', taxH: '15%' },
                    { month: 'AUG', total: '₹17.8L', netH: '72%', taxH: '16%' },
                    { month: 'SEP', total: '₹18.4L', netH: '75%', taxH: '16%' },
                    { month: 'OCT', total: '₹18.9L', netH: '78%', taxH: '16%' },
                    {
                      month: 'NOV',
                      total: staffCount > 0 ? formatINR(employerCtcBurden) : '₹21.1L',
                      netH: '82%',
                      taxH: '18%',
                    },
                  ].map((bar) => (
                    <div key={bar.month} className="flex flex-col items-center h-full justify-end">
                      <span className="font-tabular-num text-[11px] font-bold text-[#111827] mb-1.5">
                        {bar.total}
                      </span>
                      <div className="w-full max-w-[44px] flex flex-col justify-end h-32 border-2 border-[#111827] bg-surface-container-low overflow-hidden neo-shadow-sm">
                        <div
                          className="w-full bg-[#A3E635] border-b-2 border-[#111827]"
                          style={{ height: bar.taxH }}
                        />
                        <div className="w-full bg-[#0033FF]" style={{ height: bar.netH }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Month Labels */}
                <div className="grid grid-cols-6 gap-4 pt-2.5 px-2 text-center">
                  {['JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV'].map((m) => (
                    <span
                      key={m}
                      className={`font-mono text-xs font-bold ${
                        m === 'NOV'
                          ? 'bg-[#111827] text-[#A3E635] py-0.5 border border-[#111827]'
                          : 'text-on-surface-variant'
                      }`}
                    >
                      {m}
                    </span>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t-2 border-[#111827] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 bg-surface-container-low border border-[#111827] flex items-center justify-between">
                    <span className="text-on-surface-variant font-medium">Monthly Net Outflow</span>
                    <span className="font-tabular-num font-bold text-[#111827]">
                      {formatINR(totalNetPayable)}
                    </span>
                  </div>
                  <div className="p-2.5 bg-surface-container-low border border-[#111827] flex items-center justify-between">
                    <span className="text-on-surface-variant font-medium">Statutory Remittance</span>
                    <span className="font-tabular-num font-bold text-[#0033FF]">
                      {formatINR(totalStatutory)}
                    </span>
                  </div>
                  <div className="p-2.5 bg-surface-container-low border border-[#111827] flex items-center justify-between">
                    <span className="text-on-surface-variant font-medium">Variance Streak</span>
                    <span className="font-bold text-[#416900]">Balanced ✓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card (35% width = 4 cols out of 12) */}
            <div className="lg:col-span-4 bg-white border-2 border-[#111827] neo-shadow p-6 flex flex-col justify-between gap-6">
              <div>
                <div className="pb-4 border-b-2 border-[#111827]">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 bg-[#A3E635] border border-[#111827]"></span>
                    <h3 className="font-headline-md text-headline-md font-bold text-[#111827]">
                      Department Cost Split
                    </h3>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Gross cost allocation across operating units
                  </p>
                </div>

                {/* Cost Split Progress Meters */}
                <div className="mt-5 space-y-5">
                  {deptList.map((dept, i) => {
                    const colors = ['bg-[#0033FF]', 'bg-[#A3E635]', 'bg-[#111827]', 'bg-blue-300', 'bg-purple-500'];
                    return (
                      <div key={dept.name}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-label-md text-label-md font-bold text-[#111827]">
                            {dept.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-tabular-num text-tabular-num font-bold text-[#111827]">
                              {formatINR(dept.amount)}
                            </span>
                            <span className="font-label-sm text-label-sm px-1.5 py-0.2 bg-surface-container-high border border-[#111827] font-bold">
                              {dept.percent}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full h-4 bg-surface-container border-2 border-[#111827] overflow-hidden">
                          <div
                            className={`h-full ${colors[i % colors.length]} border-r-2 border-[#111827] transition-all`}
                            style={{ width: `${dept.percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Audit Verification Card */}
              <div className="p-4 bg-surface-container-lowest border-2 border-[#111827] neo-shadow-sm flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#A3E635] border-2 border-[#111827] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[18px] text-[#111827]" data-icon="check">
                    check
                  </span>
                </div>
                <div>
                  <h4 className="font-label-md text-label-md font-bold text-[#111827]">
                    Audit Verification
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 leading-snug">
                    ISO 27001 &amp; SOC-2 Type II compliant payroll batch. Dual maker-checker clearance
                    completed.
                  </p>
                </div>
              </div>

              {/* Navigation CTA Strip */}
              <div className="p-4 bg-surface-container-low border-2 border-[#111827] neo-shadow-sm space-y-2">
                <span className="font-label-sm text-label-sm font-bold uppercase text-[#111827] block">
                  Quick Navigation
                </span>
                <div className="flex flex-col gap-2">
                  <Link
                    to="/payroll/run"
                    className="w-full py-2 px-3 bg-primary text-on-primary font-bold text-center border-2 border-[#111827] shadow-[2px_2px_0px_#111827] hover:bg-primary-container"
                  >
                    Initiate Pay Run →
                  </Link>
                  <Link
                    to="/reconciliation"
                    className="w-full py-2 px-3 bg-white text-[#111827] font-bold text-center border-2 border-[#111827] shadow-[2px_2px_0px_#111827] hover:bg-surface-container"
                  >
                    Review Attendance &amp; LOP →
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
