import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:5000/api/v1';

export default function Settings() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState('entity');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Settings state
  const [settings, setSettings] = useState({
    entityCode: 'IN-01',
    legalEntityName: 'RupeeBook Financial Systems Pvt. Ltd.',
    corporatePan: 'AABCR8821K',
    tan: 'BLRR19284F',
    epfoCode: 'PYBOM2489102000',
    esicCode: '53000918270011001',
    cin: 'U72200KA2021PTC148892',
    epfWageCeiling: 15000,
    capEmployerEpf: true,
    esicGrossLimit: 21000,
    defaultTaxRegime: 'NEW_115BAC',
    payCycleCutoff: '28th of Every Month',
    lopBasis: 'CALENDAR_DAYS',
    glMappings: [
      {
        head: 'Gross Basic & Dearness Allowance (DA)',
        category: 'Payroll Expense',
        glCode: 'EXP-501',
        glName: 'Payroll Expense - Salaries & Wages',
        postingRule: 'Debit (DR)',
        autoSync: true,
      },
      {
        head: 'Net Salary Payable (Direct Disbursal)',
        category: 'Current Liability',
        glCode: 'LIAB-201',
        glName: 'Salary Clearing Account (Bank NEFT/RTGS)',
        postingRule: 'Credit (CR)',
        autoSync: true,
      },
      {
        head: 'EPF Payable (Employee + Employer Remittance)',
        category: 'Current Liability',
        glCode: 'LIAB-202',
        glName: 'Statutory Liabilities - Provident Fund',
        postingRule: 'Credit (CR)',
        autoSync: true,
      },
      {
        head: 'ESIC Payable (Emp + Empr Pool)',
        category: 'Current Liability',
        glCode: 'LIAB-203',
        glName: 'Statutory Liabilities - ESIC Pool',
        postingRule: 'Credit (CR)',
        autoSync: true,
      },
      {
        head: 'Professional Tax Payable (KA / WB Multi-State)',
        category: 'Current Liability',
        glCode: 'LIAB-204',
        glName: 'State PT Withholding Pool (KA/WB)',
        postingRule: 'Credit (CR)',
        autoSync: true,
      },
      {
        head: 'TDS on Salaries (Income Tax Sec 192)',
        category: 'Current Liability',
        glCode: 'LIAB-205',
        glName: 'Central Income Tax Withholding Ledger',
        postingRule: 'Credit (CR)',
        autoSync: true,
      },
    ],
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/payroll/settings`);
      const json = await res.json();
      if (json.success && json.data) {
        setSettings((prev) => ({
          ...prev,
          ...json.data,
          glMappings:
            Array.isArray(json.data.glMappings) && json.data.glMappings.length > 0
              ? json.data.glMappings
              : prev.glMappings,
        }));
      }
    } catch (err) {
      console.error('Error fetching institutional settings:', err);
      setError('Could not connect to live Express API. Verify server on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleInputChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleGlMappingChange = (index, field, value) => {
    setSettings((prev) => {
      const updated = [...prev.glMappings];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, glMappings: updated };
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE}/payroll/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setToastMessage(
          'Ledger mapping, statutory ceilings, and MCA compliance hashes saved to institutional store.'
        );
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4500);
      } else {
        alert(json.message || 'Failed to update settings');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Network error connecting to Express API');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Revert all unsaved adjustments to entity IN-01 default statutory template?')) {
      await fetchSettings();
      setShowToast(true);
      setToastMessage('Settings reloaded from database.');
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased selection:bg-secondary selection:text-on-secondary min-h-screen">
      {/* Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Wrapper */}
      <div className="pl-60">
        {/* Fixed Top Bar */}
        <header className="fixed top-0 left-60 right-0 h-16 bg-surface-container-lowest border-b-2 border-[#111827] z-40 px-space-lg flex items-center justify-between shadow-[0_2px_0px_#111827]">
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-sm bg-surface-container-low border-2 border-[#111827] px-space-md py-1 shadow-[2px_2px_0px_#111827]">
              <span className="material-symbols-outlined text-[18px] text-primary-container">domain</span>
              <span className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider">
                Global Treasury Corp
              </span>
              <span className="font-label-sm text-label-sm bg-[#111827] text-white px-1.5 py-0.5 rounded-none font-bold">
                {settings.entityCode || 'IN-01'}
              </span>
            </div>
            <span className="text-[#111827] font-bold">/</span>
            <div className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant">
              <span className="font-bold text-on-surface">Payroll Run:</span>
              <span className="font-tabular-num text-tabular-num font-semibold text-primary">
                November 2026
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-md">
            <button
              onClick={fetchSettings}
              aria-label="Refresh Settings"
              className="w-9 h-9 bg-surface border-2 border-[#111827] flex items-center justify-center hover:bg-surface-container hover:text-on-surface shadow-[2px_2px_0px_#111827] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              title="Refresh from Live API"
            >
              <span className="material-symbols-outlined text-[20px] text-on-surface">sync</span>
            </button>
            <div className="h-6 w-0.5 bg-[#111827]"></div>
            <div className="flex items-center gap-space-sm">
              <div className="flex-col text-right hidden sm:flex">
                <span className="font-label-md text-label-md font-bold text-on-surface leading-tight">
                  Jonas Aly
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                  VP Treasury
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-[#111827] shadow-[2px_2px_0px_#111827]">
                <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="w-full pt-16 bg-surface min-h-screen px-space-lg py-space-lg">
          <div className="flex flex-col w-full">
            {error && (
              <div className="mb-4 bg-red-100 border-2 border-[#111827] p-3 text-red-800 font-bold text-sm shadow-[2px_2px_0px_#111827] flex items-center justify-between">
                <span>{error}</span>
                <button onClick={fetchSettings} className="underline text-xs cursor-pointer">
                  Retry
                </button>
              </div>
            )}

            {/* Top Header Bar */}
            <section className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md mb-space-lg mt-4">
              <div className="flex flex-col space-y-space-xs">
                <div className="flex items-center gap-space-sm mb-1">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-primary-container text-on-primary font-label-sm text-label-sm border-2 border-[#111827] shadow-[2px_2px_0px_#111827]">
                    <span className="material-symbols-outlined text-[14px]">tune</span>
                    CORE TREASURY CONFIG
                  </span>
                  <span className="font-tabular-num text-label-sm text-on-surface-variant font-bold">
                    NODE: BLR-DC-04
                  </span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                  System Settings &amp; Statutory Configuration
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-4xl">
                  Corporate Entity Profile, Statutory Slabs, GL Chart of Accounts &amp; Bank API Keys •{' '}
                  <span className="font-bold text-on-surface uppercase tracking-wider">
                    GL ENTITY: {settings.entityCode || 'IN-01'} ({settings.legalEntityName || 'RupeeBook FinSys'})
                  </span>
                </p>
              </div>

              {/* Global CTA Controls */}
              <div className="flex items-center gap-space-sm shrink-0">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 border-2 border-[#111827] bg-surface-container-lowest text-on-surface font-label-md text-label-md px-4 py-2.5 shadow-[2px_2px_0px_#111827] hover:bg-surface-container hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#111827] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                  Reset Defaults
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 border-2 border-[#111827] bg-primary-container text-on-primary font-label-md text-label-md px-5 py-2.5 shadow-[4px_4px_0px_#111827] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#111827] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer font-bold"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {saving ? 'sync' : 'verified'}
                  </span>
                  {saving ? 'Saving...' : 'Save All Configurations'}
                </button>
              </div>
            </section>

            {/* Notification Toast (Triggered on Save) */}
            {showToast && (
              <div className="mb-space-md border-2 border-[#111827] bg-secondary-fixed text-on-secondary-fixed p-space-md shadow-[4px_4px_0px_#111827] flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-[22px]">check_circle</span>
                  <span className="font-label-lg text-label-lg font-bold">
                    {toastMessage ||
                      'Ledger mapping, statutory ceilings, and MCA compliance hashes saved to institutional store.'}
                  </span>
                </div>
                <span className="font-tabular-num text-label-sm font-bold uppercase tracking-wider">
                  STATUS: COMMIT_OK
                </span>
              </div>
            )}

            {/* Horizontal Configuration Tab Bar */}
            <nav
              aria-label="Configuration Modules"
              className="border-2 border-[#111827] bg-surface-container-low flex flex-wrap gap-2 p-1.5 mb-space-lg shadow-[2px_2px_0px_#111827]"
            >
              <button
                type="button"
                onClick={() => setActiveTab('entity')}
                className={
                  activeTab === 'entity'
                    ? 'bg-[#111827] text-white font-label-md text-label-md px-5 py-2.5 border-2 border-[#111827] shadow-[2px_2px_0px_#111827] flex items-center gap-2 cursor-pointer'
                    : 'bg-surface-container-lowest text-[#111827] font-label-md text-label-md px-4 py-2 border-2 border-[#111827] hover:bg-surface-container flex items-center gap-2 transition-all cursor-pointer'
                }
              >
                <span className="material-symbols-outlined text-[18px]">domain_verification</span>
                <span>Entity &amp; Statutory Rules</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('gl')}
                className={
                  activeTab === 'gl'
                    ? 'bg-[#111827] text-white font-label-md text-label-md px-5 py-2.5 border-2 border-[#111827] shadow-[2px_2px_0px_#111827] flex items-center gap-2 cursor-pointer'
                    : 'bg-surface-container-lowest text-[#111827] font-label-md text-label-md px-4 py-2 border-2 border-[#111827] hover:bg-surface-container flex items-center gap-2 transition-all cursor-pointer'
                }
              >
                <span className="material-symbols-outlined text-[18px]">account_tree</span>
                <span>GL Chart of Accounts</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('banking')}
                className={
                  activeTab === 'banking'
                    ? 'bg-[#111827] text-white font-label-md text-label-md px-5 py-2.5 border-2 border-[#111827] shadow-[2px_2px_0px_#111827] flex items-center gap-2 cursor-pointer'
                    : 'bg-surface-container-lowest text-[#111827] font-label-md text-label-md px-4 py-2 border-2 border-[#111827] hover:bg-surface-container flex items-center gap-2 transition-all cursor-pointer'
                }
              >
                <span className="material-symbols-outlined text-[18px]">hub</span>
                <span>Banking &amp; H2H Gateways</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('rbac')}
                className={
                  activeTab === 'rbac'
                    ? 'bg-[#111827] text-white font-label-md text-label-md px-5 py-2.5 border-2 border-[#111827] shadow-[2px_2px_0px_#111827] flex items-center gap-2 cursor-pointer'
                    : 'bg-surface-container-lowest text-[#111827] font-label-md text-label-md px-4 py-2 border-2 border-[#111827] hover:bg-surface-container flex items-center gap-2 transition-all cursor-pointer'
                }
              >
                <span className="material-symbols-outlined text-[18px]">shield_person</span>
                <span>Maker-Checker RBAC</span>
              </button>
            </nav>

            {/* Main 2-Column Configuration Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg mb-space-lg">
              {/* Left Card: Corporate Entity & Registration Vault */}
              <div className="bg-surface-container-lowest border-2 border-[#111827] shadow-[4px_4px_0px_#111827] p-space-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-space-sm border-b-2 border-[#111827] mb-space-md">
                    <div className="flex items-center gap-space-sm">
                      <span className="material-symbols-outlined text-primary-container text-[24px]">
                        corporate_fare
                      </span>
                      <h2 className="font-headline-md text-headline-md text-on-surface">
                        Corporate Entity &amp; Registration Vault
                      </h2>
                    </div>
                    <span className="inline-flex items-center gap-1 bg-[#A3E635] text-[#111827] border-2 border-[#111827] font-label-sm text-label-sm px-2 py-0.5 font-bold uppercase">
                      <span className="material-symbols-outlined text-[12px]">verified</span>
                      MCA &amp; CBDT Verified
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                    Institutional tax filing identifiers and statutory registration credentials bound
                    to primary payroll disbursement accounts.
                  </p>

                  {/* Structured Form Grid */}
                  <div className="grid grid-cols-2 gap-space-md">
                    <div className="col-span-2 flex flex-col">
                      <label className="font-label-sm text-label-sm text-on-surface font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>Legal Entity Name</span>
                        <span className="text-primary font-mono text-[11px]">ROC REGISTERED</span>
                      </label>
                      <input
                        className="border-2 border-[#111827] p-2.5 font-label-lg text-label-lg font-bold bg-[#F9F9F9] focus:outline-none focus:border-primary-container focus:shadow-[2px_2px_0px_#0033ff]"
                        type="text"
                        value={settings.legalEntityName}
                        onChange={(e) => handleInputChange('legalEntityName', e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-label-sm text-label-sm text-on-surface font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>Corporate PAN</span>
                        <span className="material-symbols-outlined text-[14px] text-secondary">
                          verified_user
                        </span>
                      </label>
                      <input
                        className="border-2 border-[#111827] p-2.5 font-tabular-num text-tabular-num font-bold bg-surface-container-lowest focus:outline-none focus:border-primary-container focus:shadow-[2px_2px_0px_#0033ff] uppercase"
                        type="text"
                        value={settings.corporatePan}
                        onChange={(e) => handleInputChange('corporatePan', e.target.value.toUpperCase())}
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-label-sm text-label-sm text-on-surface font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>Tax Deduction Account (TAN)</span>
                        <span className="material-symbols-outlined text-[14px] text-secondary">
                          verified_user
                        </span>
                      </label>
                      <input
                        className="border-2 border-[#111827] p-2.5 font-tabular-num text-tabular-num font-bold bg-surface-container-lowest focus:outline-none focus:border-primary-container focus:shadow-[2px_2px_0px_#0033ff] uppercase"
                        type="text"
                        value={settings.tan}
                        onChange={(e) => handleInputChange('tan', e.target.value.toUpperCase())}
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-label-sm text-label-sm text-on-surface font-bold uppercase tracking-wider mb-1">
                        EPFO Establishment Code
                      </label>
                      <input
                        className="border-2 border-[#111827] p-2.5 font-tabular-num text-tabular-num font-bold bg-surface-container-lowest focus:outline-none focus:border-primary-container focus:shadow-[2px_2px_0px_#0033ff]"
                        type="text"
                        value={settings.epfoCode}
                        onChange={(e) => handleInputChange('epfoCode', e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-label-sm text-label-sm text-on-surface font-bold uppercase tracking-wider mb-1">
                        ESIC Employer Code
                      </label>
                      <input
                        className="border-2 border-[#111827] p-2.5 font-tabular-num text-tabular-num font-bold bg-surface-container-lowest focus:outline-none focus:border-primary-container focus:shadow-[2px_2px_0px_#0033ff]"
                        type="text"
                        value={settings.esicCode}
                        onChange={(e) => handleInputChange('esicCode', e.target.value)}
                      />
                    </div>

                    <div className="col-span-2 border-2 border-[#111827] p-3 bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px] text-primary-container">
                          pin_drop
                        </span>
                        <div>
                          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold block">
                            Tax Jurisdictions
                          </span>
                          <span className="font-label-md text-label-md font-bold text-on-surface">
                            Karnataka (KA-29) &amp; West Bengal (WB-19)
                          </span>
                        </div>
                      </div>
                      <span className="inline-flex items-center self-start sm:self-auto gap-1 rounded-full px-2.5 py-0.5 border-[1.5px] border-[#111827] bg-[#A3E635] text-[#111827] font-label-sm text-label-sm font-bold">
                        Multi-State PT Active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-space-md pt-space-sm border-t border-[#111827] flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                  <span className="font-tabular-num">CIN: {settings.cin || 'U72200KA2021PTC148892'}</span>
                  <span className="font-semibold text-right">
                    ROC Bengaluru Registrar • Form 12A Certified
                  </span>
                </div>
              </div>

              {/* Right Card: Statutory Thresholds & Payroll Cycle Rules */}
              <div className="bg-surface-container-lowest border-2 border-[#111827] shadow-[4px_4px_0px_#111827] p-space-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-space-sm border-b-2 border-[#111827] mb-space-md">
                    <div className="flex items-center gap-space-sm">
                      <span className="material-symbols-outlined text-primary-container text-[24px]">
                        gavel
                      </span>
                      <h2 className="font-headline-md text-headline-md text-on-surface">
                        Statutory Thresholds &amp; Payroll Cycle Rules
                      </h2>
                    </div>
                    <span className="inline-flex items-center gap-1 bg-primary-container text-on-primary border-2 border-[#111827] font-label-sm text-label-sm px-2 py-0.5 font-bold uppercase">
                      FY 2026-27 Active
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                    Configured statutory deduction rules, limits, and payout schedules enforcing
                    automated payroll engine limits.
                  </p>

                  <div className="space-y-space-md">
                    {/* EPF Ceiling & Toggle */}
                    <div className="border-2 border-[#111827] p-3 bg-surface-container-lowest">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-label-sm text-label-sm text-on-surface font-bold uppercase tracking-wider block">
                            EPF Statutory Wage Ceiling
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            Mandatory capping on PF Basic component
                          </span>
                        </div>
                        <div className="flex items-center gap-1 border-2 border-[#111827] px-3 py-1 bg-surface-container-high">
                          <input
                            type="number"
                            value={settings.epfWageCeiling}
                            onChange={(e) => handleInputChange('epfWageCeiling', Number(e.target.value) || 0)}
                            className="w-20 font-tabular-num text-headline-sm font-bold text-on-surface bg-transparent focus:outline-none"
                          />
                          <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">
                            /MO
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#111827]">
                        <span className="font-label-sm text-label-sm font-bold text-on-surface flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-primary">
                            rule
                          </span>
                          Cap Employer EPF (12%) contribution at ₹1,800/month maximum
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            checked={settings.capEmployerEpf}
                            onChange={(e) => handleInputChange('capEmployerEpf', e.target.checked)}
                            className="sr-only peer"
                            id="toggle-epf"
                            type="checkbox"
                          />
                          <div className="w-12 h-6 bg-surface-container border-2 border-[#111827] peer-focus:outline-none peer-checked:bg-[#A3E635] transition-all"></div>
                          <div className="absolute left-0.5 top-0.5 bg-[#111827] w-5 h-5 transition-all peer-checked:translate-x-6 border border-[#111827]"></div>
                        </label>
                      </div>
                    </div>

                    {/* ESIC Gross Eligibility */}
                    <div className="border-2 border-[#111827] p-3 bg-surface-container-lowest flex items-center justify-between">
                      <div className="max-w-[70%]">
                        <span className="font-label-sm text-label-sm text-on-surface font-bold uppercase tracking-wider block">
                          ESIC Gross Eligibility Limit
                        </span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Staff earning ≤ ₹21,000 gross wages covered under statutory pool (0.75% Emp +
                          3.25% Empr).
                        </p>
                      </div>
                      <div className="flex items-center border-2 border-[#111827] px-3 py-1 bg-surface-container-high">
                        <input
                          type="number"
                          value={settings.esicGrossLimit}
                          onChange={(e) => handleInputChange('esicGrossLimit', Number(e.target.value) || 0)}
                          className="w-20 font-tabular-num text-headline-sm font-bold text-on-surface bg-transparent focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Tax Regime & Pay Cycle Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                      <div className="flex flex-col">
                        <label className="font-label-sm text-label-sm text-on-surface font-bold uppercase tracking-wider mb-1">
                          Default Income Tax Regime
                        </label>
                        <select
                          value={settings.defaultTaxRegime}
                          onChange={(e) => handleInputChange('defaultTaxRegime', e.target.value)}
                          className="border-2 border-[#111827] p-2.5 font-label-md text-label-md font-bold bg-surface-container-lowest focus:outline-none focus:border-primary-container focus:shadow-[2px_2px_0px_#0033ff]"
                        >
                          <option value="NEW_115BAC">New Tax Regime u/s 115BAC (Default)</option>
                          <option value="OLD">Old Tax Regime (Declaration Mandatory)</option>
                        </select>
                        <span className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                          Form 12BB declaration overrides default.
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <label className="font-label-sm text-label-sm text-on-surface font-bold uppercase tracking-wider mb-1">
                          Monthly Pay Cycle Cutoff
                        </label>
                        <input
                          className="w-full border-2 border-[#111827] p-2.5 font-label-md text-label-md font-bold bg-surface-container-lowest focus:outline-none"
                          type="text"
                          value={settings.payCycleCutoff}
                          onChange={(e) => handleInputChange('payCycleCutoff', e.target.value)}
                        />
                        <span className="font-label-sm text-label-sm text-primary font-bold mt-1">
                          Disbursal: Last Working Day
                        </span>
                      </div>
                    </div>

                    {/* LOP Calculation Basis */}
                    <div className="border-2 border-[#111827] p-2.5 bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="font-label-sm text-label-sm text-on-surface font-bold uppercase tracking-wider">
                        Loss of Pay (LOP) Basis:
                      </span>
                      <div className="flex items-center gap-4">
                        <label className="inline-flex items-center gap-2 cursor-pointer font-label-sm text-label-sm font-bold text-on-surface">
                          <input
                            checked={settings.lopBasis === 'CALENDAR_DAYS'}
                            onChange={() => handleInputChange('lopBasis', 'CALENDAR_DAYS')}
                            className="accent-primary-container w-4 h-4 cursor-pointer"
                            name="lop_basis"
                            type="radio"
                          />
                          <span>Calendar Days (30/31d)</span>
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer font-label-sm text-label-sm font-semibold text-on-surface-variant">
                          <input
                            checked={settings.lopBasis === 'WORKING_DAYS'}
                            onChange={() => handleInputChange('lopBasis', 'WORKING_DAYS')}
                            className="accent-primary-container w-4 h-4 cursor-pointer"
                            name="lop_basis"
                            type="radio"
                          />
                          <span>Working Days (26d Standard)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-space-md pt-space-sm border-t border-[#111827] flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                  <span className="font-tabular-num">Last Circular Revision: Oct 2026</span>
                  <span className="font-semibold text-right">Rule Engine: IN-REV-2026.04</span>
                </div>
              </div>
            </div>

            {/* Bottom Full-Width Card: Double-Entry General Ledger Account Mapping */}
            <div className="bg-surface-container-lowest border-2 border-[#111827] shadow-[4px_4px_0px_#111827] p-space-lg mb-space-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-space-sm border-b-2 border-[#111827] mb-space-md gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container text-[24px]">
                      receipt_long
                    </span>
                    <h2 className="font-headline-md text-headline-md text-on-surface">
                      Double-Entry General Ledger Account Mapping
                    </h2>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Real-time synchronization with ERP systems (Tally Prime, Zoho Books, SAP S/4HANA
                    &amp; NetSuite Enterprise).
                  </p>
                </div>

                <div className="flex items-center gap-space-sm">
                  <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 bg-surface-container-low border-2 border-[#111827]">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                    <span className="font-tabular-num text-label-sm font-bold uppercase tracking-wider text-on-surface">
                      Auto-Sync Protocol v2.1
                    </span>
                  </div>
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center gap-1.5 border-2 border-[#111827] bg-[#A3E635] text-[#111827] font-label-md text-label-md font-bold px-3.5 py-1.5 shadow-[2px_2px_0px_#111827] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    Save GL Mappings
                  </button>
                </div>
              </div>

              {/* Data Table Container */}
              <div className="overflow-x-auto border-2 border-[#111827]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#111827] text-white font-label-sm text-label-sm uppercase tracking-wider border-b-2 border-[#111827]">
                      <th className="py-3 px-4">PAYROLL COMPONENT / HEAD</th>
                      <th className="py-3 px-4">ACCOUNT CATEGORY</th>
                      <th className="py-3 px-4">TARGET GL CODE</th>
                      <th className="py-3 px-4">GL LEDGER NAME</th>
                      <th className="py-3 px-4 text-center">POSTING RULE</th>
                      <th className="py-3 px-4 text-center">SYNC STATUS</th>
                      <th className="py-3 px-4 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#111827] font-body-sm text-body-sm text-on-surface">
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-on-surface-variant font-bold">
                          Loading GL mappings from Express API...
                        </td>
                      </tr>
                    ) : (
                      settings.glMappings.map((gl, i) => (
                        <tr key={i} className="hover:bg-[#84CC16]/10 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-on-surface flex items-center gap-2">
                            <span
                              className={`w-2 h-2 ${
                                gl.postingRule?.includes('Debit') ? 'bg-primary' : 'bg-secondary'
                              }`}
                            ></span>
                            {gl.head}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-on-surface-variant">
                            {gl.category}
                          </td>
                          <td className="py-3.5 px-4 font-tabular-num font-bold text-primary">
                            <input
                              className="font-mono font-bold bg-transparent border-b border-[#111827]/30 w-24 focus:outline-none focus:border-primary"
                              value={gl.glCode}
                              onChange={(e) => handleGlMappingChange(i, 'glCode', e.target.value)}
                            />
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-on-surface">
                            <input
                              className="bg-transparent border-b border-[#111827]/30 w-full focus:outline-none focus:border-primary"
                              value={gl.glName}
                              onChange={(e) => handleGlMappingChange(i, 'glName', e.target.value)}
                            />
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 border border-[#111827] font-tabular-num text-[11px] font-bold ${
                                gl.postingRule?.includes('Debit')
                                  ? 'bg-primary text-white'
                                  : 'bg-[#111827] text-white'
                              }`}
                            >
                              {gl.postingRule || 'Debit (DR)'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleGlMappingChange(i, 'autoSync', !gl.autoSync)}
                              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 border-[1.5px] border-[#111827] bg-[#A3E635] text-[#111827] font-label-sm text-label-sm font-bold cursor-pointer"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#111827]"></span>
                              {gl.autoSync ? 'Auto-Sync Enabled' : 'Manual Sync'}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={handleSave}
                              className="font-label-sm text-label-sm font-bold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              Save <span className="material-symbols-outlined text-[14px]">save</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Reconciled Audit Strip at Bottom of Table */}
              <div className="mt-space-sm p-space-sm border-2 border-[#111827] bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">task_alt</span>
                  <span className="font-label-md text-label-md font-bold text-on-surface">
                    Total {settings.glMappings.length}/{settings.glMappings.length} Ledger Accounts Validated &amp; Mapped
                  </span>
                  <span className="text-on-surface-variant text-body-sm font-normal">
                    | Zero unassigned line-items detected
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-tabular-num text-label-sm text-on-surface font-semibold bg-surface-container-lowest border border-[#111827] px-2 py-0.5">
                    ERP Sync: SAP RFC-3829
                  </span>
                  <span className="font-tabular-num text-label-sm font-bold text-secondary">
                    Webhook Ping: Live Connected
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Regulatory Engine Banner / Footer */}
            <footer className="border-2 border-[#111827] bg-surface-container-lowest p-space-md shadow-[4px_4px_0px_#111827] flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-[20px] text-primary-container">
                  verified
                </span>
                <span className="font-label-md text-label-md font-bold text-on-surface">
                  RupeeBook Enterprise Edition v4.9.2
                </span>
                <span className="text-on-surface-variant">•</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">
                  Statutory Engine: ISO 20022 Compliant
                </span>
              </div>
              <div className="font-tabular-num text-label-sm text-on-surface-variant font-semibold">
                Last Configuration Checksum:{' '}
                <span className="font-mono text-on-surface font-bold">SHA256:7f08c3e89a</span> •
                Live Express API Connected
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
