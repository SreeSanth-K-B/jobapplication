import mongoose, { Document, Schema } from 'mongoose';

export type ApplicationStage =
  | 'wishlist'
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected';

export interface ITimelineEvent {
  event: string;
  date: Date;
  note?: string;
  source: 'manual' | 'gmail';
}

export interface IContact {
  name: string;
  email?: string;
  role?: string;
  linkedIn?: string;
}

export interface IApplication extends Document {
  userId: string;
  company: string;
  role: string;
  location?: string;
  jdUrl?: string;
  jdText?: string;
  stage: ApplicationStage;
  priority: 'low' | 'medium' | 'high';
  resumeUsed?: string;
  salaryRange?: string;
  notes?: string;
  contacts: IContact[];
  timeline: ITimelineEvent[];
  nextActionDate?: Date;
  nextActionNote?: string;
  gmailThreadId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TimelineEventSchema = new Schema<ITimelineEvent>({
  event: { type: String, required: true },
  date: { type: Date, default: Date.now },
  note: { type: String },
  source: { type: String, enum: ['manual', 'gmail'], default: 'manual' },
});

const ContactSchema = new Schema<IContact>({
  name: { type: String, required: true },
  email: { type: String },
  role: { type: String },
  linkedIn: { type: String },
});

const ApplicationSchema = new Schema<IApplication>(
  {
    userId: { type: String, required: true, index: true },
    company: { type: String, required: true },
    role: { type: String, required: true },
    location: { type: String },
    jdUrl: { type: String },
    jdText: { type: String },
    stage: {
      type: String,
      enum: ['wishlist', 'applied', 'screening', 'interview', 'offer', 'rejected'],
      default: 'wishlist',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    resumeUsed: { type: String },
    salaryRange: { type: String },
    notes: { type: String },
    contacts: [ContactSchema],
    timeline: [TimelineEventSchema],
    nextActionDate: { type: Date },
    nextActionNote: { type: String },
    gmailThreadId: { type: String },
  },
  { timestamps: true }
);

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema);
