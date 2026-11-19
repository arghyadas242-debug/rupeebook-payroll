import mongoose from 'mongoose';

const journalEntrySchema = new mongoose.Schema(
  {
    batchReference: { type: String, required: true },
    narration: { type: String, required: true },
    records: [
      {
        accountCode: { type: String, required: true },
        accountName: { type: String, required: true },
        type: { type: String, enum: ['DEBIT', 'CREDIT'], required: true },
        amount: { type: Number, required: true },
      },
    ],
    erpSynced: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);
export default JournalEntry;