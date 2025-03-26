import mongoose, { Schema, Types, Document } from 'mongoose';
import { Report } from '../../../domain/entities/Report';

export interface ReportDocument extends Report, Document {
  
}

const ReportSchema = new Schema<ReportDocument>(
  {
    turfId: { type: Schema.Types.ObjectId, ref: 'Turf', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    issue: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

const ReportModel = mongoose.model<ReportDocument>('Report', ReportSchema);

export default ReportModel;
