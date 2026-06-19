import { useEffect, useState } from "react";
import { useAppointments, useUpdateAppointment } from "../hooks/useData";
import { toast } from "sonner";

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = time.getHours();
  const m = time.getMinutes().toString().padStart(2, "0");
  const s = time.getSeconds().toString().padStart(2, "0");
  const ampm = h >= 12 ? "pm" : "am";
  const hh = (h % 12 || 12).toString().padStart(2, "0");

  const dateStr = time.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

  return (
    <div style={{
      background: "var(--color-cp-accent)", borderRadius: 16, padding: "1.25rem 1.75rem",
      display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem",
    }}>
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#4ade80", flexShrink: 0 }} />
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, color: "white", lineHeight: 1 }}>
          {hh}:{m}:{s} {ampm}
        </div>
        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem", marginTop: "0.2rem" }}>{dateStr}</div>
      </div>
    </div>
  );
}

export function TodayLivePage() {
  const today = new Date().toISOString().split("T")[0];
  const { data: appts, isLoading, refetch } = useAppointments({ date: today });
  const updateAppt = useUpdateAppointment();

  // Auto-refresh every 15s
  useEffect(() => {
    const id = setInterval(() => refetch(), 15000);
    return () => clearInterval(id);
  }, [refetch]);

  async function setStatus(id: string, status: string) {
    try {
      await updateAppt.mutateAsync({ id, status } as never);
      toast.success(`Status → ${status}`);
    } catch { toast.error("Update failed"); }
  }

  const sorted = [...(appts ?? [])].sort((a, b) => {
    const ta = (a as any).tokenNumber ?? 999;
    const tb = (b as any).tokenNumber ?? 999;
    return ta - tb;
  });

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.15rem" }}>
        Today · Live Reception
      </h1>
      <p style={{ color: "var(--color-cp-muted)", fontSize: "0.88rem", marginBottom: "1.25rem" }}>
        Auto-refreshing every 15 seconds
      </p>

      <LiveClock />

      {/* Table */}
      <div style={{ background: "white", border: "1px solid var(--color-cp-border)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-cp-border)" }}>
                {["TOKEN", "PATIENT", "AGE", "DOCTOR", "TIME", "REASON", "STATUS"].map((h) => (
                  <th key={h} style={{ padding: "0.85rem 1.25rem", textAlign: "left", fontWeight: 700, fontSize: "0.75rem", color: "var(--color-cp-muted)", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "var(--color-cp-muted)" }}>Loading…</td></tr>
              ) : !sorted.length ? (
                <tr><td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "var(--color-cp-muted)" }}>No appointments today.</td></tr>
              ) : sorted.map((appt) => {
                const token = (appt as any).tokenNumber ?? (appt as any).token ?? "—";
                const age = appt.patient.age ?? (appt as any).patientAge ?? "—";
                const reason = (appt as any).reason || (appt as any).notes || "—";

                return (
                  <tr key={appt._id} style={{ borderTop: "1px solid var(--color-cp-border)" }}>
                    <td style={{ padding: "0.9rem 1.25rem" }}>
                      <span style={{ fontWeight: 700, color: "var(--color-cp-accent)", fontSize: "1rem" }}>#{token}</span>
                    </td>
                    <td style={{ padding: "0.9rem 1.25rem", fontWeight: 600 }}>{appt.patient.name}</td>
                    <td style={{ padding: "0.9rem 1.25rem" }}>{age}</td>
                    <td style={{ padding: "0.9rem 1.25rem" }}>
                      <span style={{ color: "var(--color-cp-accent)", fontWeight: 600 }}>Dr. {appt.doctor.name}</span>
                    </td>
                    <td style={{ padding: "0.9rem 1.25rem", whiteSpace: "nowrap", fontWeight: 600 }}>{appt.time}</td>
                    <td style={{ padding: "0.9rem 1.25rem", color: "var(--color-cp-muted)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{reason}</td>
                    <td style={{ padding: "0.9rem 1.25rem" }}>
                      <select
                        value={appt.status}
                        onChange={(e) => setStatus(appt._id, e.target.value)}
                        style={{ border: "1.5px solid var(--color-cp-border)", borderRadius: 8, padding: "0.3rem 0.5rem", fontSize: "0.82rem", background: "white", cursor: "pointer" }}
                      >
                        {["pending", "confirmed", "in_consultation", "completed", "cancelled", "no_show"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TodayLivePage;