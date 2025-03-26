import mongoose, { Schema, Document, Types } from 'mongoose';
import { Booking } from '../../../domain/entities/Booking';

export interface BookingDocument extends Booking, Document {}

const BookingSchema = new Schema<BookingDocument>(
  {
    slotId: {
      type: Schema.Types.ObjectId,
      ref: 'Slot',
      required: true,
    },
    turfId: {
      type: Schema.Types.ObjectId,
      ref: 'Turf',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      default: 'pending',
    },
    paid: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);
BookingSchema.post(['find', 'findOne'], async function (bookings) {
  const currentDate = new Date();
  if (Array.isArray(bookings)) {
    for (const booking of bookings) {
      await updateBookingStatus(booking, currentDate);
    }
  } else {
    if (bookings) {
      await updateBookingStatus(bookings, currentDate);
    }
  }
});

async function updateBookingStatus(booking:any, currentDate:any) {
  try {
    const slot = await mongoose.model('Slot').findById(booking.slotId).exec();
    if (slot) {
      const slotDate = new Date(slot.date + ' ' + slot.time);
      if (slotDate <= currentDate && booking.status !== 'completed' && booking.status !== 'cancelled') {
        booking.status = 'completed';
        await booking.save();
      }      
    }
  } catch (error) {
    console.error('Error updating booking status:', error);
  }
}

export const BookingModel = mongoose.model<BookingDocument>('Booking', BookingSchema);
