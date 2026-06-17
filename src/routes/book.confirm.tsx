import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CreditCard, Hospital, Check } from "lucide-react";
import { TopBar } from "../components/TopBar";
import { useBooking } from "../context/BookingContext";
import { usePatientAuth } from "../context/PatientAuthContext";
import { mockApi } from "../lib/mockData";
import { useToast } from "../components/Toast";
import { formatTime } from "../components/TimeSlotGrid";

export const Route = createFileRoute("/book/confirm")({
  head: () => ({ meta: [{ title: "Confirm Booking — CarePoint" }] }),
  component: Confirm,
});

function Confirm() {
  const { booking, setPatientInfo, setPaymentMethod, reset } = useBooking();
  const { patient } = usePatientAuth();
  const navigate = useNavigate();
  const { show } = useToast();

  useEffect(() => {
    if (!booking.clinicId || !booking.doctorId || !booking.selectedDate || !booking.selectedTime) {
      navigate({ to: "/book", replace: true });
    }
  }, [booking, navigate]);

  const [name, setName] = useState(patient?.name ?? "");
  const [age, setAge] = useState<string>(patient?.age?.toString() ?? "");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">(patient?.gender as any ?? "");
  const [reason, setReason] = useState("");
  const [payment, setPayment] = useState<"online" | "clinic">("clinic");
  const [booking_, setBooking_] = useState(false);

  const valid = name.trim() && age && Number(age) > 0 && gender;

  const submit = async () => {
    if (!valid || !patient) return;
    setBooking_(true);
    try {
      setPatientInfo(name, Number(age), gender, reason);
      setPaymentMethod(payment);
      const appt = await mockApi.book({
        clinicId: booking.clinicId!,
        clinicName: booking.clinicName!,
        clinicAddress: booking.clinicAddress!,
        doctorId: booking.doctorId!,
        doctorName: booking.doctorName!,
        doctorSpecialization: booking.doctorSpecialization!,
        patientId: patient._id,
        patientName: name,
        patientPhone: patient.phone,
        patientAge: Number(age),
        patientGender: gender,
        appointmentDate: booking.selectedDate!,
        appointmentTime: booking.selectedTime!,
        reason,
        paymentStatus: payment === "clinic" ? "unpaid" : "pending",
        paymentAmount: booking.doctorFee!,
        paymentMethod: payment,
        slotIndex: booking.slotIndex!,
      } as any);
      reset();
      navigate({ to: "/book/success", search: { id: appt._id } as any });
    } catch (e: any) {
      show(e.message || "Booking failed", "error");
    } finally { setBooking_(false); }
  };

  const dateLabel = booking.selectedDate ? new Date(booking.selectedDate).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) : "";

  return (
    <div>
      <TopBar title="Your Details" />
      <p className="subtitle">Step 4 of 4 — Confirm Booking</p>

      <div style={{ background: "var(--primary)", color: "white", padding: "12px 16px", fontSize: 13, fontWeight: 600, position: "sticky", top: 56, zIndex: 5 }}>
        {booking.doctorName} · {dateLabel} · {booking.selectedTime && formatTime(booking.selectedTime)}
      </div>

      <div className="page">
        <div className="card">
          <label className="text-sm semibold">Patient name *</label>
          <input className="input mt-8" value={name} onChange={e => setName(e.target.value)} placeholder="Full name" />

          <label className="text-sm semibold mt-16" style={{ display: "block" }}>Age *</label>
          <input className="input mt-8" type="number" min={1} max={120} value={age} onChange={e => setAge(e.target.value)} placeholder="Age" />

          <label className="text-sm semibold mt-16" style={{ display: "block" }}>Gender *</label>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            {(["male", "female", "other"] as const).map(g => (
              <button key={g} onClick={() => setGender(g)} className={`pill ${gender === g ? "blue" : ""}`} style={{ flex: 1, padding: "10px 0", justifyContent: "center", border: "1.5px solid", borderColor: gender === g ? "var(--primary)" : "var(--border)", background: gender === g ? "var(--primary-light)" : "white", textTransform: "capitalize", cursor: "pointer" }}>
                {g}
              </button>
            ))}
          </div>

          <label className="text-sm semibold mt-16" style={{ display: "block" }}>Reason for visit</label>
          <textarea
            className="input mt-8"
            rows={3}
            maxLength={200}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. Fever since 2 days, knee pain..."
            style={{ resize: "none" }}
          />
          <div className="text-xs text-secondary" style={{ textAlign: "right", marginTop: 4 }}>{reason.length}/200</div>
        </div>

        <div className="card">
          <div className="semibold mb-12">How would you like to pay?</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {([
              { id: "online" as const, icon: <CreditCard size={22} />, title: "Pay Now", sub: "Online via Razorpay" },
              { id: "clinic" as const, icon: <Hospital size={22} />, title: "Pay Later", sub: "Cash/UPI at reception" },
            ]).map(p => (
              <button
                key={p.id}
                onClick={() => setPayment(p.id)}
                style={{
                  position: "relative", border: `2px solid ${payment === p.id ? "var(--primary)" : "var(--border)"}`,
                  borderRadius: 12, padding: 14, background: payment === p.id ? "var(--primary-light)" : "white",
                  textAlign: "left", cursor: "pointer",
                }}
              >
                {payment === p.id && <Check size={16} color="var(--primary)" style={{ position: "absolute", top: 8, right: 8 }} />}
                {p.icon}
                <div className="semibold mt-8">{p.title}</div>
                <div className="bold text-primary-color" style={{ fontSize: 18 }}>₹{booking.doctorFee}</div>
                <div className="text-xs text-secondary">{p.sub}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ background: "#FAFBFC" }}>
          <div className="semibold mb-12">Appointment Summary</div>
          <Row k="Doctor" v={booking.doctorName ?? ""} />
          <Row k="Date" v={dateLabel} />
          <Row k="Time" v={booking.selectedTime ? formatTime(booking.selectedTime) : ""} />
          <Row k="Clinic" v={booking.clinicName ?? ""} />
          <Row k="Fee" v={`₹${booking.doctorFee}`} />
          <Row k="Payment" v={payment === "online" ? "Online" : "At clinic"} />
        </div>

        <button className="btn-primary" disabled={!valid || booking_} onClick={submit}>
          {booking_ ? "Booking..." : "Confirm Appointment"}
        </button>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="row-between text-sm" style={{ padding: "6px 0" }}><span className="text-secondary">{k}</span><span className="semibold">{v}</span></div>;
}
