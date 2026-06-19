import { useState } from "react";
import {
  useAppointments,
  useUpdateAppointment,
  useDeleteAppointment,
  useDoctors,
} from "../hooks/useData";
import { formatDate, formatTime } from "../lib/utils";
import { toast } from "sonner";
import { ChevronRight, ChevronDown, Search } from "lucide-react";

export function AppointmentsPage() {
  const [search, setSearch] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: appointments, isLoading } = useAppointments();
  const { data: doctors } = useDoctors();
  const updateAppt = useUpdateAppointment();
  const deleteAppt = useDeleteAppointment();

  const filtered = appointments?.filter((a) => {
    const matchSearch =
      !search ||
      a.patient.name.toLowerCase().includes(search.toLowerCase()) ||
      a.patient.phone?.includes(search);
    const matchDoctor =
      doctorFilter === "all" ||
      a.doctor._id === doctorFilter ||
      (a.doctor as any).id === doctorFilter;
    return matchSearch && matchDoctor;
  });

  async function updateStatus(id: string, status: string) {
    try {
      await updateAppt.mutateAsync({ id, status } as never);
      toast.success(`Marked as ${status}`);
    } catch { toast.error("Update failed"); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this appointment?")) return;
    try {
      await deleteAppt.mutateAsync(id);
      toast.success("Deleted");
    } catch { toast.error("Delete failed"); }
  }

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.1rem" }}>
        All Appointments
      </h1>
      <p style={{ color: "var(--color-cp-muted)", fontSize: "0.88rem", marginBottom: "1.25rem" }}>
        Filter, search and manage every appointment
      </p>

      {/* Filters */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.25rem" }}>
        {/* Search */}
        <div style={{ position: "relative", maxWidth: "100%" }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-cp-muted)" }} />
          <input
            type="text"
            placeholder="Search by name or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "0.65rem 0.85rem 0.65rem 2.25rem",
              border: "1.5px solid var(--color-cp-border)", borderRadius: 12,
              fontSize: "0.88rem", background: "white", outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Doctor filter dropdown */}
        <select
          value={doctorFilter}
          onChange={(e) => setDoctorFilter(e.target.value)}
          style={{
            padding: "0.65rem 0.9rem", border: "1.5px solid var(--color-cp-border)",
            borderRadius: 12, fontSize: "0.88rem", background: "white", outline: "none",
            color: doctorFilter === "all" ? "var(--color-cp-muted)" : "var(--color-cp-text)",
          }}
        >
          <option value="all">All Doctors</option>
          {doctors?.map((d) => (
            <option key={d._id} value={d._id}>Dr. {d.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "white", border: "1px solid var(--color-cp-border)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-cp-border)" }}>
                <th style={th}></th>
                <th style={th}>TOKEN</th>
                <th style={th}>PATIENT</th>
                <th style={th}>PHONE</th>
                <th style={th}>AGE</th>
                <th style={th}>DOCTOR</th>
                <th style={th}>TIME</th>
                <th style={th}>DATE</th>
                <th style={th}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={9} style={{ padding: "2rem", textAlign: "center", color: "var(--color-cp-muted)" }}>Loading…</td></tr>
              ) : !filtered?.length ? (
                <tr><td colSpan={9} style={{ padding: "2rem", textAlign: "center", color: "var(--color-cp-muted)" }}>No appointments found.</td></tr>
              ) : filtered.map((appt) => {
                const expanded = expandedId === appt._id;
                const token = (appt as any).tokenNumber ?? (appt as any).token ?? "—";
                const age = appt.patient.age ?? (appt as any).patientAge ?? "—";
                const reason = (appt as any).reason || (appt as any).notes || "";

                return (
                  <>
                    <tr
                      key={appt._id}
                      onClick={() => setExpandedId(expanded ? null : appt._id)}
                      style={{ borderTop: "1px solid var(--color-cp-border)", cursor: "pointer" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fffe")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                    >
                      <td style={{ padding: "0.85rem 0.5rem 0.85rem 1rem", color: "var(--color-cp-muted)" }}>
                        {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                      </td>
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <span style={{ fontWeight: 700, color: "var(--color-cp-accent)", fontSize: "0.95rem" }}>
                          #{token}
                        </span>
                      </td>
                      <td style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>{appt.patient.name}</td>
                      <td style={{ padding: "0.85rem 1rem", color: "var(--color-cp-muted)" }}>{appt.patient.phone}</td>
                      <td style={{ padding: "0.85rem 1rem" }}>{age}</td>
                      <td style={{ padding: "0.85rem 1rem" }}>
                        Dr. {appt.doctor.name}
                        <div style={{ fontSize: "0.75rem", color: "var(--color-cp-muted)" }}>{appt.doctor.specialization}</div>
                      </td>
                      <td style={{ padding: "0.85rem 1rem", whiteSpace: "nowrap" }}>{formatTime(appt.time)}</td>
                      <td style={{ padding: "0.85rem 1rem", whiteSpace: "nowrap", color: "var(--color-cp-muted)", fontSize: "0.82rem" }}>{formatDate(appt.date)}</td>
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <select
                          value={appt.status}
                          onChange={(e) => { e.stopPropagation(); updateStatus(appt._id, e.target.value); }}
                          onClick={(e) => e.stopPropagation()}
                          style={{ border: "1.5px solid var(--color-cp-border)", borderRadius: 8, padding: "0.3rem 0.5rem", fontSize: "0.82rem", background: "white", cursor: "pointer" }}
                        >
                          {["pending", "confirmed", "completed", "cancelled", "no_show", "in_consultation"].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                    {expanded && (
                      <tr key={appt._id + "-expanded"} style={{ background: "#f8fffe", borderTop: "1px solid var(--color-cp-border)" }}>
                        <td colSpan={9} style={{ padding: "1rem 1.5rem" }}>
                          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", fontSize: "0.85rem" }}>
                            {reason && (
                              <div>
                                <span style={{ fontWeight: 600, color: "var(--color-cp-muted)", fontSize: "0.75rem" }}>REASON</span>
                                <div style={{ marginTop: 2 }}>{reason}</div>
                              </div>
                            )}
                            <div>
                              <span style={{ fontWeight: 600, color: "var(--color-cp-muted)", fontSize: "0.75rem" }}>PAYMENT</span>
                              <div style={{ marginTop: 2 }}>
                                <span style={{ fontSize: "0.78rem", padding: "2px 8px", borderRadius: 6, background: (appt as any).paymentStatus === "paid" ? "#d1fae5" : "#fef3c7", color: (appt as any).paymentStatus === "paid" ? "#065f46" : "#92400e", fontWeight: 600 }}>
                                  {(appt as any).paymentStatus || "unpaid"}
                                </span>
                              </div>
                            </div>
                            <div>
                              <span style={{ fontWeight: 600, color: "var(--color-cp-muted)", fontSize: "0.75rem" }}>BOOKED VIA</span>
                              <div style={{ marginTop: 2 }}>
                                <span style={{ fontSize: "0.78rem", padding: "2px 8px", borderRadius: 6, background: (appt as any).bookedVia === "whatsapp" ? "#dcfce7" : "#e0e7ff", color: (appt as any).bookedVia === "whatsapp" ? "#166534" : "#3730a3", fontWeight: 600 }}>
                                  {(appt as any).bookedVia || "direct"}
                                </span>
                              </div>
                            </div>
                            <div style={{ marginLeft: "auto" }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(appt._id); }}
                                style={{ background: "#fee2e2", border: "none", color: "#991b1b", borderRadius: 8, padding: "0.4rem 0.9rem", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: "0.85rem 1rem", textAlign: "left",
  fontWeight: 700, fontSize: "0.75rem",
  color: "var(--color-cp-muted)", letterSpacing: "0.05em", whiteSpace: "nowrap",
};

export default AppointmentsPage;