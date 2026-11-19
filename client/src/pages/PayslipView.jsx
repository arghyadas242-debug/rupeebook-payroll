import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const API_BASE = 'http://localhost:5000/api/v1/payroll';
const ACTIVE_MONTH = 11;
const ACTIVE_YEAR = 2026;

export default function PayslipView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [allPayslips, setAllPayslips] = useState([]);
  const [selectedSlipId, setSelectedSlipId] = useState(id || '');
  const [loading, setLoading] = useState(true);

  const formatINR = (num = 0) =>
    `₹${Number(num).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  useEffect(() => {
    if (id) setSelectedSlipId(id);
  }, [id]);

  useEffect(() => {
    const loadPayslips = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/payslips?month=${ACTIVE_MONTH}&year=${ACTIVE_YEAR}`);
        const json = await res.json();
        const list = json.data || [];
        setAllPayslips(list);

        if (list.length > 0 && (!id || !list.some((item) => item._id === id))) {
          setSelectedSlipId(list[0]._id);
        }
      } catch (err) {
        console.error('Failed to load payslips:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPayslips();
  }, [id]);

  const slip = allPayslips.find((p) => p._id === selectedSlipId) || allPayslips[0];
  const emp = slip?.employee || {};

  const handleEmployeeChange = (e) => {
    const newId = e.target.value;
    setSelectedSlipId(newId);
    navigate(`/payslips/${newId}`);
  };

  return (
    <div className="bg-surface-container-low text-on-surface antialiased font-body-md text-body-md selection:bg-secondary-fixed selection:text-on-secondary-fixed min-h-screen">
      <Sidebar />

      <header className="sticky top-0 z-30 w-full pl-60 bg-surface-container-lowest border-b-2 border-[#111827] shadow-[0px_4px_0px_#111827]">
        <div className="flex items-center justify-between px-8 py-3.5">
          <div className="flex items-center gap-4">
            <span className="font-label-lg text-label-md border-2 border-[#111827] bg-surface-container px-3 py-1 font-bold shadow-[2px_2px_0px_#111827]">
              Entity: Global Treasury Corp (India Sub)
            </span>
            <span className="text-on-surface-variant text-label-md flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[18px]">event</span>
              Q4 FY2026-27 (Nov 01 – Nov 30)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="bg-surface-container-lowest text-[#111827] font-label-lg text-label-md py-1.5 px-3 border-2 border-[#111827] shadow-[2px_2px_0px_#111827] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 transition-all flex items-center gap-1.5 font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">file_upload</span>
              <span>Export Journal</span>
            </button>
            <button className="bg-[#0033FF] text-white font-label-lg text-label-md py-1.5 px-3.5 border-2 border-[#111827] shadow-[2px_2px_0px_#111827] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 transition-all flex items-center gap-1.5 font-bold">
              <span className="material-symbols-outlined text-[18px]">post_add</span>
              <span>Post Ledger Voucher</span>
            </button>
            <div className="h-6 w-0.5 bg-[#111827] mx-1"></div>
            <button
              className="p-1.5 text-[#111827] hover:bg-surface-container border border-[#111827] shadow-[2px_2px_0px_#111827]"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-[20px] block">notifications</span>
            </button>
            <div className="flex items-center gap-2 pl-2">
              <div className="w-8 h-8 rounded-full border-2 border-[#111827] bg-[#FACC15] flex items-center justify-center font-bold text-xs shadow-[2px_2px_0px_#111827]">
                <span className="font-tabular-num font-bold">CF</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="pl-60 min-h-[calc(100vh-65px)] pb-16">
        <div className="max-w-[1440px] mx-auto px-8 py-8 space-y-6">
          {/* Breadcrumb & Editorial Header */}
          <div className="flex flex-col gap-1 no-print">
            <div className="flex items-center gap-2 text-xs font-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">
              <span>Treasury Operations</span>
              <span>/</span>
              <span>Salary Disbursement</span>
              <span>/</span>
              <span className="text-[#0033FF] underline decoration-2">Direct Slip Generator</span>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <h1 className="font-headline-lg text-headline-lg text-[#111827] tracking-tight">
                  Employee Payslips &amp; Salary Statements
                </h1>
                <p className="font-body-md text-on-surface-variant text-[14px] mt-0.5">
                  Institutional Form 16 &amp; Rule 26 compliant individual monthly compensation advice
                  with bank-grade audit seals.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-[#111827] bg-[#A3E635] text-[#111827] text-xs font-bold">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  {slip?.status === 'PAID' ? 'Disbursed & Fully Reconciled' : 'Approved & Audit Ready'}
                </span>
              </div>
            </div>
          </div>

          {/* Neo-Brutalist Filter & Action Control Strip */}
          <div className="bg-surface-container-lowest border-2 border-[#111827] shadow-[4px_4px_0px_#111827] p-5 no-print">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              <div className="lg:col-span-5 flex flex-col gap-1">
                <label className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                  Select Active Personnel
                </label>
                <div className="relative">
                  <select
                    value={slip?._id || ''}
                    onChange={handleEmployeeChange}
                    className="w-full appearance-none border-2 border-[#111827] bg-surface-container-lowest px-3 py-2 pr-9 text-sm font-bold shadow-[2px_2px_0px_#111827] cursor-pointer focus:outline-none focus:border-[#0033FF]"
                  >
                    {allPayslips.length === 0 && (
                      <option value="">No processed payslips — Run Payroll first</option>
                    )}
                    {allPayslips.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.employee?.employeeId} — {p.employee?.fullName} ({p.employee?.designation})
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined text-[20px] text-on-surface absolute right-2.5 top-2 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="lg:col-span-4 grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                    Unit / Dept
                  </label>
                  <div className="border-2 border-[#111827] bg-surface-container-low px-2.5 py-2 text-xs font-bold truncate">
                    {emp.department || 'Design Studio & Systems'}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                    Disbursement Month
                  </label>
                  <div className="flex items-center justify-between border-2 border-[#111827] bg-surface-container-lowest px-2.5 py-2 text-xs font-bold">
                    <span className="truncate">Nov 2026 ({slip?.totalWorkingDays || 30} Days)</span>
                    <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 flex items-end justify-end gap-2 pt-4 lg:pt-0">
                <button
                  onClick={() => window.print()}
                  className="bg-[#0033FF] text-white text-xs font-label-lg py-2.5 px-4 border-2 border-[#111827] shadow-[4px_4px_0px_#111827] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#111827] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-1.5 font-bold whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>Download PDF</span>
                </button>
                <button
                  className="bg-white text-[#111827] text-xs font-label-lg p-2.5 border-2 border-[#111827] shadow-[4px_4px_0px_#111827] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#111827] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                  title="Email to Employee"
                >
                  <span className="material-symbols-outlined text-[18px] block">outgoing_mail</span>
                </button>
                <button
                  className="bg-white text-[#111827] text-xs font-label-lg p-2.5 border-2 border-[#111827] shadow-[4px_4px_0px_#111827] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#111827] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                  title="View YTD Register"
                >
                  <span className="material-symbols-outlined text-[18px] block">analytics</span>
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-surface-container-lowest border-2 border-[#111827] shadow-[4px_4px_0px_#111827] p-12 text-center font-bold">
              Loading payslip statement from MongoDB...
            </div>
          ) : !slip ? (
            <div className="bg-surface-container-lowest border-2 border-[#111827] shadow-[4px_4px_0px_#111827] p-12 text-center space-y-3">
              <div className="font-headline-md text-headline-md font-bold">
                No Payslips Generated for November 2026 Yet
              </div>
              <p className="text-on-surface-variant text-sm">
                Go to Run Payroll and click &ldquo;Process Batch Payroll&rdquo; to generate MongoDB
                payslip records.
              </p>
            </div>
          ) : (
            <div className="w-full bg-surface-container-lowest border-2 border-[#111827] shadow-[6px_6px_0px_#111827] p-8 md:p-10 transition-all relative">
              <div className="absolute right-4 top-4 text-[10px] font-mono text-outline border border-[#111827] px-2 py-0.5 uppercase bg-surface-container-low">
                OFFICIAL COPY • TREASURY FORM 26-B
              </div>

              {/* Document Header Section */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b-2 border-[#111827]">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 bg-[#111827] text-white flex items-center justify-center font-bold text-sm">
                      RB
                    </div>
                    <span className="font-headline-md text-headline-sm font-bold text-[#111827]">
                      RupeeBook Financial Systems Pvt. Ltd.
                    </span>
                  </div>
                  <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed">
                    Registered Office: Embassy TechVillage, Outer Ring Road, Devarabisanahalli,
                    <br />
                    Bengaluru, Karnataka 560103, India | CIN: U72200KA2021PTC148892
                    <br />
                    Direct Taxation Division &amp; Treasury Disbursements Office
                  </p>
                </div>

                <div className="flex flex-col items-start md:items-end">
                  <h2 className="font-headline-lg text-headline-md text-[#111827] font-bold tracking-tight">
                    PAYSLIP FOR NOVEMBER 2026
                  </h2>
                  <div className="font-label-sm text-xs font-semibold text-on-surface-variant mt-0.5">
                    Pay Period: <span className="text-[#111827] font-bold">01 Nov 2026 – 30 Nov 2026</span>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1.5 bg-[#A3E635] text-[#111827] border-2 border-[#111827] px-3.5 py-1 font-label-lg font-extrabold text-xs shadow-[2px_2px_0px_#111827] uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[16px] font-bold">check_circle</span>
                    {slip.status === 'PAID' ? 'PAID ON 30-NOV-2026' : 'APPROVED FOR DISBURSAL'}
                  </div>
                </div>
              </div>

              {/* 2-Column Metadata Grid */}
              <div className="mt-6 border-2 border-[#111827] grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x-2 divide-[#111827]">
                <div className="p-0">
                  <div className="bg-surface-container px-4 py-2 border-b border-[#111827] font-label-sm text-[11px] uppercase tracking-wider font-extrabold text-[#111827] flex items-center justify-between">
                    <span>Employee Demographics</span>
                    <span className="font-mono text-[10px]">SECTION 01</span>
                  </div>
                  <div className="divide-y divide-[#111827] text-xs">
                    <div className="grid grid-cols-12 px-4 py-2">
                      <span className="col-span-5 text-on-surface-variant font-medium">Employee ID:</span>
                      <span className="col-span-7 font-bold text-[#111827] font-mono">{emp.employeeId}</span>
                    </div>
                    <div className="grid grid-cols-12 px-4 py-2">
                      <span className="col-span-5 text-on-surface-variant font-medium">Employee Name:</span>
                      <span className="col-span-7 font-extrabold text-[#111827]">{emp.fullName}</span>
                    </div>
                    <div className="grid grid-cols-12 px-4 py-2">
                      <span className="col-span-5 text-on-surface-variant font-medium">Designation:</span>
                      <span className="col-span-7 font-semibold text-[#111827]">{emp.designation}</span>
                    </div>
                    <div className="grid grid-cols-12 px-4 py-2">
                      <span className="col-span-5 text-on-surface-variant font-medium">Department:</span>
                      <span className="col-span-7 font-medium text-[#111827]">{emp.department}</span>
                    </div>
                    <div className="grid grid-cols-12 px-4 py-2">
                      <span className="col-span-5 text-on-surface-variant font-medium">Date of Joining:</span>
                      <span className="col-span-7 font-semibold text-[#111827]">
                        {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString('en-IN') : '12 March 2022'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-0">
                  <div className="bg-surface-container px-4 py-2 border-b border-[#111827] font-label-sm text-[11px] uppercase tracking-wider font-extrabold text-[#111827] flex items-center justify-between">
                    <span>Statutory &amp; Disbursement Data</span>
                    <span className="font-mono text-[10px]">SECTION 02</span>
                  </div>
                  <div className="divide-y divide-[#111827] text-xs">
                    <div className="grid grid-cols-12 px-4 py-2">
                      <span className="col-span-5 text-on-surface-variant font-medium">
                        Permanent A/C (PAN):
                      </span>
                      <span className="col-span-7 font-bold text-[#111827] font-mono">{emp.pan || 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-12 px-4 py-2">
                      <span className="col-span-5 text-on-surface-variant font-medium">
                        Universal A/C (UAN):
                      </span>
                      <span className="col-span-7 font-bold text-[#111827] font-mono">{emp.uan || 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-12 px-4 py-2">
                      <span className="col-span-5 text-on-surface-variant font-medium">
                        Bank &amp; Account:
                      </span>
                      <span className="col-span-7 font-medium text-[#111827] truncate">
                        {emp.bankAccount?.bankName || 'HDFC Bank'} • {emp.bankAccount?.accountNumber || '••••1234'}
                      </span>
                    </div>
                    <div className="grid grid-cols-12 px-4 py-2">
                      <span className="col-span-5 text-on-surface-variant font-medium">IFSC Code:</span>
                      <span className="col-span-7 font-bold text-[#111827] font-mono">
                        {emp.bankAccount?.ifsc || 'HDFC0000240'}
                      </span>
                    </div>
                    <div className="grid grid-cols-12 px-4 py-2 bg-[#FACC15]/20">
                      <span className="col-span-5 text-on-surface-variant font-bold">Working Days:</span>
                      <span className="col-span-7 font-extrabold text-[#111827]">
                        {slip.paidDays ?? 30} / {slip.totalWorkingDays ?? 30} Days ({(slip.lossOfPayDays ?? 0).toFixed(1)} LOP)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Earnings & Deductions Matrix */}
              <div className="mt-6 border-2 border-[#111827]">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x-2 divide-[#111827]">
                  <div>
                    <div className="bg-[#111827] text-white px-4 py-2.5 font-label-md text-xs font-bold tracking-wider uppercase flex justify-between items-center">
                      <span>EARNINGS (INR)</span>
                      <span className="font-mono text-[11px] text-surface-container-highest">AMOUNT</span>
                    </div>
                    <table className="w-full text-xs">
                      <tbody className="divide-y divide-[#111827]">
                        <tr className="hover:bg-[#84CC16]/10 transition-colors">
                          <td className="px-4 py-2.5 font-medium">Basic Salary</td>
                          <td className="px-4 py-2.5 text-right font-tabular-num font-bold text-[#111827]">
                            {formatINR(slip.earnings?.basic)}
                          </td>
                        </tr>
                        <tr className="hover:bg-[#84CC16]/10 transition-colors">
                          <td className="px-4 py-2.5 font-medium">House Rent Allowance (HRA)</td>
                          <td className="px-4 py-2.5 text-right font-tabular-num font-bold text-[#111827]">
                            {formatINR(slip.earnings?.hra)}
                          </td>
                        </tr>
                        <tr className="hover:bg-[#84CC16]/10 transition-colors">
                          <td className="px-4 py-2.5 font-medium">Special Allowance</td>
                          <td className="px-4 py-2.5 text-right font-tabular-num font-bold text-[#111827]">
                            {formatINR(slip.earnings?.specialAllowance)}
                          </td>
                        </tr>
                        <tr className="text-transparent select-none">
                          <td className="px-4 py-2.5">&nbsp;</td>
                          <td className="px-4 py-2.5 text-right">&nbsp;</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-[#111827] bg-surface-container">
                          <td className="px-4 py-3 font-extrabold text-xs uppercase tracking-wide text-[#111827]">
                            Subtotal / Gross Earnings
                          </td>
                          <td className="px-4 py-3 text-right font-tabular-num font-extrabold text-[15px] text-[#111827]">
                            {formatINR(slip.earnings?.grossPay)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div>
                    <div className="bg-surface-container-high text-[#111827] px-4 py-2.5 font-label-md text-xs font-extrabold tracking-wider uppercase border-b-2 border-[#111827] flex justify-between items-center">
                      <span>STATUTORY DEDUCTIONS (INR)</span>
                      <span className="font-mono text-[11px] text-[#111827]">AMOUNT</span>
                    </div>
                    <table className="w-full text-xs">
                      <tbody className="divide-y divide-[#111827]">
                        <tr className="hover:bg-[#84CC16]/10 transition-colors">
                          <td className="px-4 py-2.5 font-medium">Employee EPF (@ 12%)</td>
                          <td className="px-4 py-2.5 text-right font-tabular-num font-bold text-[#111827]">
                            {formatINR(slip.deductions?.pfEmployee)}
                          </td>
                        </tr>
                        <tr className="hover:bg-[#84CC16]/10 transition-colors">
                          <td className="px-4 py-2.5 font-medium">Employee ESIC (@ 0.75%)</td>
                          <td className="px-4 py-2.5 text-right font-tabular-num font-bold text-[#111827]">
                            {formatINR(slip.deductions?.esicEmployee)}{' '}
                            {(slip.deductions?.esicEmployee || 0) === 0 && (
                              <span className="text-[10px] text-on-surface-variant font-normal">
                                (Exempt)
                              </span>
                            )}
                          </td>
                        </tr>
                        <tr className="hover:bg-[#84CC16]/10 transition-colors">
                          <td className="px-4 py-2.5 font-medium">State Professional Tax</td>
                          <td className="px-4 py-2.5 text-right font-tabular-num font-bold text-[#111827]">
                            {formatINR(slip.deductions?.professionalTax)}
                          </td>
                        </tr>
                        <tr className="hover:bg-[#84CC16]/10 transition-colors">
                          <td className="px-4 py-2.5 font-medium">TDS Income Tax (Sec 192)</td>
                          <td className="px-4 py-2.5 text-right font-tabular-num font-bold text-[#111827]">
                            {formatINR(slip.deductions?.tds)}
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-[#111827] bg-surface-container">
                          <td className="px-4 py-3 font-extrabold text-xs uppercase tracking-wide text-[#111827]">
                            Subtotal / Total Deductions
                          </td>
                          <td className="px-4 py-3 text-right font-tabular-num font-extrabold text-[15px] text-[#BA1A1A]">
                            {formatINR(slip.deductions?.totalDeductions)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>

              {/* Net Pay Institutional Banner */}
              <div className="mt-6 bg-[#000000] text-white border-2 border-[#111827] shadow-[4px_4px_0px_#111827] p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-[#A3E635] inline-block"></span>
                    <span className="font-label-lg text-sm tracking-wider uppercase font-extrabold text-white">
                      NET SALARY PAYABLE
                    </span>
                  </div>
                  <p className="text-xs text-surface-container-high font-mono">
                    Transferred via ICICI Corporate NEFT Batch #PAYROLL-2026-11
                  </p>
                  <p className="text-xs text-[#c5caff] italic pt-1">
                    Payslip Record ID: {slip._id} • Statutory Section 192 &amp; Rule 26 Verified
                  </p>
                </div>
                <div className="text-right w-full md:w-auto border-t md:border-t-0 border-[#333] pt-3 md:pt-0">
                  <span className="block text-[11px] text-surface-container-high font-mono uppercase tracking-widest">
                    CREDITED TO SALARY ACCOUNT
                  </span>
                  <span className="font-tabular-num text-3xl md:text-4xl font-extrabold text-[#A3E635] tracking-tight block">
                    {formatINR(slip.netPay)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}