import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Calendar, ClipboardList, Radio, User as UserIcon, Hospital } from "lucide-react";
import { usePatientAuth } from "../context/PatientAuthContext";
import { mockApi, type Appointment } from "../lib/mockData";
import { AppointmentCard } from "../components/AppointmentCard";
import { SkeletonCard } from "../components/LoadingSpinner";
import { formatTime } from "../components/TimeSlotGrid";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "Home — CarePoint" }] }),
  component: Home,
});

function Home() {
  const { patient, token, isLoading } = usePatientAuth();
  const navigate = useNavigate();
  const [appts, setAppts] = useState<Appointment[] | null>(null);

  useEffect(() => { if (!isLoading && !token) navigate({ to: "/login", replace: true }); }, [token, isLoading, navigate]);

  useEffect(() => {
    if (!patient) return;
    mockApi.myAppointments(patient._id).then(setAppts);
  }, [patient]);

  const today = new Date().toISOString().slice(0, 10);
  const todays = appts?.find(a => a.appointmentDate === today && (a.status === "confirmed" || a.status === "waiting" || a.status === "in_consultation"));
  const recent = appts?.slice(0, 3) ?? [];

  const todayLabel = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div>
      <div className="top-bar">
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Hospital size={18} color="var(--primary)" />
        </div>
        <h1>CarePoint</h1>
        <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><Bell size={22} /></button>
      </div>

      <div className="page">
        <div className="card">
          <div className="bold" style={{ fontSize: 20 }}>Namaste, {patient?.name?.split(" ")[0] || "Patient"}! 👋</div>
          <div className="text-sm text-secondary mt-8">Aaj: {todayLabel}</div>
        </div>

        {todays && (
          <div className="card fade-in-up" style={{ border: "2px solid var(--primary)", padding: 20 }}>
            <div className="text-sm semibold text-secondary mb-8">🎫 YOUR TOKEN TODAY</div>
            <div className="row gap-16">
              <div className="token-circle" style={{ background: "var(--primary)", width: 70, height: 70, fontSize: 24 }}>
                #{todays.tokenNumber}
              </div>
              <div style={{ flex: 1 }}>
                <div className="semibold" style={{ fontSize: 16 }}>{todays.doctorName}</div>
                <div className="text-sm text-secondary">{todays.doctorSpecialization}</div>
                <div className="text-sm text-primary-color semibold mt-8">{formatTime(todays.appointmentTime)}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <Link to="/token/$appointmentId" params={{ appointmentId: todays._id }} className="btn-primary" style={{ textDecoration: "none", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <span className="pulse-red" style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} /> Track Live
              </Link>
              <Link to="/appointments/$id" params={{ id: todays._id }} className="btn-ghost" style={{ textDecoration: "none", textAlign: "center" }}>
                Details
              </Link>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 4 }}>
          {[
            { to: "/book", Icon: Calendar, label: "Book Appointment", color: "var(--primary)" },
            { to: "/appointments", Icon: ClipboardList, label: "My Appointments", color: "var(--success)" },
            { to: todays ? `/token/${todays._id}` : "/appointments", Icon: Radio, label: "Live Queue", color: "var(--danger)", live: true },
            { to: "/profile", Icon: UserIcon, label: "Profile", color: "var(--warning)" },
          ].map((q, i) => (
            <Link key={i} to={q.to as any} className="card" style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12, margin: 0 }}>
              <div style={{ background: q.color, color: "white", padding: 10, borderRadius: 12, display: "flex" }}>
                <q.Icon size={20} />
              </div>
              <div className="semibold text-sm">{q.label}</div>
            </Link>
          ))}
        </div>

        <div className="row-between" style={{ marginTop: 24, marginBottom: 12 }}>
          <div className="bold" style={{ fontSize: 16 }}>Recent appointments</div>
          <Link to="/appointments" style={{ color: "var(--primary)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>View all</Link>
        </div>

        {appts === null ? <SkeletonCard count={2} /> :
          recent.length === 0 ? (
            <div className="card text-secondary text-sm" style={{ textAlign: "center", padding: 24 }}>
              No appointments yet. Tap Book to get started.
            </div>
          ) : recent.map(a => <AppointmentCard key={a._id} a={a} compact />)
        }
      </div>
    </div>
  );
}
