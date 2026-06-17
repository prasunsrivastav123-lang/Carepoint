import { Link } from "@tanstack/react-router";
import { ChevronRight, Radio } from "lucide-react";
import type { Appointment } from "../lib/mockData";
import { StatusBadge } from "./StatusBadge";
import { formatTime } from "./TimeSlotGrid";

function dateLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

export function AppointmentCard({ a, compact = false }: { a: Appointment; compact?: boolean }) {
  const tokenColor =
    a.status === "completed" ? "var(--success)" :
    a.status === "cancelled" ? "var(--danger)" :
    "var(--primary)";
  const tokenLabel =
    a.status === "completed" ? "✓" :
    a.status === "cancelled" ? "✕" :
    `#${a.tokenNumber}`;

  return (
    <Link to="/appointments/$id" params={{ id: a._id }} className="card fade-in-up" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
      <div className="row gap-12">
        <div className="token-circle" style={{ background: tokenColor, width: compact ? 40 : 48, height: compact ? 40 : 48, fontSize: compact ? 12 : 14 }}>
          {tokenLabel}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="semibold" style={{ fontSize: 15 }}>{a.doctorName}</div>
          <div className="text-sm text-secondary">{a.doctorSpecialization}</div>
          <div className="text-xs text-secondary mt-8">{dateLabel(a.appointmentDate)} · {formatTime(a.appointmentTime)}</div>
          {!compact && <div className="text-xs text-secondary">{a.clinicName}</div>}
        </div>
        <div className="col" style={{ alignItems: "flex-end", gap: 6 }}>
          <StatusBadge status={a.status} />
          <ChevronRight size={18} color="var(--gray)" />
        </div>
      </div>
      {!compact && (a.status === "confirmed" || a.status === "waiting" || a.status === "in_consultation") && (
        <Link
          to="/token/$appointmentId"
          params={{ appointmentId: a._id }}
          onClick={(e) => e.stopPropagation()}
          style={{ display: "inline-flex", marginTop: 12, gap: 6, alignItems: "center", color: "var(--primary)", fontWeight: 600, fontSize: 13, textDecoration: "none" }}
        >
          <Radio size={14} /> Track Live
        </Link>
      )}
    </Link>
  );
}
