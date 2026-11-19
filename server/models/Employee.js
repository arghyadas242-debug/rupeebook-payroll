import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    designation: { type: String, required: true },
    department: {
      type: String,
      enum: ['Engineering', 'Sales', 'Operations', 'Finance', 'Design'],
      required: true,
    },
    location: { type: String, default: 'Bengaluru' },
    state: {
      type: String,
      enum: ['KA', 'WB', 'MH', 'DL'],
      default: 'KA',
    },
    joiningDate: { type: Date, default: Date.now },
    pan: { type: String, required: true, uppercase: true, trim: true },
    uan: { type: String, required: true, trim: true },
    esicNumber: { type: String, default: 'Exempt' },
    taxRegime: {
      type: String,
      enum: ['NEW_115BAC', 'OLD'],
      default: 'NEW_115BAC',
    },
    bankAccount: {
      bankName: { type: String, default: 'ICICI Bank Ltd' },
      accountNumber: { type: String, required: true },
      ifsc: { type: String, required: true, uppercase: true },
      pennyDropVerified: { type: Boolean, default: true },
    },
    ctc: {
      monthlyGross: { type: Number, required: true },
      basic: { type: Number, required: true },
      hra: { type: Number, required: true },
      specialAllowance: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;