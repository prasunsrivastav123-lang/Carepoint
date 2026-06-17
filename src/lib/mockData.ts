// Mock data + in-memory "API" for the patient portal demo.
export type Clinic = {
  _id: string;
  name: string;
  type: "dental" | "eye" | "hospital" | "clinic" | "diagnostic";
  address: string;
  city: string;
  workingHours: string;
  workingDays: string;
  consultationFee: number;
  emergencyNumber: string;
  whatsappNumber: string;
  avgConsultMinutes: number;
};

export type Doctor = {
  _id: string;
  clinicId: string;
  name: string;
  specialization: string;
  qualification: string;
  experience: number;
  consultationFee: number;
  availableDays: number[];
  bio: string;
};

export type Slot = { time: string; available: boolean; slotIndex: number };

export type Appointment = {
  _id: string;
  clinicId: string;
  clinicName: string;
  clinicAddress: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  tokenNumber: number;
  status: "confirmed" | "waiting" | "in_consultation" | "completed" | "cancelled" | "no_show";
  paymentStatus: "paid" | "unpaid" | "pending" | "refunded";
  paymentAmount: number;
  paymentMethod: "online" | "clinic";
  createdAt: string;
};

export const CLINICS: Clinic[] = [
  { _id: "c1", name: "City Care Clinic", type: "clinic", address: "12 Hazratganj, Lucknow", city: "Lucknow", workingHours: "9 AM – 8 PM", workingDays: "Mon–Sat", consultationFee: 400, emergencyNumber: "+91 98765 43210", whatsappNumber: "+91 98765 43210", avgConsultMinutes: 12 },
  { _id: "c2", name: "BrightSmile Dental", type: "dental", address: "5 Gomti Nagar, Lucknow", city: "Lucknow", workingHours: "10 AM – 7 PM", workingDays: "Mon–Sun", consultationFee: 600, emergencyNumber: "+91 99887 76655", whatsappNumber: "+91 99887 76655", avgConsultMinutes: 20 },
  { _id: "c3", name: "VisionPlus Eye Hospital", type: "eye", address: "22 Alambagh, Lucknow", city: "Lucknow", workingHours: "9 AM – 6 PM", workingDays: "Mon–Sat", consultationFee: 500, emergencyNumber: "+91 91234 56789", whatsappNumber: "+91 91234 56789", avgConsultMinutes: 15 },
  { _id: "c4", name: "Apollo Diagnostics", type: "diagnostic", address: "88 Indira Nagar, Lucknow", city: "Lucknow", workingHours: "7 AM – 9 PM", workingDays: "Mon–Sun", consultationFee: 300, emergencyNumber: "+91 90909 80808", whatsappNumber: "+91 90909 80808", avgConsultMinutes: 10 },
];

const SEED_DOCTORS: Doctor[] = [
  { _id: "d1", clinicId: "c1", name: "Dr. Anjali Sharma", specialization: "General Medicine", qualification: "MBBS, MD", experience: 12, consultationFee: 400, availableDays: [1,2,3,4,5,6], bio: "Internal medicine specialist with 12+ years of experience." },
  { _id: "d2", clinicId: "c1", name: "Dr. Rohan Verma", specialization: "Pediatrics", qualification: "MBBS, DCH", experience: 8, consultationFee: 500, availableDays: [1,3,5,6], bio: "Children's specialist focusing on early childhood care." },
  { _id: "d3", clinicId: "c2", name: "Dr. Priya Mehta", specialization: "Dentist", qualification: "BDS, MDS", experience: 10, consultationFee: 600, availableDays: [1,2,3,4,5,6,0], bio: "Cosmetic dentistry and orthodontics." },
  { _id: "d4", clinicId: "c3", name: "Dr. Sameer Khan", specialization: "Ophthalmologist", qualification: "MBBS, MS Ophth", experience: 15, consultationFee: 500, availableDays: [1,2,3,4,5,6], bio: "Cataract surgery, LASIK and retinal disorders." },
  { _id: "d5", clinicId: "c4", name: "Dr. Neha Gupta", specialization: "Pathologist", qualification: "MBBS, MD Path", experience: 7, consultationFee: 300, availableDays: [1,2,3,4,5,6,0], bio: "Comprehensive diagnostic services with same-day reporting." },
];

const STORAGE_KEY = "CarePoint_appointments_v1";
const DOCTORS_KEY = "CarePoint_doctors_v1";
const TOKEN_OVERRIDE_KEY = "CarePoint_token_override_v1"; // { [clinicId_date]: number }

function ls<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function lsSet(key: string, val: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(val));
}

