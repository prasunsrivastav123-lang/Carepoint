console.log("🔥 DASHBOARD LOADED");
import { Router } from "express";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";

const router = Router();

router.get("/stats", async (req, res, next) => {
  try {
    const totalDoctors = await Doctor.countDocuments({
      isActive: true,
    });

    const totalPatients =
      await Patient.countDocuments();

    const totalAppointments =
      await Appointment.countDocuments();

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);

    tomorrow.setDate(today.getDate() + 1);

    const todayAppointments =
      await Appointment.countDocuments({
        date: {
          $gte: today,
          $lt: tomorrow,
        },
      });

    res.json({
      totalDoctors,
      totalPatients,
      totalAppointments,
      todayAppointments,
    });
  } catch (err) {
    next(err);
  }
});

export default router;