import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    date: { type: String, required: true },   // "2024-07-15"
    time: { type: String, required: true },   // "10:30"
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "confirmed",
    },
    // Razorpay payment
    payment: {
      orderId: String,
      paymentId: String,
      status: { type: String, enum: ["pending", "paid", "refunded"], default: "pending" },
      amount: Number,
    },
    notes: { type: String },
    bookedVia: { type: String, enum: ["whatsapp", "dashboard"], default: "dashboard" },
    // Reminder tracking
    reminders: {
      dayBefore: { type: Boolean, default: false },
      hourBefore: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Prevent double-booking: same doctor, date, time
appointmentSchema.index({ doctor: 1, date: 1, time: 1 }, { unique: true });

export default mongoose.model("Appointment", appointmentSchema);