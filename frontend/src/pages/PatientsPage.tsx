import { useState } from "react";
import { usePatients } from "../hooks/useData";
import { Search } from "lucide-react";

export function PatientsPage() {
  const { data: patients, isLoading } = usePatients();
  const [search, setSearch] = useState("");

  const filtered = patients?.filter((p) =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.15rem" }}>
        Patients
      </h1>
      <p style={{ color: "var(--color-cp-muted)", fontSize: "0.88rem", marginBottom: "1.25rem" }}>
        {filtered?.length ?? 0} on record
      </p>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "1.25rem", maxWidth: 480 }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-cp-muted)" }} />
        <input
          type="text"
          placeholder="Search by name or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%", padding: "0.6rem 0.85rem 0.6rem 2.25rem",
            border: "1.5px solid var(--color-cp-border)", borderRadius: 12,
            fontSize: "0.88rem", background: "white", outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      {/* Table */}
      <div style={{ background: "white", border: "1px solid var(--color-cp-border)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-cp-border)" }}>
                {["NAME", "PHONE", "AGE", "GENDER", "VISITS", "LAST"].map((h) => (
                  <th key={h} style={{ padding: "0.85rem 1.25rem", textAlign: "left", fontWeight: 700, fontSize: "0.75rem", color: "var(--color-cp-muted)", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "var(--color-cp-muted)" }}>Loading…</td></tr>
              ) : !filtered?.length ? (
                <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "var(--color-cp-muted)" }}>No patients found.</td></tr>
              ) : filtered.map((p) => {
                const lastVisit = (p as any).lastVisit || (p as any).updatedAt || "";
                const lastStr = lastVisit ? lastVisit.split("T")[0] : "—";
                return (
                  <tr key={p._id} style={{ borderTop: "1px solid var(--color-cp-border)", cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fffe")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                    <td style={{ padding: "0.9rem 1.25rem", fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: "0.9rem 1.25rem", color: "var(--color-cp-muted)" }}>{p.phone}</td>
                    <td style={{ padding: "0.9rem 1.25rem" }}>{(p as any).age ?? "—"}</td>
                    <td style={{ padding: "0.9rem 1.25rem" }}>{(p as any).gender?.charAt(0)?.toUpperCase() ?? "—"}</td>
                    <td style={{ padding: "0.9rem 1.25rem" }}>{(p as any).visitCount ?? (p as any).visits ?? "—"}</td>
                    <td style={{ padding: "0.9rem 1.25rem", color: "var(--color-cp-muted)", fontSize: "0.82rem" }}>{lastStr}</td>
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

export default PatientsPage;