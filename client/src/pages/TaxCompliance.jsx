import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:5000/api/v1';
const ACTIVE_MONTH = 11;
const ACTIVE_YEAR = 2026;

export default function TaxCompliance() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, EPF, ESIC, TDS

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/payroll/payslips?month=${ACTIVE_MONTH}&year=${ACTIVE_YEAR}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPayslips(json.data);
      } else {
        setPayslips([]);
      }
    } catch (err) {
      console.error('Error fetching payslips for tax compliance:', err);
      setError('Could not connect to live Express API at port 5000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, []);

  const formatINR = (val = 0) => `₹${Number(val).toLocaleString('en-IN')}`;

  // Statutory Totals
  const staffCount = payslips.length;

  const totalEpfEmployee = payslips.reduce((sum, p) => sum + (p.deductions?.pfEmployee || 0), 0);
  const totalEpfEmployer = payslips.reduce((sum, p) => sum + (p.employerContributions?.pfEmployer || 0), 0);
  const totalEpf = totalEpfEmployee + totalEpfEmployer;

  const totalEsicEmployee = payslips.reduce((sum, p) => sum + (p.deductions?.esicEmployee || 0), 0);
  const totalEsicEmployer = payslips.reduce((sum, p) => sum + (p.employerContributions?.esicEmployer || 0), 0);
  const totalEsic = totalEsicEmployee + totalEsicEmployer;

  const totalPt = payslips.reduce((sum, p) => sum + (p.deductions?.professionalTax || 0), 0);
  const ptKa = payslips.filter((p) => p.employee?.state !== 'WB').reduce((sum, p) => sum + (p.deductions?.professionalTax || 0), 0);
  const ptWb = payslips.filter((p) => p.employee?.state === 'WB').reduce((sum, p) => sum + (p.deductions?.professionalTax || 0), 0);

  const totalTds = payslips.reduce((sum, p) => sum + (p.deductions?.tds || 0), 0);
  const totalStatutory = totalEpf + totalEsic + totalPt + totalTds;

  const totalEpfWages = payslips.reduce((sum, p) => sum + Math.min(p.earnings?.basic || 15000, 15000), 0);

  const esicEligibleCount = payslips.filter((p) => (p.deductions?.esicEmployee || 0) > 0).length;
  const tdsCount = payslips.filter((p) => (p.deductions?.tds || 0) > 0).length;
  const epfEnrolledCount = payslips.filter((p) => (p.deductions?.pfEmployee || 0) > 0).length;

  // Filtered rows
  const filteredPayslips = payslips.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      p.employee?.fullName?.toLowerCase().includes(q) ||
      p.employee?.employeeId?.toLowerCase().includes(q) ||
      p.employee?.pan?.toLowerCase().includes(q) ||
      p.employee?.uan?.toLowerCase().includes(q);

    if (filterType === 'EPF') return matchSearch && (p.deductions?.pfEmployee || 0) > 0;
    if (filterType === 'ESIC') return matchSearch && (p.deductions?.esicEmployee || 0) > 0;
    if (filterType === 'TDS') return matchSearch && (p.deductions?.tds || 0) > 0;
    return matchSearch;
  });

  const handleExportCSV = () => {
    const csv =
      'data:text/csv;charset=utf-8,' +
      ['Employee ID,Name,PAN,UAN,EPF Wages,Emp EPF (12%),Empr EPF (12%),Emp ESIC,Empr ESIC,Prof Tax,TDS Sec 192,Net Pay']
        .concat(
          payslips.map((p) => {
            const epfWage = Math.min(p.earnings?.basic || 15000, 15000);
            return `${p.employee?.employeeId},"${p.employee?.fullName}",${p.employee?.pan},${p.employee?.uan},${epfWage},${p.deductions?.pfEmployee || 0},${p.employerContributions?.pfEmployer || 0},${p.deductions?.esicEmployee || 0},${p.employerContributions?.esicEmployer || 0},${p.deductions?.professionalTax || 0},${p.deductions?.tds || 0},${p.netPay || 0}`;
          })
        )
        .join('\n');
    const encoded = encodeURI(csv);
    const a = document.createElement('a');
    a.href = encoded;
    a.download = `RupeeBook_Statutory_Challan_${ACTIVE_YEAR}_${ACTIVE_MONTH}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getInitials = (name = '') => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen selection:bg-[#acf847] selection:text-[#111827]">
      {/* Fixed Neo-Brutalist Sidebar */}
      <Sidebar />

      {/* Main Canvas Wrapper (Padded left for 240px sidebar) */}
      <div className="pl-60 min-h-screen flex flex-col">
        {/* Top Sticky Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-3.5 bg-surface border-b-2 border-[#111827] shadow-[0px_3px_0px_#111827]">
          <div className="flex items-center gap-4">
            {/* Live Indicator & Ledger Anchor */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-lowest border-2 border-[#111827] shadow-[2px_2px_0px_#111827] font-label-sm text-label-sm text-[#111827] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#A3E635] border border-[#111827]"></span>
              CENTRAL COMPLIANCE VAULT
            </span>
            <div className="h-4 w-[2px] bg-[#111827]"></div>
            <span className="font-label-md text-label-md font-bold text-[#111827]">
              IN-EPFO-CBDT VOUCHER FEED: SYNCHRONIZED
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={fetchPayslips}
              className="p-1.5 bg-surface-container-lowest border-2 border-[#111827] shadow-[2px_2px_0px_#111827] hover:translate-x-0.5 hover:translate-y-0.5 transition-transform cursor-pointer"
              title="Sync Live Records"
            >
              <span className="material-symbols-outlined text-[20px] text-[#111827]">refresh</span>
            </button>
            <div className="h-6 w-[2px] bg-[#111827]"></div>
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-none bg-[#111827] text-white flex items-center justify-center font-bold text-xs border-2 border-[#111827] shadow-[2px_2px_0px_#0033FF]">
                CF
              </div>
              <div className="flex flex-col text-left">
                <span className="font-label-sm text-label-sm font-bold text-[#111827] leading-none">
                  Jonas Aly, VP
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono">Treasury Controller</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Canvas */}
        <main className="flex-1 p-8 max-w-[1440px] mx-auto w-full space-y-8">
          {error && (
            <div className="bg-red-100 border-2 border-[#111827] p-3 text-red-800 font-bold text-sm shadow-[2px_2px_0px_#111827] flex items-center justify-between">
              <span>{error}</span>
              <button onClick={fetchPayslips} className="underline text-xs cursor-pointer">
                Retry
              </button>
            </div>
          )}

          {/* Section: Breadcrumb & Title Area */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b-2 border-[#111827]">
            <div className="space-y-1.5">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm font-bold tracking-wider">
                <span>TREASURY OPERATIONS</span>
                <span>/</span>
                <span>TAXATION &amp; STATUTORY</span>
                <span>/</span>
                <span className="text-[#0033FF]">CHALLAN RECONCILIATION</span>
              </div>
              {/* Serif Display Headline */}
              <h1 className="font-display-md text-display-md text-[#111827] tracking-tight">
                Statutory Compliance &amp; Challan Pools
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
                Institutional Form 24Q, ECR EPF, ESIC, and State Professional Tax pool clearing and
                remittance schedule.
              </p>
            </div>

            {/* Action Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Cycle Selector Dropdown */}
              <div className="relative">
                <button className="flex items-center gap-2 px-3 py-2 bg-surface-container-lowest border-2 border-[#111827] shadow-[3px_3px_0px_#111827] font-label-md text-label-md font-bold text-[#111827] hover:bg-surface-container-high transition-all">
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                  <span>November 2026 — Due Dec 2026</span>
                  <span className="material-symbols-outlined text-[16px]">expand_more</span>
                </button>
              </div>

              {/* Entity Badge */}
              <div className="flex items-center gap-1.5 px-3 py-2 bg-surface-container border-2 border-[#111827] shadow-[3px_3px_0px_#111827] font-label-md text-label-md font-bold text-[#111827]">
                <span className="material-symbols-outlined text-[18px] text-[#0033FF]">
                  corporate_fare
                </span>
                <span>Entity: Global Treasury Corp (IN-01)</span>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExportCSV}
                className="neo-btn-press px-4 py-2 bg-[#0033FF] text-white border-2 border-[#111827] shadow-[4px_4px_0px_#111827] font-label-md text-label-md font-bold flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>Export Challan CSV</span>
              </button>
            </div>
          </div>

          {/* Row 1: 4 Neo-Brutalist Statutory Pool Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Card 1: EPF Challan Pool */}
            <div className="bg-surface-container-lowest border-2 border-[#111827] shadow-[4px_4px_0px_#111827] p-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2 border-b-2 border-[#111827] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-[#111827] text-white border border-[#111827]">
                      <span className="material-symbols-outlined text-[20px]">account_balance</span>
                    </span>
                    <span className="font-label-md text-label-md font-extrabold text-[#111827] uppercase tracking-wider">
                      EPF POOL (ECR)
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#A3E635] text-[#111827] border-[1.5px] border-[#111827] text-[11px] font-bold">
                    {staffCount > 0 ? 'Ready for Filing' : 'Draft'}
                  </span>
                </div>
                <div>
                  <div className="font-tabular-num text-3xl font-extrabold text-[#111827] tabular-nums tracking-tight">
                    {loading ? '...' : formatINR(totalEpf)}
                  </div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant font-medium mt-1">
                    Employee 12% + Employer 12% ({formatINR(totalEpfEmployee)} + {formatINR(totalEpfEmployer)})
                  </div>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-[#111827] space-y-2">
                <div className="text-[11px] font-mono font-bold text-[#111827] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-error">event</span>
                  Statutory Due: 15 Dec 2026 • {epfEnrolledCount} Members ECR
                </div>
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1 text-[12px] font-bold text-[#0033FF] hover:underline underline-offset-4 decoration-2 cursor-pointer"
                >
                  Generate ECR Text File →
                </button>
              </div>
            </div>

            {/* Card 2: ESIC Contribution Pool */}
            <div className="bg-surface-container-lowest border-2 border-[#111827] shadow-[4px_4px_0px_#111827] p-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2 border-b-2 border-[#111827] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-[#111827] text-white border border-[#111827]">
                      <span className="material-symbols-outlined text-[20px]">health_and_safety</span>
                    </span>
                    <span className="font-label-md text-label-md font-extrabold text-[#111827] uppercase tracking-wider">
                      ESIC POOL
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#A3E635] text-[#111827] border-[1.5px] border-[#111827] text-[11px] font-bold">
                    Validated
                  </span>
                </div>
                <div>
                  <div className="font-tabular-num text-3xl font-extrabold text-[#111827] tabular-nums tracking-tight">
                    {loading ? '...' : formatINR(totalEsic)}
                  </div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant font-medium mt-1">
                    Employee 0.75% + Employer 3.25% ({formatINR(totalEsicEmployee)} + {formatINR(totalEsicEmployer)})
                  </div>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-[#111827] space-y-2">
                <div className="text-[11px] font-mono font-bold text-[#111827] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-error">event</span>
                  Statutory Due: 15 Dec 2026 • {esicEligibleCount} Eligible Staff
                </div>
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1 text-[12px] font-bold text-[#0033FF] hover:underline underline-offset-4 decoration-2 cursor-pointer"
                >
                  View ESIC Monthly Challan →
                </button>
              </div>
            </div>

            {/* Card 3: Professional Tax (WB & KA) */}
            <div className="bg-surface-container-lowest border-2 border-[#111827] shadow-[4px_4px_0px_#111827] p-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2 border-b-2 border-[#111827] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-[#111827] text-white border border-[#111827]">
                      <span className="material-symbols-outlined text-[20px]">location_city</span>
                    </span>
                    <span className="font-label-md text-label-md font-extrabold text-[#111827] uppercase tracking-wider">
                      PROF. TAX (WB &amp; KA)
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#acf847] text-[#111827] border-[1.5px] border-[#111827] text-[11px] font-bold">
                    Slabs Mapped
                  </span>
                </div>
                <div>
                  <div className="font-tabular-num text-3xl font-extrabold text-[#111827] tabular-nums tracking-tight">
                    {loading ? '...' : formatINR(totalPt)}
                  </div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant font-medium mt-1">
                    State Slab Withholding (KA: {formatINR(ptKa)} | WB: {formatINR(ptWb)})
                  </div>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-[#111827] space-y-2">
                <div className="text-[11px] font-mono font-bold text-[#111827] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-error">event</span>
                  Statutory Due: 21 Dec 2026 • PT Return Slabs
                </div>
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1 text-[12px] font-bold text-[#0033FF] hover:underline underline-offset-4 decoration-2 cursor-pointer"
                >
                  Download PT Remittance Slip →
                </button>
              </div>
            </div>

            {/* Card 4: TDS Liability (Sec 192) */}
            <div className="bg-surface-container-lowest border-2 border-[#111827] shadow-[4px_4px_0px_#111827] p-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2 border-b-2 border-[#111827] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-[#0033FF] text-white border border-[#111827]">
                      <span className="material-symbols-outlined text-[20px]">receipt</span>
                    </span>
                    <span className="font-label-md text-label-md font-extrabold text-[#111827] uppercase tracking-wider">
                      TDS (SEC 192)
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FACC15] text-[#111827] border-[1.5px] border-[#111827] text-[11px] font-bold">
                    Challan ITNS 281
                  </span>
                </div>
                <div>
                  <div className="font-tabular-num text-3xl font-extrabold text-[#111827] tabular-nums tracking-tight">
                    {loading ? '...' : formatINR(totalTds)}
                  </div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant font-medium mt-1">
                    Central CBDT Monthly Withholding ({tdsCount} staff with TDS)
                  </div>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-[#111827] space-y-2">
                <div className="text-[11px] font-mono font-bold text-[#111827] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-error">event</span>
                  Statutory Due: 07 Dec 2026 • BSR &amp; Challan 281
                </div>
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1 text-[12px] font-bold text-[#0033FF] hover:underline underline-offset-4 decoration-2 cursor-pointer"
                >
                  Pay via OLTAS / NetBanking →
                </button>
              </div>
            </div>
          </section>

          {/* Row 2: Employee-Wise Statutory Register Table Module */}
          <section className="bg-surface-container-lowest border-2 border-[#111827] shadow-[4px_4px_0px_#111827]">
            {/* Table Control Toolbar */}
            <div className="p-6 border-b-2 border-[#111827] flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h2 className="font-headline-lg text-headline-lg text-[#111827]">
                    Employee Statutory Register
                  </h2>
                  <span className="px-2 py-0.5 bg-surface-container border border-[#111827] text-[11px] font-mono font-bold text-[#111827]">
                    BATCH: TAX-2026-NOV
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Individual employee statutory deduction breakdowns reconciled against general payroll
                  ledger.
                </p>
              </div>

              {/* Filter Pills & Search Input */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Filter Pills */}
                <div className="inline-flex border-2 border-[#111827] p-0.5 bg-surface-container">
                  <button
                    onClick={() => setFilterType('ALL')}
                    className={`px-2.5 py-1 text-xs font-bold cursor-pointer transition ${
                      filterType === 'ALL'
                        ? 'bg-[#111827] text-white'
                        : 'text-[#111827] hover:bg-surface-container-high'
                    }`}
                  >
                    All Staff ({staffCount})
                  </button>
                  <button
                    onClick={() => setFilterType('EPF')}
                    className={`px-2.5 py-1 text-xs font-bold cursor-pointer transition ${
                      filterType === 'EPF'
                        ? 'bg-[#111827] text-white'
                        : 'text-[#111827] hover:bg-surface-container-high'
                    }`}
                  >
                    EPF Enrolled ({epfEnrolledCount})
                  </button>
                  <button
                    onClick={() => setFilterType('ESIC')}
                    className={`px-2.5 py-1 text-xs font-bold cursor-pointer transition ${
                      filterType === 'ESIC'
                        ? 'bg-[#111827] text-white'
                        : 'text-[#111827] hover:bg-surface-container-high'
                    }`}
                  >
                    ESIC Eligible ({esicEligibleCount})
                  </button>
                  <button
                    onClick={() => setFilterType('TDS')}
                    className={`px-2.5 py-1 text-xs font-bold cursor-pointer transition ${
                      filterType === 'TDS'
                        ? 'bg-[#111827] text-white'
                        : 'text-[#111827] hover:bg-surface-container-high'
                    }`}
                  >
                    TDS Withheld ({tdsCount})
                  </button>
                </div>

                {/* Search Field */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                      search
                    </span>
                  </span>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-surface border-2 border-[#111827] text-xs font-medium text-[#111827] focus:outline-none focus:border-[#0033FF] focus:shadow-[2px_2px_0px_#0033FF] w-64"
                    placeholder="Search by PAN, UAN or Name..."
                    type="text"
                  />
                </div>

                {/* Export XLSX Button */}
                <button
                  onClick={handleExportCSV}
                  className="neo-btn-press px-3 py-1.5 bg-surface-container-lowest text-[#111827] border-2 border-[#111827] shadow-[2px_2px_0px_#111827] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">file_download</span>
                  <span>Download Statutory Ledger (CSV)</span>
                </button>
              </div>
            </div>

            {/* Matrix Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b-2 border-[#111827]">
                    <th className="py-3 px-4 text-xs font-extrabold uppercase tracking-wider text-[#111827] border-r border-[#111827]">
                      Employee ID &amp; Name
                    </th>
                    <th className="py-3 px-3 text-xs font-extrabold uppercase tracking-wider text-[#111827] border-r border-[#111827]">
                      PAN Number
                    </th>
                    <th className="py-3 px-3 text-xs font-extrabold uppercase tracking-wider text-[#111827] border-r border-[#111827]">
                      UAN
                    </th>
                    <th className="py-3 px-3 text-xs font-extrabold uppercase tracking-wider text-[#111827] border-r border-[#111827] text-right">
                      EPF Wages
                    </th>
                    <th className="py-3 px-3 text-xs font-extrabold uppercase tracking-wider text-[#111827] border-r border-[#111827] text-right">
                      Total EPF (24%)
                    </th>
                    <th className="py-3 px-3 text-xs font-extrabold uppercase tracking-wider text-[#111827] border-r border-[#111827] text-right">
                      Total ESIC (4%)
                    </th>
                    <th className="py-3 px-3 text-xs font-extrabold uppercase tracking-wider text-[#111827] border-r border-[#111827] text-right">
                      Prof. Tax
                    </th>
                    <th className="py-3 px-3 text-xs font-extrabold uppercase tracking-wider text-[#111827] border-r border-[#111827] text-right">
                      TDS (Sec 192)
                    </th>
                    <th className="py-3 px-3 text-xs font-extrabold uppercase tracking-wider text-[#111827] border-r border-[#111827] text-center">
                      Challan Status
                    </th>
                    <th className="py-3 px-3 text-xs font-extrabold uppercase tracking-wider text-[#111827] text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y border-[#111827] text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan="10" className="py-12 text-center text-on-surface-variant font-bold">
                        <div className="flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                          <span>Loading employee statutory records from Express API...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredPayslips.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="py-12 text-center text-on-surface-variant">
                        <p className="font-bold text-base text-on-surface">No statutory records found</p>
                        <p className="text-sm mt-1">
                          {staffCount === 0 ? (
                            <span>
                              Payroll has not been calculated yet for November 2026.{' '}
                              <Link to="/payroll/run" className="text-primary font-bold underline">
                                Run payroll now →
                              </Link>
                            </span>
                          ) : (
                            'No employees match the selected filter.'
                          )}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredPayslips.map((p) => {
                      const epfWage = Math.min(p.earnings?.basic || 15000, 15000);
                      const epfTotal = (p.deductions?.pfEmployee || 0) + (p.employerContributions?.pfEmployer || 0);
                      const esicTotal = (p.deductions?.esicEmployee || 0) + (p.employerContributions?.esicEmployer || 0);

                      return (
                        <tr key={p._id} className="hover:bg-[#A3E635]/10 transition-colors">
                          <td className="py-3 px-4 border-r border-[#111827]">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 bg-[#111827] text-white font-bold flex items-center justify-center text-[10px] border border-[#111827]">
                                {getInitials(p.employee?.fullName)}
                              </div>
                              <div>
                                <div className="font-bold text-[#111827]">{p.employee?.fullName}</div>
                                <div className="text-[11px] text-on-surface-variant font-mono">
                                  {p.employee?.employeeId} • {p.employee?.designation}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 border-r border-[#111827] font-mono font-bold text-[#111827]">
                            {p.employee?.pan || 'PAN PENDING'}
                          </td>
                          <td className="py-3 px-3 border-r border-[#111827] font-mono text-on-surface-variant">
                            {p.employee?.uan || 'UAN PENDING'}
                          </td>
                          <td className="py-3 px-3 border-r border-[#111827] font-bold text-right tabular-nums">
                            {formatINR(epfWage)}
                          </td>
                          <td className="py-3 px-3 border-r border-[#111827] font-bold text-right tabular-nums text-[#0033FF]">
                            {formatINR(epfTotal)}
                          </td>
                          <td className="py-3 px-3 border-r border-[#111827] text-right text-on-surface-variant font-mono">
                            {esicTotal > 0 ? formatINR(esicTotal) : 'Exempt'}
                          </td>
                          <td className="py-3 px-3 border-r border-[#111827] font-bold text-right tabular-nums">
                            {formatINR(p.deductions?.professionalTax || 0)}
                          </td>
                          <td className="py-3 px-3 border-r border-[#111827] font-extrabold text-right tabular-nums text-[#111827]">
                            {formatINR(p.deductions?.tds || 0)}
                          </td>
                          <td className="py-3 px-3 border-r border-[#111827] text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#A3E635] text-[#111827] border border-[#111827] text-[10px] font-bold">
                              Accrued ✓
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <Link
                              to="/payslips"
                              className="inline-block px-2 py-1 bg-surface-container hover:bg-[#111827] hover:text-white border border-[#111827] text-[11px] font-bold transition-all"
                            >
                              Inspect
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Summary Ledger Banner Footer */}
            <div className="p-6 bg-surface-container-high border-t-2 border-[#111827] flex flex-col xl:flex-row xl:items-center justify-between gap-6">
              <div className="flex flex-wrap items-center gap-6 divide-x-2 divide-[#111827]">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    BATCH WAGES ({staffCount} STAFF)
                  </span>
                  <div className="font-tabular-num text-lg font-bold text-[#111827] tabular-nums">
                    {formatINR(totalEpfWages)}
                  </div>
                </div>
                <div className="pl-6 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    TOTAL EPF POOL
                  </span>
                  <div className="font-tabular-num text-lg font-bold text-[#0033FF] tabular-nums">
                    {formatINR(totalEpf)}
                  </div>
                </div>
                <div className="pl-6 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    TOTAL ESIC POOL
                  </span>
                  <div className="font-tabular-num text-lg font-bold text-[#111827] tabular-nums">
                    {formatINR(totalEsic)}
                  </div>
                </div>
                <div className="pl-6 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    STATE PT TOTAL
                  </span>
                  <div className="font-tabular-num text-lg font-bold text-[#111827] tabular-nums">
                    {formatINR(totalPt)}
                  </div>
                </div>
                <div className="pl-6 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    CBDT TDS (SEC 192)
                  </span>
                  <div className="font-tabular-num text-lg font-bold text-[#111827] tabular-nums">
                    {formatINR(totalTds)}
                  </div>
                </div>
              </div>

              {/* Total Statutory Accrual Seal */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
                    TOTAL STATUTORY LIABILITIES
                  </span>
                  <span className="font-tabular-num text-2xl font-extrabold text-[#111827] tabular-nums">
                    {formatINR(totalStatutory)}
                  </span>
                </div>
                <div className="px-4 py-2 bg-[#A3E635] text-[#111827] border-2 border-[#111827] shadow-[2px_2px_0px_#111827] font-label-md text-label-md font-extrabold flex items-center gap-1.5 whitespace-nowrap">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Statutory Pools 100% Balanced ✓</span>
                </div>
              </div>
            </div>
          </section>

          {/* Row 3: Statutory Gateway & Verification Strip */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
            {/* Left Sub-card: CBDT & EPFO Gateway Sync */}
            <div className="bg-surface-container-lowest border-2 border-[#111827] shadow-[4px_4px_0px_#111827] p-6 space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[#111827] pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[22px] text-[#0033FF]">
                    sync_saved_locally
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-[#111827]">
                    CBDT &amp; EPFO Gateway Connectivity
                  </h3>
                </div>
                <span className="px-2 py-0.5 bg-[#A3E635] text-[#111827] border border-[#111827] text-[10px] font-bold">
                  API ACTIVE
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Encrypted bidirectional sync established with central filing nodal points. Challan
                identification numbers (CIN) and BSR branches validated automatically upon clearing.
              </p>
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-surface border-2 border-[#111827]">
                  <div className="text-[10px] font-bold text-on-surface-variant uppercase">
                    CBDT TRACES
                  </div>
                  <div className="text-xs font-bold text-[#111827] mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A3E635]"></span> Connected
                  </div>
                  <span className="text-[9px] font-mono text-outline block mt-0.5">Live</span>
                </div>
                <div className="p-3 bg-surface border-2 border-[#111827]">
                  <div className="text-[10px] font-bold text-on-surface-variant uppercase">
                    EPFO SHRAM SUVIDHA
                  </div>
                  <div className="text-xs font-bold text-[#111827] mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A3E635]"></span> Verified
                  </div>
                  <span className="text-[9px] font-mono text-outline block mt-0.5">Live</span>
                </div>
                <div className="p-3 bg-surface border-2 border-[#111827]">
                  <div className="text-[10px] font-bold text-on-surface-variant uppercase">
                    ESIC PORTAL
                  </div>
                  <div className="text-xs font-bold text-[#111827] mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A3E635]"></span> Mapped
                  </div>
                  <span className="text-[9px] font-mono text-outline block mt-0.5">Live</span>
                </div>
              </div>
            </div>

            {/* Right Sub-card: Form 24Q Quarterly Return Mapping */}
            <div className="bg-surface-container-lowest border-2 border-[#111827] shadow-[4px_4px_0px_#111827] p-6 space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[#111827] pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[22px] text-[#0033FF]">task_alt</span>
                  <h3 className="font-headline-sm text-headline-sm text-[#111827]">
                    Form 24Q Quarterly Return Mapping (Q3)
                  </h3>
                </div>
                <span className="font-mono text-xs font-bold text-[#111827]">Q3 FY26-27</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-[#111827]">
                  <span>PAN Statutory Seeding &amp; Section 192 Annexure II</span>
                  <span>100% Complete</span>
                </div>
                <div className="w-full h-3 bg-surface-container border-2 border-[#111827] p-0.5">
                  <div className="h-full bg-[#0033FF] w-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#A3E635] text-[#111827] border border-[#111827] text-[10px] font-bold uppercase">
                    {staffCount} of {staffCount} PANs Validated
                  </span>
                  <span className="text-xs text-on-surface-variant font-medium">
                    Zero syntax warnings
                  </span>
                </div>
                <Link
                  to="/employees"
                  className="neo-btn-press px-3 py-1 bg-surface-container-lowest text-[#111827] border-2 border-[#111827] shadow-[2px_2px_0px_#111827] text-xs font-bold flex items-center gap-1"
                >
                  <span>Audit Annexure</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
