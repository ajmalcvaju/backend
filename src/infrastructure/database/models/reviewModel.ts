import mongoose, { Schema, Document, Types } from 'mongoose';
import { Review } from '../../../domain/entities/Review';

export interface RevieDocument extends Review,Document{}

const ReviewSchema: Schema = new Schema<RevieDocument>(
    {
      turfId: { type: Schema.Types.ObjectId, required: true, ref: "Turf" },
      userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
      rating: { type: Number, required: true, min: 0, max: 10 },
      tags: { type: [String], required: true },
      comment: { type: String, required: false, trim: true },
    },
    {
      timestamps: true,
    }
  );
  
  export const ReviewModel = mongoose.model<RevieDocument>("Review", ReviewSchema);