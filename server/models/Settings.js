import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    entityCode: { type: String, default: 'IN-01', unique: true },
    legalEntityName: { type: String, default: 'RupeeBook Financial Systems Pvt. Ltd.' },
    corporatePan: { type: String, default: 'AABCR8821K' },
    tan: { type: String, default: 'BLRR19284F' },
    epfoCode: { type: String, default: 'PYBOM2489102000' },
    esicCode: { type: String, default: '53000918270011001' },
    cin: { type: String, default: 'U72200KA2021PTC148892' },
    epfWageCeiling: { type: Number, default: 15000 },
    capEmployerEpf: { type: Boolean, default: true },
    esicGrossLimit: { type: Number, default: 21000 },
    defaultTaxRegime: { type: String, default: 'NEW_115BAC' },
    payCycleCutoff: { type: String, default: '28th of Every Month' },
    lopBasis: { type: String, default: 'CALENDAR_DAYS' },
    glMappings: [
      {
        head: String,
        category: String,
        glCode: String,
        glName: String,
        postingRule: String,
        autoSync: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;