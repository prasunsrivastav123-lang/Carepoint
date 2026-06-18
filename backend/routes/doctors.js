import { Router } from "express";
import Doctor from "../models/Doctor.js";

const router = Router();

// GET /api/doctors
router.get("/", async (_req, res, next) => {
  try {
    const doctors = await Doctor.find({ isActive: true });
    res.json(doctors);
  } catch (err) { next(err); }
});

// GET /api/doctors/:id
router.get("/:id", async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({
  _id: req.params.id,
  isActive: true,
});
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) { next(err); }
});

// POST /api/doctors
router.post("/", async (req, res, next) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json(doctor);
  } catch (err) { next(err); }
});

// PATCH /api/doctors/:id
router.patch("/:id", async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) { next(err); }
});

// DELETE /api/doctors/:id  (soft delete)
router.delete("/:id", async (req, res, next) => {
  try {
   const doctor = await Doctor.findByIdAndUpdate(
  req.params.id,
  { isActive: false },
  { new: true }
);

if (!doctor) {
  return res.status(404).json({
    message: "Doctor not found",
  });
}
    res.json({ message: "Doctor deactivated" });
  } catch (err) { next(err); }
});

export default router;