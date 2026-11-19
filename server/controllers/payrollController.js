import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Payslip from '../models/Payslip.js';
import JournalEntry from '../models/JournalEntry.js';
import { calculateSalaryBreakdown, buildAccrualJournalEntries } from '../services/payrollEngine.js';

// @desc    Save or update monthly attendance & LOP records (Page 4)
// @route   POST /api/v1/payroll/attendance
export const reconcileAttendance = async (req, res) => {
  try {
    const { month, year, records } = req.body; // records: [{ employeeId, totalWorkingDays, presentDays, paidLeaves, lossOfPayDays }]

    const operations = records.map((rec) => ({
      updateOne: {
        filter: { employee: rec.employeeId, month, year },
        update: {
          $set: {
            totalWorkingDays: rec.totalWorkingDays,
            presentDays: rec.presentDays,
            paidLeaves: rec.paidLeaves || 0,
            lossOfPayDays: rec.lossOfPayDays || 0,
            reconciled: true,
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(operations);
    res.status(200).json({ success: true, message: 'Attendance reconciled successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Fetch reconciled attendance for a cycle
// @route   GET /api/v1/payroll/attendance?month=10&year=2026
export const getAttendanceByCycle = async (req, res) => {
  try {
    const { month, year } = req.query;
    const records = await Attendance.find({ month: Number(month), year: Number(year) }).populate(
      'employee',
      'employeeId fullName department designation'
    );
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Run batch payroll calculation & post double-entry accrual (Page 2)
// @route   POST /api/v1/payroll/process
export const processBatchPayroll = async (req, res) => {
  try {
    const { month, year, defaultWorkingDays = 30 } = req.body;
    const batchReference = `PAYROLL-${year}-${String(month).padStart(2, '0')}`;

    const activeEmployees = await Employee.find({ status: 'ACTIVE' });
    if (!activeEmployees.length) {
      return res.status(400).json({ success: false, message: 'No active employees found to process' });
    }

    const attendanceRecords = await Attendance.find({ month, year });
    const attendanceMap = new Map(attendanceRecords.map((a) => [a.employee.toString(), a]));

    const generatedPayslips = [];
    const totals = {
      totalGross: 0,
      totalEmployerPf: 0,
      totalEmployerEsic: 0,
      totalNetPayable: 0,
      totalPfLiability: 0,
      totalEsicLiability: 0,
      totalPtLiability: 0,
      totalTdsLiability: 0,
    };

    for (const emp of activeEmployees) {
      const att = attendanceMap.get(emp._id.toString()) || {
        totalWorkingDays: defaultWorkingDays,
        lossOfPayDays: 0,
      };

      const breakdown = calculateSalaryBreakdown(emp, att);

      generatedPayslips.push({
        employee: emp._id,
        month,
        year,
        ...breakdown,
        status: 'APPROVED',
      });

      totals.totalGross += breakdown.earnings.grossPay;
      totals.totalEmployerPf += breakdown.employerContributions.pfEmployer;
      totals.totalEmployerEsic += breakdown.employerContributions.esicEmployer;
      totals.totalNetPayable += breakdown.netPay;
      totals.totalPfLiability += breakdown.deductions.pfEmployee + breakdown.employerContributions.pfEmployer;
      totals.totalEsicLiability += breakdown.deductions.esicEmployee + breakdown.employerContributions.esicEmployer;
      totals.totalPtLiability += breakdown.deductions.professionalTax;
      totals.totalTdsLiability += breakdown.deductions.tds;
    }

    // Replace existing draft/run for this month if re-run
    await Payslip.deleteMany({ month, year });
    const savedPayslips = await Payslip.insertMany(generatedPayslips);

    // Create or update balanced General Ledger accrual entry
    await JournalEntry.deleteMany({ batchReference });
    const journalPayload = buildAccrualJournalEntries(batchReference, totals);
    const ledgerEntry = await JournalEntry.create(journalPayload);

    res.status(201).json({
      success: true,
      batchReference,
      processedCount: savedPayslips.length,
      summary: totals,
      ledgerEntry,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payslips for a month/year (Page 1 & Page 2)
// @route   GET /api/v1/payroll/payslips?month=10&year=2026
export const getPayslips = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = {};
    if (month) filter.month = Number(month);
    if (year) filter.year = Number(year);

    const payslips = await Payslip.find(filter)
      .populate('employee', 'employeeId fullName department designation pan uan bankAccount joiningDate')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: payslips.length, data: payslips });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single printable payslip by ID (Page 3)
// @route   GET /api/v1/payroll/payslips/:id
export const getPayslipById = async (req, res) => {
  try {
    const payslip = await Payslip.findById(req.params.id).populate('employee');
    if (!payslip) {
      return res.status(404).json({ success: false, message: 'Payslip not found' });
    }
    res.status(200).json({ success: true, data: payslip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get double-entry journal records & statutory liabilities (Page 1 & Page 5)
// @route   GET /api/v1/payroll/ledger
export const getLedgerEntries = async (req, res) => {
  try {
    const entries = await JournalEntry.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Disburse salaries & clear Net Salaries Payable in ledger
// @route   PATCH /api/v1/payroll/disburse
export const disbursePayroll = async (req, res) => {
  try {
    const { month, year } = req.body;
    const batchReference = `DISBURSE-${year}-${String(month).padStart(2, '0')}`;

    const payslips = await Payslip.find({ month, year, status: { $ne: 'PAID' } });
    if (!payslips.length) {
      return res.status(400).json({ success: false, message: 'No pending approved payslips for this period' });
    }

    const totalDisbursed = payslips.reduce((sum, p) => sum + p.netPay, 0);

    await Payslip.updateMany(
      { month, year },
      { $set: { status: 'PAID', disbursedAt: new Date() } }
    );

    const disbursementJournal = await JournalEntry.create({
      batchReference,
      narration: `Bank NEFT salary disbursement for ${month}/${year}`,
      records: [
        { accountCode: 'LIAB-201', accountName: 'Net Salaries Payable', type: 'DEBIT', amount: totalDisbursed },
        { accountCode: 'ASSET-101', accountName: 'Corporate Bank Account', type: 'CREDIT', amount: totalDisbursed },
      ],
    });

    res.status(200).json({
      success: true,
      message: `Disbursed ₹${totalDisbursed} across ${payslips.length} employees`,
      journal: disbursementJournal,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};