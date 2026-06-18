import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import doctorRoutes from "./routes/doctors.js";
import authRoutes from "./routes/auth.js";
import patientRoutes from "./routes/patients.js";
import appointmentRoutes from "./routes/appointments.js";
import dashboardRoutes from "./routes/dashboard.js";
import { errorHandler } from "./middleware/errorHandler.js";

//console.log("Dashboard import =", dashboardRoutes);
dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  });

// Routes
app.get("/", (req, res) => {
  res.send("CarePoint Backend Running 🚀");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Future Routes
// app.use("/api/appointments", authMiddleware, appointmentRoutes);
// app.use("/api/patients", authMiddleware, patientRoutes);
// app.use("/api/whatsapp", whatsappRoutes);
// Future Routes
// app.use("/api/appointments", authMiddleware, appointmentRoutes);
 //app.use("/api/doctors", authMiddleware, doctorRoutes);
// app.use("/api/patients", authMiddleware, patientRoutes);
// app.use("/api/whatsapp", whatsappRoutes);

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});