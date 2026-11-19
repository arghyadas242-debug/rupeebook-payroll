import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    totalWorkingDays: { type: Number, default: 30 },
    presentDays: { type: Number, default: 30 },
    paidLeaves: { type: Number, default: 0 },
    lossOfPayDays: { type: Number, default: 0 },
    reconciled: { type: Boolean, default: true },
    isLocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

attendanceSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;