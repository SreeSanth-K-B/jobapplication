import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: string;
  type: 'gmail_sync' | 'deadline' | 'ai_nudge' | 'stage_change' | 'new_job';
  title: string;
  message: string;
  read: boolean;
  applicationId?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['gmail_sync', 'deadline', 'ai_nudge', 'stage_change', 'new_job'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    applicationId: { type: String },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
