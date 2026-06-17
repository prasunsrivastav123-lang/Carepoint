import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { TopBar } from "../components/TopBar";
import { AppointmentCard } from "../components/AppointmentCard";
import { SkeletonCard } from "../components/LoadingSpinner";
import { usePatientAuth } from "../context/PatientAuthContext";
import { mockApi, type Appointment } from "../lib/mockData";

const TABS = ["All", "Upcoming", "Completed", "Cancelled"] as const;

export const Route = createFileRoute("/appointments/")({
  head: () => ({ meta: [{ title: "My Appointments — CarePoint" }] }),
  component: MyAppointments,
});

function MyAppointments() {
  const { patient } = usePatientAuth();
  const [appts, setAppts] = useState<Appointment[] | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");

  useEffect(() => { if (patient) mockApi.myAppointments(patient._id).then(setAppts); }, [patient]);

  const filtered = useMemo(() => {
    if (!appts) return null;
    if (tab === "All") return appts;
    if (tab === "Upcoming") return appts.filter(a => ["confirmed", "waiting", "in_consultation"].includes(a.status));
    if (tab === "Completed") return appts.filter(a => a.status === "completed");
    return appts.filter(a => a.status === "cancelled");
  }, [appts, tab]);

  return (
    <div>
      <TopBar title="My Appointments" back={false} />
      <div className="scroll-x" style={{ padding: "12px 16px", gap: 8 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`pill ${tab === t ? "blue" : ""}`} style={{ cursor: "pointer", padding: "8px 16px", border: "1.5px solid", borderColor: tab === t ? "var(--primary)" : "var(--border)", background: tab === t ? "var(--primary-light)" : "white", marginRight: 8 }}>
            {t}
          </button>
        ))}
      </div>
      <div className="page" style={{ paddingTop: 0 }}>
        {filtered === null ? <SkeletonCard /> : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 56 }}>📋</div>
            <div className="bold mt-16">No appointments yet</div>
            <div className="text-sm text-secondary mt-8">Book your first appointment to get started</div>
            <Link to="/book" className="btn-primary" style={{ marginTop: 16, textDecoration: "none", textAlign: "center", display: "inline-block", width: "auto", padding: "12px 32px" }}>Book Now</Link>
          </div>
        ) : filtered.map(a => <AppointmentCard key={a._id} a={a} />)}
      </div>
    </div>
  );
}
