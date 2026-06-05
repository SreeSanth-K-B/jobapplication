import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  googleRefreshToken?: string;
  gmailConnected: boolean;
  targetRoles?: string;
  preferredLocations?: string;
  salaryRange?: string;
  weeklyGoal: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    googleRefreshToken: { type: String },
    gmailConnected: { type: Boolean, default: false },
    targetRoles: { type: String },
    preferredLocations: { type: String },
    salaryRange: { type: String },
    weeklyGoal: { type: Number, default: 10 },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
