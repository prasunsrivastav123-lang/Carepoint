import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, MapPin, Clock, ChevronRight } from "lucide-react";
import { TopBar } from "../components/TopBar";
import { SkeletonCard } from "../components/LoadingSpinner";
import { mockApi, type Clinic, CLINIC_ICONS } from "../lib/mockData";
import { useBooking } from "../context/BookingContext";

export const Route = createFileRoute("/book/")({
  head: () => ({ meta: [{ title: "Select Clinic — CarePoint" }] }),
  component: SelectClinic,
});

function SelectClinic() {
  const [clinics, setClinics] = useState<Clinic[] | null>(null);
  const [q, setQ] = useState("");
  const { setClinic } = useBooking();
  const navigate = useNavigate();

  useEffect(() => { mockApi.getClinics().then(setClinics); }, []);

  const filtered = useMemo(
    () => (clinics ?? []).filter(c => (c.name + c.address + c.city).toLowerCase().includes(q.toLowerCase())),
    [clinics, q]
  );

  return (
    <div>
      <TopBar title="Book Appointment" />
      <p className="subtitle">Step 1 of 4 — Select Clinic</p>
      <div className="page" style={{ paddingTop: 0 }}>
        <div style={{ position: "relative", marginBottom: 16 }}>
          <Search size={18} style={{ position: "absolute", left: 14, top: 16, color: "var(--gray)" }} />
          <input className="input" placeholder="Search clinics..." value={q} onChange={e => setQ(e.target.value)} style={{ paddingLeft: 40 }} />
        </div>
        {clinics === null ? <SkeletonCard /> : filtered.length === 0 ? (
          <div className="card text-secondary text-sm" style={{ textAlign: "center", padding: 24 }}>No clinics match your search.</div>
        ) : filtered.map(c => (
          <button
            key={c._id}
            onClick={() => { setClinic(c._id, c.name, c.address); navigate({ to: "/book/$clinicId", params: { clinicId: c._id } }); }}
            className="card fade-in-up"
            style={{ width: "100%", textAlign: "left", border: "none", cursor: "pointer", display: "flex", gap: 12, alignItems: "center" }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
              {CLINIC_ICONS[c.type]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="semibold" style={{ fontSize: 15 }}>{c.name}</div>
              <span className="pill blue mt-8" style={{ textTransform: "capitalize" }}>{c.type}</span>
              <div className="text-xs text-secondary mt-8 row gap-8"><MapPin size={12} /> {c.address}</div>
              <div className="text-xs text-secondary row gap-8" style={{ marginTop: 2 }}><Clock size={12} /> {c.workingDays}, {c.workingHours}</div>
            </div>
            <ChevronRight size={20} color="var(--primary)" />
          </button>
        ))}
      </div>
    </div>
  );
}
