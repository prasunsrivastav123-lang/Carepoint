import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import axios from "axios";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Webhook Verification (Meta one-time setup) ────────────────────────────────
router.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log("✅ WhatsApp webhook verified");
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// ─── Incoming Messages ─────────────────────────────────────────────────────────
router.post("/webhook", async (req, res) => {
  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0]?.value;
    const message = change?.messages?.[0];

    if (!message || message.type !== "text") return res.sendStatus(200);

    const from = message.from; // e.g. "919876543210"
    const text = message.text.body.trim();

    // Get or create patient
    let patient = await Patient.findOne({ phone: from });
    if (!patient) {
      patient = await Patient.create({ name: "New Patient", phone: from });
    }

    const reply = await handleBotMessage(patient, text);
    await sendWhatsAppMessage(from, reply);

    res.sendStatus(200);
  } catch (err) {
    console.error("WhatsApp webhook error:", err);
    res.sendStatus(500);
  }
});

// ─── Bot State Machine ─────────────────────────────────────────────────────────
async function handleBotMessage(patient, text) {
  const step = patient.botState?.step || "idle";

  // Always let user restart
  if (/^(hi|hello|hey|start|menu|book)/i.test(text)) {
    await Patient.findByIdAndUpdate(patient._id, { "botState.step": "selecting_doctor" });
    const doctors = await Doctor.find({ isActive: true });
    const list = doctors.map((d, i) => `${i + 1}. Dr. ${d.name} — ${d.specialization} (₹${d.fee})`).join("\n");
    return `👋 Welcome to *Carepoint*!\n\nAvailable doctors:\n${list}\n\nReply with the number to select a doctor.`;
  }

  switch (step) {
    case "selecting_doctor": {
      const doctors = await Doctor.find({ isActive: true });
      const idx = parseInt(text) - 1;
      if (isNaN(idx) || !doctors[idx]) {
        return "Please reply with a valid number from the list.";
      }
      const doctor = doctors[idx];
      await Patient.findByIdAndUpdate(patient._id, {
        "botState.step": "selecting_date",
        "botState.selectedDoctorId": doctor._id,
      });
      return `You selected *Dr. ${doctor.name}*.\n\nPlease enter your preferred date (e.g. *15 July* or *2024-07-15*):`;
    }

    case "selecting_date": {
      // Use Claude to parse natural date input
      const parsedDate = await parseDate(text);
      if (!parsedDate) {
        return "I couldn't understand that date. Please try again (e.g. *15 July* or *tomorrow*).";
      }
      const doctorId = patient.botState.selectedDoctorId;

      // Fetch available slots
      const slots = await getAvailableSlots(doctorId, parsedDate);
      if (!slots.length) {
        return `No slots available on *${parsedDate}*. Please try another date.`;
      }

      await Patient.findByIdAndUpdate(patient._id, {
        "botState.step": "selecting_time",
        "botState.selectedDate": parsedDate,
      });

      const slotList = slots.map((s, i) => `${i + 1}. ${s}`).join("\n");
      return `Available slots on *${parsedDate}*:\n${slotList}\n\nReply with the slot number.`;
    }

    case "selecting_time": {
      const { selectedDoctorId, selectedDate } = patient.botState;
      const slots = await getAvailableSlots(selectedDoctorId, selectedDate);
      const idx = parseInt(text) - 1;

      if (isNaN(idx) || !slots[idx]) {
        return "Please reply with a valid slot number.";
      }

      const time = slots[idx];
      const doctor = await Doctor.findById(selectedDoctorId);

      // Create appointment
      await Appointment.create({
        patient: patient._id,
        doctor: selectedDoctorId,
        date: selectedDate,
        time,
        bookedVia: "whatsapp",
      });

      // Reset bot state
      await Patient.findByIdAndUpdate(patient._id, {
        "botState.step": "idle",
        "botState.selectedDoctorId": null,
        "botState.selectedDate": null,
      });

      return `✅ *Appointment Confirmed!*\n\n👨‍⚕️ Dr. ${doctor.name}\n📅 ${selectedDate}\n⏰ ${time}\n\nWe'll remind you the day before. Type *hi* to book another.`;
    }

    default: {
      return "Type *hi* to book an appointment or view available doctors.";
    }
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
async function parseDate(text) {
  try {
    const today = new Date().toISOString().split("T")[0];
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 100,
      messages: [{
        role: "user",
        content: `Today is ${today}. The user said: "${text}". Extract the date they mean and return ONLY a date in YYYY-MM-DD format, nothing else. If you can't parse it, return "null".`,
      }],
    });
    const result = msg.content[0].text.trim();
    return result === "null" ? null : result;
  } catch {
    return null;
  }
}

async function getAvailableSlots(doctorId, date) {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) return [];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayName = dayNames[new Date(date).getDay()];
  const schedule = doctor.availableSlots.find((s) => s.day === dayName);
  if (!schedule) return [];

  const allSlots = generateSlots(schedule.startTime, schedule.endTime, schedule.slotDuration);
  const booked = await Appointment.find({
    doctor: doctorId, date, status: { $in: ["confirmed", "pending"] },
  }).select("time");

  const bookedTimes = new Set(booked.map((a) => a.time));
  return allSlots.filter((t) => !bookedTimes.has(t));
}

function generateSlots(start, end, duration) {
  const slots = [];
  let [h, m] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const endMinutes = eh * 60 + em;

  while (h * 60 + m < endMinutes) {
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    m += duration;
    if (m >= 60) { h += Math.floor(m / 60); m = m % 60; }
  }
  return slots;
}

async function sendWhatsAppMessage(to, text) {
  await axios.post(
    `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
}

export default router;