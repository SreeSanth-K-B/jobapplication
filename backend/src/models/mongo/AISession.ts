import mongoose, { Document, Schema } from 'mongoose';

export interface IAISession extends Document {
  userId: string;
  type: 'resume_analyze' | 'cover_letter' | 'interview_prep' | 'email_draft' | 'weekly_debrief';
  input: Record<string, string>;
  output: string;
  applicationId?: string;
  createdAt: Date;
}

const AISessionSchema = new Schema<IAISession>(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['resume_analyze', 'cover_letter', 'interview_prep', 'email_draft', 'weekly_debrief'],
      required: true,
    },
    input: { type: Schema.Types.Mixed, required: true },
    output: { type: String, required: true },
    applicationId: { type: String },
  },
  { timestamps: true }
);

export const AISession = mongoose.model<IAISession>('AISession', AISessionSchema);
