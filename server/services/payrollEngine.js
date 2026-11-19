export const calculateSalaryBreakdown = (emp, att) => {
  const totalWorkingDays = att?.totalWorkingDays || 30;
  const lossOfPayDays = att?.lossOfPayDays || 0;
  const paidDays = Math.max(0, totalWorkingDays - lossOfPayDays);
  const prorationRatio = paidDays / totalWorkingDays;

  // Support either nested emp.ctc or flat salary fields on Employee
  const monthlyBasic = emp.ctc?.basic ?? emp.basicSalary ?? Math.round((emp.ctc?.monthlyGross || 0) * 0.5);
  const monthlyHra = emp.ctc?.hra ?? emp.hra ?? Math.round((emp.ctc?.monthlyGross || 0) * 0.3);
  const monthlySpecial = emp.ctc?.specialAllowance ?? emp.specialAllowance ?? Math.round((emp.ctc?.monthlyGross || 0) * 0.2);

  // 1. Prorated Earnings
  const basic = Math.round(monthlyBasic * prorationRatio);
  const hra = Math.round(monthlyHra * prorationRatio);
  const specialAllowance = Math.round(monthlySpecial * prorationRatio);
  const grossPay = basic + hra + specialAllowance;

  // 2. EPF Calculation (12% Employee + 12% Employer capped at ₹15,000 wage ceiling)
  const epfWage = Math.min(basic, 15000);
  const pfEmployee = Math.round(epfWage * 0.12);
  const pfEmployer = Math.round(epfWage * 0.12);

  // 3. ESIC Calculation (0.75% Employee + 3.25% Employer if gross <= ₹21,000)
  const fullGross = monthlyBasic + monthlyHra + monthlySpecial;
  const isEsicEligible = fullGross > 0 && fullGross <= 21000;
  const esicEmployee = isEsicEligible ? Math.ceil(grossPay * 0.0075) : 0;
  const esicEmployer = isEsicEligible ? Math.ceil(grossPay * 0.0325) : 0;

  // 4. State Professional Tax (KA/MH ₹200, WB ₹150 when gross >= ₹15,000)
  let professionalTax = 0;
  if (grossPay >= 15000) {
    professionalTax = emp.state === 'WB' ? 150 : 200;
  }

  // 5. Monthly TDS (Section 192 annualized slab estimation)
  const annualProjected = grossPay * 12;
  let annualTax = 0;
  const regime = emp.taxRegime || 'NEW_115BAC';

  if (regime === 'NEW_115BAC' || regime === 'NEW') {
    const taxable = Math.max(0, annualProjected - 75000);
    if (taxable > 1500000) annualTax = (taxable - 1500000) * 0.3 + 140000;
    else if (taxable > 1200000) annualTax = (taxable - 1200000) * 0.2 + 80000;
    else if (taxable > 1000000) annualTax = (taxable - 1000000) * 0.15 + 50000;
    else if (taxable > 700000) annualTax = (taxable - 700000) * 0.1 + 20000;
  } else {
    const taxable = Math.max(0, annualProjected - 200000);
    if (taxable > 1000000) annualTax = (taxable - 1000000) * 0.3 + 112500;
    else if (taxable > 500000) annualTax = (taxable - 500000) * 0.2 + 12500;
  }
  const tds = Math.round((annualTax * 1.04) / 12);

  const totalDeductions = pfEmployee + esicEmployee + professionalTax + tds;
  const netPay = grossPay - totalDeductions;

  return {
    totalWorkingDays,
    paidDays,
    lossOfPayDays,
    earnings: {
      basic,
      hra,
      specialAllowance,
      grossPay,
    },
    deductions: {
      pfEmployee,
      esicEmployee,
      professionalTax,
      tds,
      totalDeductions,
    },
    employerContributions: {
      pfEmployer,
      esicEmployer,
    },
    netPay,
  };
};

export const buildAccrualJournalEntries = (batchReference, totals) => {
  const totalSalaryExpense =
    totals.totalGross + totals.totalEmployerPf + totals.totalEmployerEsic;

  return {
    batchReference,
    narration: `Monthly Payroll Accrual & Statutory Liabilities — ${batchReference}`,
    records: [
      {
        accountCode: 'EXP-501',
        accountName: 'Payroll Expense - Salaries & Employer Statutory',
        type: 'DEBIT',
        amount: totalSalaryExpense,
      },
      {
        accountCode: 'LIAB-201',
        accountName: 'Net Salaries Payable',
        type: 'CREDIT',
        amount: totals.totalNetPayable,
      },
      {
        accountCode: 'LIAB-202',
        accountName: 'EPF Payable (Employee + Employer)',
        type: 'CREDIT',
        amount: totals.totalPfLiability,
      },
      {
        accountCode: 'LIAB-203',
        accountName: 'ESIC Payable (Employee + Employer)',
        type: 'CREDIT',
        amount: totals.totalEsicLiability,
      },
      {
        accountCode: 'LIAB-204',
        accountName: 'Professional Tax Payable',
        type: 'CREDIT',
        amount: totals.totalPtLiability,
      },
      {
        accountCode: 'LIAB-205',
        accountName: 'TDS Payable (Section 192)',
        type: 'CREDIT',
        amount: totals.totalTdsLiability,
      },
    ],
  };
};