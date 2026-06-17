import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, Phone, Radio } from "lucide-react";
import { mockApi, type Appointment } from "../lib/mockData";
import { formatTime } from "../components/TimeSlotGrid";
import { LoadingSpinner } from "../components/LoadingSpinner";

export const Route = createFileRoute("/book/success")({
  head: () => ({ meta: [{ title: "Booking Confirmed — CarePoint" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ id: String(s.id ?? "") }),
  component: Success,
});

function Success() {
  const { id } = useSearch({ from: "/book/success" });
  const [appt, setAppt] = useState<Appointment | null>(null);

  useEffect(() => { if (id) mockApi.getAppointment(id).then(a => setAppt(a ?? null)); }, [id]);

  if (!appt) return <div style={{ padding: 80, textAlign: "center" }}><LoadingSpinner /></div>;

  const dateLabel = appt.appointmentDate === new Date().toISOString().slice(0, 10)
    ? "Today"
    : new Date(appt.appointmentDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" });

  return (
    <div style={{ padding: 24, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ textAlign: "center", marginTop: 24 }}>
        <svg width="80" height="80" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="26" fill="none" stroke="#00A651" strokeWidth="3" className="check-circle" />
          <path d="M16 28 l8 8 l16 -16" fill="none" stroke="#00A651" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="check-path" />
        </svg>
        <h1 className="bold mt-16" style={{ fontSize: 24, color: "var(--success)" }}>Appointment Confirmed! 🎉</h1>
      </div>

      <div className="card mt-24 fade-in-up" style={{ border: "2px solid transparent", background: "linear-gradient(white, white) padding-box, linear-gradient(135deg, var(--primary), #4FA3FF) border-box", textAlign: "center", padding: 24 }}>
        <div className="text-xs text-secondary semibold" style={{ letterSpacing: 1 }}>YOUR TOKEN</div>
        <div className="token-big text-primary-color mt-8">#{appt.tokenNumber}</div>
        <div className="semibold mt-16" style={{ fontSize: 16 }}>{appt.doctorName}</div>
        <div className="text-sm text-secondary">{appt.doctorSpecialization}</div>
        <div className="text-sm text-primary-color semibold mt-8">{dateLabel} · {formatTime(appt.appointmentTime)}</div>
        <div className="text-sm text-secondary mt-8">{appt.clinicName}</div>
      </div>

      <div className="card">
        <div className="row gap-8 text-sm"><MapPin size={16} color="var(--gray)" /> {appt.clinicAddress}</div>
        <div className="row gap-8 text-sm mt-8"><Phone size={16} color="var(--gray)" /> +91 98765 43210</div>
      </div>

      {appt.paymentMethod === "online" && appt.paymentStatus === "pending" && (
        <>
          <button className="btn-warning">Complete Payment</button>
          <p className="text-xs text-secondary" style={{ textAlign: "center", marginTop: 8 }}>Appointment reserved for 15 minutes</p>
        </>
      )}

      <Link to="/token/$appointmentId" params={{ appointmentId: appt._id }} className="btn-primary" style={{ marginTop: 12, textDecoration: "none", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Radio size={18} /> Track My Token Live
      </Link>
      <Link to="/appointments" className="btn-ghost" style={{ marginTop: 8, textDecoration: "none", textAlign: "center" }}>
        View My Appointments
      </Link>
    </div>
  );
}
