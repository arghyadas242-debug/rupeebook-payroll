import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: 'CFO / Treasury Admin',
    },
    entity: {
      type: String,
      default: 'Global Treasury Corp (IN-01)',
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
