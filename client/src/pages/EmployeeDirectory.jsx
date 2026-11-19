import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router-dom';

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1`;

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [regimeFilter, setRegimeFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form State for Onboarding New Employee
  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    email: '',
    designation: '',
    department: 'Engineering',
    location: 'Bengaluru',
    state: 'KA',
    pan: '',
    uan: '',
    taxRegime: 'NEW_115BAC',
    bankName: 'HDFC Bank Ltd',
    accountNumber: '',
    ifsc: 'HDFC0000240',
    monthlyGross: 75000,
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/employees`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setEmployees(json.data);
      } else if (Array.isArray(json)) {
        setEmployees(json);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Could not connect to live Express API. Ensure server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Set default employeeId when opening modal
  const handleOpenModal = () => {
    const nextId = `EMP-${1000 + employees.length + 1}`;
    setFormData((prev) => ({
      ...prev,
      employeeId: prev.employeeId || nextId,
    }));
    setFormError('');
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOnboard = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      setSubmitting(true);
      const gross = Number(formData.monthlyGross) || 0;
      const basic = Math.round(gross * 0.5);
      const hra = Math.round(gross * 0.3);
      const specialAllowance = Math.round(gross * 0.2);

      const payload = {
        employeeId: formData.employeeId.trim(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        designation: formData.designation.trim(),
        department: formData.department,
        location: formData.location.trim() || 'Bengaluru',
        state: formData.state,
        pan: formData.pan.trim().toUpperCase(),
        uan: formData.uan.trim(),
        taxRegime: formData.taxRegime,
        bankAccount: {
          bankName: formData.bankName.trim() || 'ICICI Bank Ltd',
          accountNumber: formData.accountNumber.trim(),
          ifsc: formData.ifsc.trim().toUpperCase(),
          pennyDropVerified: true,
        },
        ctc: {
          monthlyGross: gross,
          basic,
          hra,
          specialAllowance,
        },
        status: 'ACTIVE',
      };

      const res = await fetch(`${API_BASE}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setShowModal(false);
        setFormData({
          employeeId: '',
          fullName: '',
          email: '',
          designation: '',
          department: 'Engineering',
          location: 'Bengaluru',
          state: 'KA',
          pan: '',
          uan: '',
          taxRegime: 'NEW_115BAC',
          bankName: 'HDFC Bank Ltd',
          accountNumber: '',
          ifsc: 'HDFC0000240',
          monthlyGross: 75000,
        });
        await fetchEmployees();
      } else {
        setFormError(json.message || json.error || 'Failed to onboard employee.');
      }
    } catch (err) {
      console.error('Error onboarding employee:', err);
      setFormError('Network error connecting to Express API.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (emp) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${emp.fullName} (${emp.employeeId}) from the RupeeBook workforce registry? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE}/employees/${emp._id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setEmployees((prev) => prev.filter((item) => item._id !== emp._id));
      } else {
        alert(json.message || 'Failed to delete employee.');
      }
    } catch (err) {
      console.error('Error deleting employee:', err);
      alert('Network error deleting employee from Express API.');
    }
  };

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      emp.fullName?.toLowerCase().includes(q) ||
      emp.employeeId?.toLowerCase().includes(q) ||
      emp.pan?.toLowerCase().includes(q) ||
      emp.uan?.toLowerCase().includes(q) ||
      emp.designation?.toLowerCase().includes(q);

    const matchDept = departmentFilter === 'All' || emp.department === departmentFilter;
    const matchRegime =
      regimeFilter === 'All' ||
      (regimeFilter === 'NEW_115BAC' && (emp.taxRegime === 'NEW_115BAC' || emp.taxRegime === 'NEW')) ||
      (regimeFilter === 'OLD' && emp.taxRegime === 'OLD');

    return matchSearch && matchDept && matchRegime;
  });

  // KPI calculations
  const totalStaffCount = employees.length;
  const totalMonthlyGrossCTC = employees.reduce((acc, emp) => acc + (emp.ctc?.monthlyGross || 0), 0);
  const avgMonthlyCTC = totalStaffCount > 0 ? Math.round(totalMonthlyGrossCTC / totalStaffCount) : 0;
  const newRegimeCount = employees.filter((e) => e.taxRegime === 'NEW_115BAC' || e.taxRegime === 'NEW').length;
  const oldRegimeCount = totalStaffCount - newRegimeCount;
  const kycCompleteCount = employees.filter((e) => e.pan && e.uan).length;

  const deptCounts = {
    All: employees.length,
    Engineering: employees.filter((e) => e.department === 'Engineering').length,
    Sales: employees.filter((e) => e.department === 'Sales').length,
    Operations: employees.filter((e) => e.department === 'Operations').length,
    Finance: employees.filter((e) => e.department === 'Finance').length,
  };

  const formatINR = (val = 0) => `₹${Number(val).toLocaleString('en-IN')}`;

  const getInitials = (name = '') => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Wrap (Margin offset 240px) */}
      <div className="pl-60">
        {/* Top Fixed Utility Bar */}
        <header className="fixed top-0 left-60 right-0 h-16 bg-surface-container-lowest border-b-2 border-[#111827] z-40 flex items-center justify-between px-space-lg shadow-[0_2px_0px_#111827]">
          <div className="flex items-center gap-space-md font-label-md text-label-md">
            <div className="flex items-center gap-space-xs bg-surface border-2 border-[#111827] px-space-sm py-1 shadow-[2px_2px_0px_#111827]">
              <span className="material-symbols-outlined text-[16px] text-primary-container">domain</span>
              <span className="font-bold text-on-surface">Entity:</span>
              <span className="text-on-surface-variant">Global Treasury Corp (IN-01)</span>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">unfold_more</span>
            </div>
            <span className="text-[#111827] font-bold text-headline-sm">/</span>
            <div className="flex items-center gap-space-xs bg-surface border-2 border-[#111827] px-space-sm py-1 shadow-[2px_2px_0px_#111827]">
              <span className="material-symbols-outlined text-[16px] text-secondary">event_repeat</span>
              <span className="font-bold text-on-surface">Payroll Run:</span>
              <span className="text-on-surface-variant">November 2026</span>
            </div>
          </div>

          <div className="flex items-center gap-space-md">
            <button className="w-9 h-9 bg-surface-container-lowest border-2 border-[#111827] shadow-[2px_2px_0px_#111827] flex items-center justify-center hover:bg-surface-container transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
              <span className="material-symbols-outlined text-[20px] text-on-surface">notifications</span>
            </button>
            <button className="w-9 h-9 bg-surface-container-lowest border-2 border-[#111827] shadow-[2px_2px_0px_#111827] flex items-center justify-center hover:bg-surface-container transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
              <span className="material-symbols-outlined text-[20px] text-on-surface">help</span>
            </button>
            <div className="h-8 w-[2px] bg-[#111827]"></div>
            <div className="flex items-center gap-space-sm pl-space-xs">
              <div className="flex flex-col text-right">
                <span className="font-label-md text-label-md font-bold text-on-surface leading-tight">
                  Jonas Aly
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold">
                  Treasury VP
                </span>
              </div>
              <div className="w-9 h-9 bg-[#111827] border-2 border-[#111827] shadow-[2px_2px_0px_#111827] flex items-center justify-center text-on-primary font-label-md text-label-md font-bold tracking-wider">
                CF
              </div>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-[#111827]">
                <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Canvas Area */}
        <main className="w-full pt-16 bg-surface min-h-screen">
          <div className="flex flex-col w-full">
            <div className="p-space-lg max-w-[1440px] w-full mx-auto space-y-space-md">
              {/* Error Banner */}
              {error && (
                <div className="bg-red-100 border-2 border-[#111827] p-3 text-red-800 font-bold text-sm shadow-[2px_2px_0px_#111827] flex items-center justify-between">
                  <span>{error}</span>
                  <button onClick={fetchEmployees} className="underline text-xs">Retry</button>
                </div>
              )}

              {/* 1. Header Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pb-space-xs">
                <div>
                  <h1 className="font-display-md text-headline-lg lg:text-display-md text-on-surface tracking-tight leading-none">
                    Employee Directory &amp; Compensation Registry
                  </h1>
                  <p className="font-label-md text-label-md text-on-surface-variant font-medium mt-1.5 flex items-center gap-2">
                    <span>Active Workforce Roster, CTC Structures &amp; Statutory KYC Vault</span>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    <span className="font-tabular-num text-label-sm font-bold text-secondary uppercase">
                      GL Entity: IN-01
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-space-sm flex-wrap">
                  <button 
                    onClick={fetchEmployees}
                    className="bg-surface-container-lowest text-on-surface font-label-md text-label-md font-bold px-4 py-2.5 border-2 border-[#111827] shadow-[2px_2px_0px_#111827] hover:bg-surface-container-low transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                    <span>Sync Roster</span>
                  </button>
                  <button
                    onClick={handleOpenModal}
                    className="bg-primary-container text-on-primary font-label-md text-label-md font-bold px-5 py-2.5 border-2 border-[#111827] shadow-[4px_4px_0px_#111827] hover:bg-primary transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    <span>+ Onboard New Employee</span>
                  </button>
                </div>
              </div>

              {/* 2. Row 1: Neo-Brutalist Workforce KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
                {/* Card 1: Total Active Staff */}
                <div className="bg-surface-container-lowest border-2 border-[#111827] shadow-[4px_4px_0px_#111827] p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-label-sm text-label-sm font-bold text-on-surface-variant tracking-wider uppercase">
                      TOTAL ACTIVE STAFF
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-bold bg-[#A3E635] text-[#111827] border-[1.5px] border-[#111827]">
                      100% Verified
                    </span>
                  </div>
                  <div>
                    <div className="font-tabular-num text-3xl font-extrabold tracking-tight text-on-surface">
                      {totalStaffCount}
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      {totalStaffCount} On payroll • 0 Terminated
                    </p>
                  </div>
                </div>

                {/* Card 2: Monthly Gross CTC Pool */}
                <div className="bg-surface-container-lowest border-2 border-[#111827] shadow-[4px_4px_0px_#111827] p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-label-sm text-label-sm font-bold text-on-surface-variant tracking-wider uppercase">
                      MONTHLY GROSS CTC POOL
                    </span>
                    <span className="material-symbols-outlined text-primary-container text-[20px]">
                      account_balance_wallet
                    </span>
                  </div>
                  <div>
                    <div className="font-tabular-num text-3xl font-extrabold tracking-tight text-on-surface">
                      {formatINR(totalMonthlyGrossCTC)}
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      Avg {formatINR(avgMonthlyCTC)} / staff • Q4 Budget Mapped
                    </p>
                  </div>
                </div>

                {/* Card 3: New Tax Regime (115BAC) */}
                <div className="bg-surface-container-lowest border-2 border-[#111827] shadow-[4px_4px_0px_#111827] p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-label-sm text-label-sm font-bold text-on-surface-variant tracking-wider uppercase">
                      NEW TAX REGIME (115BAC)
                    </span>
                    <span className="material-symbols-outlined text-primary-container text-[20px]">
                      percent
                    </span>
                  </div>
                  <div>
                    <div className="font-tabular-num text-3xl font-extrabold tracking-tight text-primary-container">
                      {newRegimeCount} Staff
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      {oldRegimeCount} on Old Regime (Form 12BB verified)
                    </p>
                  </div>
                </div>

                {/* Card 4: Statutory KYC Coverage */}
                <div className="bg-surface-container-lowest border-2 border-[#111827] shadow-[4px_4px_0px_#111827] p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-label-sm text-label-sm font-bold text-on-surface-variant tracking-wider uppercase">
                      STATUTORY KYC COVERAGE
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-bold bg-[#A3E635] text-[#111827] border-[1.5px] border-[#111827]">
                      PAN &amp; UAN Active
                    </span>
                  </div>
                  <div>
                    <div className="font-tabular-num text-3xl font-extrabold tracking-tight text-on-surface">
                      {kycCompleteCount} / {totalStaffCount}
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      Zero pending ECR seeding
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Filter & Search Toolbar */}
              <div className="bg-surface-container-lowest border-2 border-[#111827] shadow-[3px_3px_0px_#111827] p-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative w-full sm:w-80">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-on-surface-variant pointer-events-none">
                      search
                    </span>
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-surface-container-lowest border-2 border-[#111827] text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary-container focus:shadow-[2px_2px_0px_#0033FF]"
                      placeholder="Search by Employee ID, Name, PAN, or UAN..."
                      type="text"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {['All', 'Engineering', 'Sales', 'Operations', 'Finance'].map((dept) => (
                      <button
                        key={dept}
                        onClick={() => setDepartmentFilter(dept)}
                        className={`px-3 py-1.5 text-label-sm font-label-sm font-bold border-2 border-[#111827] cursor-pointer transition-all ${
                          departmentFilter === dept
                            ? 'bg-[#111827] text-on-primary'
                            : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'
                        }`}
                      >
                        {dept} ({deptCounts[dept] || 0})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <select
                      value={regimeFilter}
                      onChange={(e) => setRegimeFilter(e.target.value)}
                      className="appearance-none bg-surface-container-lowest border-2 border-[#111827] pl-3 pr-8 py-1.5 text-label-sm font-label-sm font-bold text-on-surface focus:outline-none cursor-pointer"
                    >
                      <option value="All">Regime: All (115BAC &amp; Old)</option>
                      <option value="NEW_115BAC">New Tax Regime (115BAC)</option>
                      <option value="OLD">Old Regime (Deductions)</option>
                    </select>
                    <span className="material-symbols-outlined text-[16px] text-on-surface absolute right-2 top-2 pointer-events-none">
                      expand_more
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const csvContent =
                        'data:text/csv;charset=utf-8,' +
                        ['Employee ID,Name,Department,Designation,PAN,UAN,Gross CTC,Tax Regime']
                          .concat(
                            employees.map(
                              (e) =>
                                `${e.employeeId},"${e.fullName}",${e.department},"${e.designation}",${e.pan},${e.uan},${e.ctc?.monthlyGross || 0},${e.taxRegime}`
                            )
                          )
                          .join('\n');
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement('a');
                      link.setAttribute('href', encodedUri);
                      link.setAttribute('download', 'RupeeBook_Staff_Roster.csv');
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="bg-surface-container-lowest border-2 border-[#111827] px-3 py-1.5 text-label-sm font-label-sm font-bold text-on-surface hover:bg-surface-container-low shadow-[2px_2px_0px_#111827] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>Export Roster (CSV)</span>
                  </button>
                </div>
              </div>

              {/* 4. Main Employee Roster Table */}
              <div className="bg-surface-container-lowest border-2 border-[#111827] shadow-[4px_4px_0px_#111827] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low border-b-2 border-[#111827] text-label-sm font-label-sm font-bold uppercase tracking-wider text-on-surface select-none">
                        <th className="py-3 px-4">Employee</th>
                        <th className="py-3 px-4">Designation &amp; Dept</th>
                        <th className="py-3 px-4">Statutory KYC (PAN / UAN)</th>
                        <th className="py-3 px-4">Tax Regime</th>
                        <th className="py-3 px-4 text-right">Monthly Gross CTC</th>
                        <th className="py-3 px-4">Disbursement Bank</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#111827]/10 font-body-sm text-body-sm">
                      {loading ? (
                        <tr>
                          <td colSpan="8" className="py-12 text-center text-on-surface-variant font-bold">
                            <div className="flex items-center justify-center gap-2">
                              <span className="material-symbols-outlined animate-spin text-[24px]">sync</span>
                              <span>Loading live workforce roster from Express API...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredEmployees.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="py-12 text-center text-on-surface-variant">
                            <p className="font-bold text-base text-on-surface">No workforce records found</p>
                            <p className="text-sm mt-1">
                              {searchQuery || departmentFilter !== 'All'
                                ? 'No employees match the current filters.'
                                : 'The employee database is currently empty. Click "+ Onboard New Employee" to add the first staff member.'}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredEmployees.map((emp) => (
                          <tr key={emp._id || emp.employeeId} className="hover:bg-secondary-fixed/10 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary-container text-on-primary font-label-sm font-bold flex items-center justify-center border-[1.5px] border-[#111827]">
                                  {getInitials(emp.fullName)}
                                </div>
                                <div>
                                  <div className="font-label-md font-bold text-on-surface">{emp.fullName}</div>
                                  <div className="font-label-sm text-on-surface-variant font-semibold">
                                    {emp.employeeId}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-body-md font-medium text-on-surface">
                                {emp.designation}
                              </div>
                              <div className="text-label-sm text-on-surface-variant font-semibold">
                                {emp.department} • {emp.location || 'Bengaluru'}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-tabular-num">
                              <div className="font-bold text-on-surface tracking-tight">PAN: {emp.pan}</div>
                              <div className="text-label-sm text-on-surface-variant">UAN: {emp.uan}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-bold text-primary-container bg-surface-container-lowest border-[1.5px] border-primary-container">
                                {emp.taxRegime === 'OLD' ? 'OLD REGIME' : 'NEW 115BAC'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-tabular-num text-body-lg font-extrabold tracking-tight text-on-surface">
                              {formatINR(emp.ctc?.monthlyGross || 0)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-label-md font-bold text-on-surface">
                                {emp.bankAccount?.bankName || 'ICICI Bank'} ••••
                                {emp.bankAccount?.accountNumber ? emp.bankAccount.accountNumber.slice(-4) : '1234'}
                              </div>
                              <div className="text-label-sm text-secondary font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Penny-Drop OK
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-bold bg-[#A3E635] text-[#111827] border-[1.5px] border-[#111827]">
                                {emp.status === 'INACTIVE' ? 'Inactive' : 'Active'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Link
                                  to="/payroll/run"
                                  className="px-2 py-1 bg-surface-container-lowest border border-[#111827] text-label-sm font-bold hover:bg-surface-container shadow-[1px_1px_0px_#111827] active:shadow-none"
                                >
                                  Run Pay
                                </Link>
                                <Link
                                  to="/payslips"
                                  className="px-2 py-1 bg-surface-container-lowest border border-[#111827] text-label-sm font-bold hover:bg-surface-container shadow-[1px_1px_0px_#111827] active:shadow-none"
                                >
                                  View Payslip
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEmployee(emp)}
                                  title={`Delete ${emp.fullName}`}
                                  className="w-7 h-7 bg-surface-container-lowest border border-[#111827] text-error hover:bg-red-50 hover:text-red-700 shadow-[1px_1px_0px_#111827] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] flex items-center justify-center transition-all cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Summary Footer Strip */}
                <div className="bg-surface-container-low border-t-2 border-[#111827] px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 font-label-sm text-label-sm font-bold text-on-surface">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span>
                      Showing{' '}
                      <strong className="text-on-surface font-tabular-num font-extrabold">
                        {filteredEmployees.length}
                      </strong>{' '}
                      of{' '}
                      <strong className="text-on-surface font-tabular-num font-extrabold">
                        {totalStaffCount}
                      </strong>{' '}
                      active employees
                    </span>
                    <span className="hidden sm:inline text-on-surface-variant">•</span>
                    <span className="text-on-surface-variant">
                      Monthly CTC Total:{' '}
                      <strong className="text-on-surface font-tabular-num font-extrabold">
                        {formatINR(totalMonthlyGrossCTC)}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 bg-surface-container-lowest border-2 border-[#111827] text-on-surface text-label-sm font-bold hover:bg-surface-container shadow-[2px_2px_0px_#111827] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]">
                      ← Prev
                    </button>
                    <span className="px-2 py-1 text-on-surface font-tabular-num">Page 1 of 1</span>
                    <button className="px-3 py-1 bg-surface-container-lowest border-2 border-[#111827] text-on-surface text-label-sm font-bold hover:bg-surface-container shadow-[2px_2px_0px_#111827] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]">
                      Next →
                    </button>
                  </div>
                </div>
              </div>

              {/* 5. Footer Metadata Strip */}
              <div className="pt-2 pb-6 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-[#111827]/10 text-on-surface-variant font-label-sm text-label-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
                  <span>RupeeBook Enterprise Edition v4.9.2 • Statutory Engine: ISO 20022 Compliant</span>
                </div>
                <div className="font-tabular-num">Registry Last Reconciled: Live Database Sync</div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* =====================================================================
          ONBOARD NEW EMPLOYEE MODAL (Neo-Brutalist)
         ===================================================================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-surface-container-lowest border-2 border-[#111827] shadow-[8px_8px_0px_#111827] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#111827] mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container text-[24px]">person_add</span>
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Onboard New Employee
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 bg-surface border-2 border-[#111827] font-bold text-sm hover:bg-surface-container flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_#111827] active:translate-x-[1px] active:translate-y-[1px]"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-100 border-2 border-[#111827] text-red-800 text-sm font-bold shadow-[2px_2px_0px_#111827]">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitOnboard} className="space-y-4 font-body-sm text-body-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-sm text-label-sm font-bold uppercase mb-1">
                    Employee ID *
                  </label>
                  <input
                    required
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    placeholder="e.g. EMP-1010"
                    className="w-full border-2 border-[#111827] p-2 bg-surface text-on-surface font-bold focus:outline-none focus:border-primary-container"
                  />
                </div>

                <div>
                  <label className="block font-label-sm text-label-sm font-bold uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    required
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Priya Sharma"
                    className="w-full border-2 border-[#111827] p-2 bg-surface text-on-surface font-bold focus:outline-none focus:border-primary-container"
                  />
                </div>

                <div>
                  <label className="block font-label-sm text-label-sm font-bold uppercase mb-1">
                    Corporate Email *
                  </label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. priya@rupeebook.in"
                    className="w-full border-2 border-[#111827] p-2 bg-surface text-on-surface font-bold focus:outline-none focus:border-primary-container"
                  />
                </div>

                <div>
                  <label className="block font-label-sm text-label-sm font-bold uppercase mb-1">
                    Designation *
                  </label>
                  <input
                    required
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    placeholder="e.g. Staff Software Engineer"
                    className="w-full border-2 border-[#111827] p-2 bg-surface text-on-surface font-bold focus:outline-none focus:border-primary-container"
                  />
                </div>

                <div>
                  <label className="block font-label-sm text-label-sm font-bold uppercase mb-1">
                    Department *
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full border-2 border-[#111827] p-2 bg-surface text-on-surface font-bold focus:outline-none focus:border-primary-container"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Sales">Sales</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="Design">Design</option>
                  </select>
                </div>

                <div>
                  <label className="block font-label-sm text-label-sm font-bold uppercase mb-1">
                    State / Jurisdiction *
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full border-2 border-[#111827] p-2 bg-surface text-on-surface font-bold focus:outline-none focus:border-primary-container"
                  >
                    <option value="KA">Karnataka (KA)</option>
                    <option value="WB">West Bengal (WB)</option>
                    <option value="MH">Maharashtra (MH)</option>
                    <option value="DL">Delhi NCR (DL)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-label-sm text-label-sm font-bold uppercase mb-1">
                    PAN (Permanent Account No) *
                  </label>
                  <input
                    required
                    name="pan"
                    value={formData.pan}
                    onChange={handleInputChange}
                    placeholder="e.g. ABCPS1234F"
                    className="w-full border-2 border-[#111827] p-2 bg-surface text-on-surface font-bold uppercase focus:outline-none focus:border-primary-container"
                  />
                </div>

                <div>
                  <label className="block font-label-sm text-label-sm font-bold uppercase mb-1">
                    UAN (EPFO Universal Account) *
                  </label>
                  <input
                    required
                    name="uan"
                    value={formData.uan}
                    onChange={handleInputChange}
                    placeholder="e.g. 101294829103"
                    className="w-full border-2 border-[#111827] p-2 bg-surface text-on-surface font-bold focus:outline-none focus:border-primary-container"
                  />
                </div>

                <div>
                  <label className="block font-label-sm text-label-sm font-bold uppercase mb-1">
                    Tax Regime *
                  </label>
                  <select
                    name="taxRegime"
                    value={formData.taxRegime}
                    onChange={handleInputChange}
                    className="w-full border-2 border-[#111827] p-2 bg-surface text-on-surface font-bold focus:outline-none focus:border-primary-container"
                  >
                    <option value="NEW_115BAC">New Tax Regime (Sec 115BAC)</option>
                    <option value="OLD">Old Tax Regime (Chapter VI-A)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-label-sm text-label-sm font-bold uppercase mb-1">
                    Monthly Gross CTC (INR) *
                  </label>
                  <input
                    required
                    type="number"
                    min="10000"
                    step="500"
                    name="monthlyGross"
                    value={formData.monthlyGross}
                    onChange={handleInputChange}
                    placeholder="e.g. 85000"
                    className="w-full border-2 border-[#111827] p-2 bg-surface text-on-surface font-bold font-tabular-num focus:outline-none focus:border-primary-container"
                  />
                </div>

                <div>
                  <label className="block font-label-sm text-label-sm font-bold uppercase mb-1">
                    Bank Name *
                  </label>
                  <input
                    required
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    placeholder="e.g. HDFC Bank Ltd"
                    className="w-full border-2 border-[#111827] p-2 bg-surface text-on-surface font-bold focus:outline-none focus:border-primary-container"
                  />
                </div>

                <div>
                  <label className="block font-label-sm text-label-sm font-bold uppercase mb-1">
                    Bank Account Number *
                  </label>
                  <input
                    required
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. 501004928192"
                    className="w-full border-2 border-[#111827] p-2 bg-surface text-on-surface font-bold font-tabular-num focus:outline-none focus:border-primary-container"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-label-sm text-label-sm font-bold uppercase mb-1">
                    IFSC Code *
                  </label>
                  <input
                    required
                    name="ifsc"
                    value={formData.ifsc}
                    onChange={handleInputChange}
                    placeholder="e.g. HDFC0000240"
                    className="w-full border-2 border-[#111827] p-2 bg-surface text-on-surface font-bold uppercase focus:outline-none focus:border-primary-container"
                  />
                </div>
              </div>

              <div className="pt-4 border-t-2 border-[#111827] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border-2 border-[#111827] bg-surface font-bold text-on-surface hover:bg-surface-container cursor-pointer shadow-[2px_2px_0px_#111827]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 border-2 border-[#111827] bg-primary-container text-on-primary font-bold hover:bg-primary shadow-[4px_4px_0px_#111827] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                      <span>Onboarding...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">check</span>
                      <span>Save &amp; Onboard</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
