import express from 'express';
import {
  reconcileAttendance,
  getAttendanceByCycle,
  processBatchPayroll,
  getPayslips,
  getPayslipById,
  getLedgerEntries,
  disbursePayroll,
} from '../controllers/payrollController.js';
import Settings from '../models/Settings.js';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Payslip from '../models/Payslip.js';
import JournalEntry from '../models/JournalEntry.js';

const router = express.Router();

// ============================================================================
// 1. ATTENDANCE RECONCILIATION ROUTES
// ============================================================================
router.route('/attendance')
  .post(reconcileAttendance)
  .get(getAttendanceByCycle);

// Parameterized cycle attendance lookup helper (e.g., /attendance/2026-11)
router.get('/attendance/:cycle', async (req, res) => {
  try {
    const parts = req.params.cycle.split('-');
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const records = await Attendance.find({ month, year }).populate(
      'employee',
      'employeeId fullName department designation'
    );
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// 2. PAYROLL PROCESSING & DISBURSEMENT ROUTES
// ============================================================================
router.post('/process', processBatchPayroll);
router.patch('/disburse', disbursePayroll);
router.post('/disburse', disbursePayroll);

// ============================================================================
// 3. PAYSLIPS ROUTES
// ============================================================================
router.get('/payslips', getPayslips);
router.get('/payslips/:id', getPayslipById);

// ============================================================================
// 4. GENERAL LEDGER ENTRIES
// ============================================================================
router.get('/ledger', getLedgerEntries);

// ============================================================================
// 5. SETTINGS & GL MAPPING ROUTES
// ============================================================================
router.get('/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne({ entityCode: 'IN-01' });
    if (!settings) {
      settings = await Settings.create({
        entityCode: 'IN-01',
        legalEntityName: 'RupeeBook Financial Systems Pvt. Ltd.',
        glMappings: [
          { head: 'Gross Basic & Dearness Allowance (DA)', category: 'Payroll Expense', glCode: 'EXP-501', glName: 'Payroll Expense - Salaries & Wages', postingRule: 'Debit (DR)', autoSync: true },
          { head: 'Net Salary Payable (Direct Disbursal)', category: 'Current Liability', glCode: 'LIAB-201', glName: 'Salary Clearing Account (Bank NEFT/RTGS)', postingRule: 'Credit (CR)', autoSync: true },
          { head: 'EPF Payable (Employee + Employer Remittance)', category: 'Current Liability', glCode: 'LIAB-202', glName: 'Statutory Liabilities - Provident Fund', postingRule: 'Credit (CR)', autoSync: true },
          { head: 'ESIC Payable (Emp + Empr Pool)', category: 'Current Liability', glCode: 'LIAB-203', glName: 'Statutory Liabilities - ESIC Pool', postingRule: 'Credit (CR)', autoSync: true },
          { head: 'Professional Tax Payable (KA / WB Multi-State)', category: 'Current Liability', glCode: 'LIAB-204', glName: 'State PT Withholding Pool (KA/WB)', postingRule: 'Credit (CR)', autoSync: true },
          { head: 'TDS on Salaries (Income Tax Sec 192)', category: 'Current Liability', glCode: 'LIAB-205', glName: 'Central Income Tax Withholding Ledger', postingRule: 'Credit (CR)', autoSync: true },
        ],
      });
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { entityCode: 'IN-01' },
      req.body,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ============================================================================
// 6. INSTITUTIONAL SEED ROUTE (POST /api/v1/payroll/seed)
// ============================================================================
router.post('/seed', async (req, res) => {
  try {
    await Employee.deleteMany({});
    await Attendance.deleteMany({});
    await Payslip.deleteMany({});
    await JournalEntry.deleteMany({});
    await Settings.deleteMany({});

    await Settings.create({
      entityCode: 'IN-01',
      legalEntityName: 'RupeeBook Financial Systems Pvt. Ltd.',
      corporatePan: 'AABCR8821K',
      tan: 'BLRR19284F',
      epfoCode: 'PYBOM2489102000',
      esicCode: '53000918270011001',
      cin: 'U72200KA2021PTC148892',
      glMappings: [
        { head: 'Gross Basic & Dearness Allowance (DA)', category: 'Payroll Expense', glCode: 'EXP-501', glName: 'Payroll Expense - Salaries & Wages', postingRule: 'Debit (DR)', autoSync: true },
        { head: 'Net Salary Payable (Direct Disbursal)', category: 'Current Liability', glCode: 'LIAB-201', glName: 'Salary Clearing Account (Bank NEFT/RTGS)', postingRule: 'Credit (CR)', autoSync: true },
        { head: 'EPF Payable (Employee + Employer Remittance)', category: 'Current Liability', glCode: 'LIAB-202', glName: 'Statutory Liabilities - Provident Fund', postingRule: 'Credit (CR)', autoSync: true },
        { head: 'ESIC Payable (Emp + Empr Pool)', category: 'Current Liability', glCode: 'LIAB-203', glName: 'Statutory Liabilities - ESIC Pool', postingRule: 'Credit (CR)', autoSync: true },
        { head: 'Professional Tax Payable (KA / WB Multi-State)', category: 'Current Liability', glCode: 'LIAB-204', glName: 'State PT Withholding Pool (KA/WB)', postingRule: 'Credit (CR)', autoSync: true },
        { head: 'TDS on Salaries (Income Tax Sec 192)', category: 'Current Liability', glCode: 'LIAB-205', glName: 'Central Income Tax Withholding Ledger', postingRule: 'Credit (CR)', autoSync: true },
      ],
    });

    const sampleEmployees = [
      { employeeId: 'EMP-1001', fullName: 'Ananya Sharma', email: 'ananya.sharma@rupeebook.in', designation: 'Principal Product Designer', department: 'Design', location: 'Bengaluru', state: 'KA', joiningDate: new Date('2022-03-12'), pan: 'ABCPS1234F', uan: '101294829103', taxRegime: 'NEW_115BAC', bankAccount: { bankName: 'HDFC Bank Ltd', accountNumber: '501002341234', ifsc: 'HDFC0000240', pennyDropVerified: true }, ctc: { monthlyGross: 90000, basic: 45000, hra: 27000, specialAllowance: 18000 }, status: 'ACTIVE' },
      { employeeId: 'EMP-8802', fullName: 'Rajesh Kumar', email: 'rajesh.kumar@rupeebook.in', designation: 'QA Lead', department: 'Engineering', location: 'Kolkata', state: 'WB', joiningDate: new Date('2023-07-18'), pan: 'BKRPK4920E', uan: '100982319041', taxRegime: 'NEW_115BAC', bankAccount: { bankName: 'HDFC Bank Ltd', accountNumber: '501008819001', ifsc: 'HDFC0000112', pennyDropVerified: true }, ctc: { monthlyGross: 85000, basic: 42500, hra: 25500, specialAllowance: 17000 }, status: 'ACTIVE' },
      { employeeId: 'EMP-8815', fullName: 'Sneha Nair', email: 'sneha.nair@rupeebook.in', designation: 'People & Culture Lead', department: 'Operations', location: 'Mumbai', state: 'MH', joiningDate: new Date('2023-01-04'), pan: 'CLPSN9912D', uan: '101183204918', taxRegime: 'OLD', bankAccount: { bankName: 'Axis Bank', accountNumber: '912010044012', ifsc: 'UTIB0000089', pennyDropVerified: true }, ctc: { monthlyGross: 68000, basic: 34000, hra: 20400, specialAllowance: 13600 }, status: 'ACTIVE' },
      { employeeId: 'EMP-8701', fullName: 'Vikramaditya Rao', email: 'vikram.rao@rupeebook.in', designation: 'Core Architect', department: 'Engineering', location: 'Bengaluru', state: 'KA', joiningDate: new Date('2021-10-10'), pan: 'EFGVR3321L', uan: '100827391024', taxRegime: 'NEW_115BAC', bankAccount: { bankName: 'ICICI Bank Ltd', accountNumber: '000201099201', ifsc: 'ICIC0000002', pennyDropVerified: true }, ctc: { monthlyGross: 150000, basic: 75000, hra: 45000, specialAllowance: 30000 }, status: 'ACTIVE' },
      { employeeId: 'EMP-8722', fullName: 'Amit Patel', email: 'amit.patel@rupeebook.in', designation: 'Sales Director', department: 'Sales', location: 'Delhi NCR', state: 'DL', joiningDate: new Date('2022-05-15'), pan: 'GHJAP8819M', uan: '101738290123', taxRegime: 'OLD', bankAccount: { bankName: 'Kotak Mahindra', accountNumber: '121100331200', ifsc: 'KKBK0000172', pennyDropVerified: true }, ctc: { monthlyGross: 135000, basic: 67500, hra: 40500, specialAllowance: 27000 }, status: 'ACTIVE' },
      { employeeId: 'EMP-8799', fullName: 'Priya Sharma', email: 'priya.sharma@rupeebook.in', designation: 'Design Studio Lead', department: 'Design', location: 'Bengaluru', state: 'KA', joiningDate: new Date('2022-08-22'), pan: 'DMNPS7710K', uan: '101490218374', taxRegime: 'NEW_115BAC', bankAccount: { bankName: 'ICICI Bank Ltd', accountNumber: '000201055214', ifsc: 'ICIC0000002', pennyDropVerified: true }, ctc: { monthlyGross: 92000, basic: 46000, hra: 27600, specialAllowance: 18400 }, status: 'ACTIVE' },
      { employeeId: 'EMP-8650', fullName: 'Jonas Aly', email: 'jonas.aly@rupeebook.in', designation: 'Treasury VP', department: 'Finance', location: 'Bengaluru', state: 'KA', joiningDate: new Date('2021-04-01'), pan: 'KLJA01238N', uan: '100619283741', taxRegime: 'NEW_115BAC', bankAccount: { bankName: 'SBI Corporate', accountNumber: '309100109200', ifsc: 'SBIN0000813', pennyDropVerified: true }, ctc: { monthlyGross: 180000, basic: 90000, hra: 54000, specialAllowance: 36000 }, status: 'ACTIVE' },
      { employeeId: 'EMP-8910', fullName: 'Tanvi Sethi', email: 'tanvi.sethi@rupeebook.in', designation: 'Senior Frontend Engineer', department: 'Engineering', location: 'Bengaluru', state: 'KA', joiningDate: new Date('2024-02-14'), pan: 'BNMPS8821R', uan: '101829103948', taxRegime: 'NEW_115BAC', bankAccount: { bankName: 'ICICI Bank Ltd', accountNumber: '000201077218', ifsc: 'ICIC0000002', pennyDropVerified: true }, ctc: { monthlyGross: 78000, basic: 39000, hra: 23400, specialAllowance: 15600 }, status: 'ACTIVE' },
    ];

    const insertedEmployees = await Employee.insertMany(sampleEmployees);

    const lopMap = { 'EMP-8802': 2, 'EMP-8815': 1, 'EMP-8799': 1 };
    const attendanceDocs = insertedEmployees.map((emp) => {
      const lossOfPayDays = lopMap[emp.employeeId] || 0;
      const totalWorkingDays = 30;
      const presentDays = totalWorkingDays - lossOfPayDays;
      return {
        employee: emp._id,
        month: 11,
        year: 2026,
        totalWorkingDays,
        presentDays,
        paidLeaves: 0,
        lossOfPayDays,
        reconciled: true,
      };
    });

    await Attendance.insertMany(attendanceDocs);

    res.status(200).json({
      success: true,
      message: 'RupeeBook institutional database seeded successfully',
      employees: insertedEmployees.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
