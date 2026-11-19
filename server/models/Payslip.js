import mongoose from 'mongoose';

const payslipSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    totalWorkingDays: { type: Number, default: 30 },
    paidDays: { type: Number, default: 30 },
    lossOfPayDays: { type: Number, default: 0 },
    earnings: {
      basic: { type: Number, required: true },
      hra: { type: Number, required: true },
      specialAllowance: { type: Number, required: true },
      grossPay: { type: Number, required: true },
    },
    deductions: {
      pfEmployee: { type: Number, required: true },
      esicEmployee: { type: Number, default: 0 },
      professionalTax: { type: Number, default: 200 },
      tds: { type: Number, default: 0 },
      totalDeductions: { type: Number, required: true },
    },
    employerContributions: {
      pfEmployer: { type: Number, required: true },
      esicEmployer: { type: Number, default: 0 },
    },
    netPay: { type: Number, required: true },
    status: {
      type: String,
      enum: ['APPROVED', 'PAID'],
      default: 'APPROVED',
    },
    disbursedAt: { type: Date },
  },
  { timestamps: true }
);

payslipSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

const Payslip = mongoose.model('Payslip', payslipSchema);
export default Payslip;