function loadDoctors(): Doctor[] {
  const stored = ls<Doctor[] | null>(DOCTORS_KEY, null);
  if (stored && stored.length) return stored;
  lsSet(DOCTORS_KEY, SEED_DOCTORS);
  return SEED_DOCTORS;
}
function saveDoctors(d: Doctor[]) { lsSet(DOCTORS_KEY, d); }
function loadAppointments(): Appointment[] { return ls<Appointment[]>(STORAGE_KEY, []); }
function saveAppointments(list: Appointment[]) { lsSet(STORAGE_KEY, list); }
function loadOverrides(): Record<string, number> { return ls<Record<string, number>>(TOKEN_OVERRIDE_KEY, {}); }
function saveOverrides(o: Record<string, number>) { lsSet(TOKEN_OVERRIDE_KEY, o); }
function overrideKey(clinicId: string, date: string) { return `${clinicId}__${date}`; }

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Owner phone → clinicId mapping (demo). Any other phone → defaults to c1.
const OWNER_MAP: Record<string, string> = {
  "9000000001": "c1",
  "9000000002": "c2",
  "9000000003": "c3",
  "9000000004": "c4",
};

export const mockApi = {
  // ---------- Patient auth ----------
  async sendOtp(phone: string) {
    await wait(500);
    console.log("[MOCK OTP] for", phone, "→ 123456");
    return { message: "OTP sent on WhatsApp", masked: `+91 XXXXXX${phone.slice(-4)}` };
  },
  async verifyOtp(phone: string, otp: string) {
    await wait(400);
    if (otp !== "123456") throw new Error("Invalid or expired OTP");
    return { token: `mock_${phone}_${Date.now()}`, patient: { _id: `p_${phone}`, name: "", phone, isProfileComplete: false } };
  },

  // ---------- Owner auth ----------
  async ownerSendOtp(phone: string) {
    await wait(500);
    console.log("[OWNER OTP] for", phone, "→ 123456");
    return { message: "OTP sent on WhatsApp" };
  },
  async ownerVerifyOtp(phone: string, otp: string) {
    await wait(400);
    if (otp !== "123456") throw new Error("Invalid OTP");
    const clinicId = OWNER_MAP[phone] || "c1";
    const clinic = CLINICS.find(c => c._id === clinicId)!;
    return { token: `owner_${phone}_${Date.now()}`, owner: { _id: `o_${phone}`, phone, clinicId, clinicName: clinic.name } };
  },

  // ---------- Read ----------
  async getClinics() { await wait(300); return CLINICS; },
  async getClinic(id: string) { await wait(120); return CLINICS.find(c => c._id === id); },
  async getDoctors(clinicId: string) { await wait(250); return loadDoctors().filter(d => d.clinicId === clinicId); },
  async getDoctor(id: string) { await wait(120); return loadDoctors().find(d => d._id === id); },

  async getSlots(doctorId: string, date: string): Promise<Slot[]> {
    await wait(350);
    const slots: Slot[] = [];
    const seed = (date + doctorId).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    let i = 0;
    for (let h = 9; h < 18; h++) for (const m of [0, 30]) {
      const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      slots.push({ time, available: (seed + i) % 4 !== 0, slotIndex: i });
      i++;
    }
    return slots;
  },

  async book(data: Omit<Appointment, "_id" | "tokenNumber" | "status" | "createdAt">): Promise<Appointment> {
    await wait(600);
    const all = loadAppointments();
    const tokenNumber = all.filter(a => a.clinicId === data.clinicId && a.appointmentDate === data.appointmentDate).length + 1;
    const appt: Appointment = { ...data, _id: `a_${Date.now()}`, tokenNumber, status: "confirmed", createdAt: new Date().toISOString() };
    all.push(appt);
    saveAppointments(all);
    return appt;
  },

  async myAppointments(patientId: string) {
    await wait(250);
    return loadAppointments().filter(a => a.patientId === patientId).sort((a, b) => b.appointmentDate.localeCompare(a.appointmentDate));
  },
  async getAppointment(id: string) { await wait(150); return loadAppointments().find(a => a._id === id); },
  async cancelAppointment(id: string) {
    await wait(300);
    const all = loadAppointments();
    const idx = all.findIndex(a => a._id === id);
    if (idx === -1) throw new Error("Not found");
    all[idx].status = "cancelled";
    saveAppointments(all);
    return { message: "Cancelled" };
  },

  // ---------- Queue ----------
  async getQueue(clinicId: string, date: string) {
    await wait(200);
    const all = loadAppointments();
    const list = all.filter(a => a.clinicId === clinicId && a.appointmentDate === date).sort((a, b) => a.tokenNumber - b.tokenNumber);
    const clinic = CLINICS.find(c => c._id === clinicId)!;
    const avg = clinic?.avgConsultMinutes ?? 15;

    // Owner override wins. Otherwise fall back to a time-based estimate so the demo "feels alive".
    const overrides = loadOverrides();
    const ovr = overrides[overrideKey(clinicId, date)];
    let currentToken: number;
    if (typeof ovr === "number") {
      currentToken = ovr;
    } else {
      const now = new Date();
      const minutes = now.getHours() * 60 + now.getMinutes() - 9 * 60;
      currentToken = Math.max(0, Math.min(list.length, Math.floor(minutes / avg)));
    }
    const completedCount = Math.max(0, currentToken - 1);
    const waitingCount = Math.max(0, list.length - currentToken);
    return {
      clinicId, date, currentToken,
      totalTokens: list.length,
      waitingCount, completedCount,
      isActive: true, lastAdvancedAt: new Date(),
      queue: list.map(a => ({
        tokenNumber: a.tokenNumber,
        status: a.status === "cancelled" ? "cancelled" :
                a.tokenNumber < currentToken ? "completed" :
                a.tokenNumber === currentToken ? "in_consultation" : "waiting",
        appointmentTime: a.appointmentTime,
        estimatedWaitMinutes: Math.max(0, (a.tokenNumber - currentToken) * avg),
        isCurrentToken: a.tokenNumber === currentToken,
        patientName: a.patientName,
        patientPhone: a.patientPhone,
        appointmentId: a._id,
      })),
    };
  },

  async getMyToken(appointmentId: string) {
    const appt = (await this.getAppointment(appointmentId))!;
    const q = await this.getQueue(appt.clinicId, appt.appointmentDate);
    const clinic = CLINICS.find(c => c._id === appt.clinicId)!;
    const tokensAhead = Math.max(0, appt.tokenNumber - q.currentToken - 1);
    const status =
      appt.status === "cancelled" ? "cancelled" :
      appt.tokenNumber < q.currentToken ? "completed" :
      appt.tokenNumber === q.currentToken ? "in_consultation" : "waiting";
    return {
      myToken: appt.tokenNumber, currentToken: q.currentToken, tokensAhead,
      estimatedWaitMinutes: tokensAhead * clinic.avgConsultMinutes,
      status, appointmentTime: appt.appointmentTime, appointmentDate: appt.appointmentDate,
      doctor: { name: appt.doctorName, specialization: appt.doctorSpecialization },
      clinic: { name: appt.clinicName, address: appt.clinicAddress },
      isActive: q.isActive, lastUpdated: new Date(),
      queue: q.queue, totalTokens: q.totalTokens,
      completedCount: q.completedCount, waitingCount: q.waitingCount,
    };
  },

  async updateProfile(patientId: string, updates: Record<string, any>) {
    await wait(250);
    const raw = localStorage.getItem("CarePoint_patient");
    const cur = raw ? JSON.parse(raw) : { _id: patientId };
    const merged = { ...cur, ...updates };
    localStorage.setItem("CarePoint_patient", JSON.stringify(merged));
    return merged;
  },

  // ---------- Owner mutations ----------
  async setCurrentToken(clinicId: string, date: string, value: number) {
    await wait(120);
    const o = loadOverrides();
    o[overrideKey(clinicId, date)] = Math.max(0, value);
    saveOverrides(o);
    return { currentToken: o[overrideKey(clinicId, date)] };
  },
  async advanceToken(clinicId: string, date: string, delta: number) {
    const q = await this.getQueue(clinicId, date);
    return this.setCurrentToken(clinicId, date, q.currentToken + delta);
  },
  async resetQueue(clinicId: string, date: string) {
    await wait(120);
    const o = loadOverrides();
    delete o[overrideKey(clinicId, date)];
    saveOverrides(o);
    return { ok: true };
  },

  async addDoctor(input: Omit<Doctor, "_id">): Promise<Doctor> {
    await wait(300);
    const all = loadDoctors();
    const doc: Doctor = { ...input, _id: `d_${Date.now()}` };
    all.push(doc);
    saveDoctors(all);
    return doc;
  },
  async removeDoctor(id: string) {
    await wait(200);
    const all = loadDoctors().filter(d => d._id !== id);
    saveDoctors(all);
    return { ok: true };
  },

  async getTodayAppointments(clinicId: string, date: string) {
    await wait(200);
    return loadAppointments()
      .filter(a => a.clinicId === clinicId && a.appointmentDate === date)
      .sort((a, b) => a.tokenNumber - b.tokenNumber);
  },
  async markAppointmentStatus(id: string, status: Appointment["status"]) {
    await wait(150);
    const all = loadAppointments();
    const idx = all.findIndex(a => a._id === id);
    if (idx === -1) throw new Error("Not found");
    all[idx].status = status;
    saveAppointments(all);
    return all[idx];
  },
};

export const CLINIC_ICONS: Record<Clinic["type"], string> = {
  dental: "🦷", eye: "👁️", hospital: "🏥", clinic: "🏪", diagnostic: "🔬",
};
