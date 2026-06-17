import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Users, ListOrdered, Activity } from "lucide-react";
import { useOwnerAuth } from "../context/OwnerAuthContext";
import { mockApi, CLINICS, CLINIC_ICONS } from "../lib/mockData";

export const Route = createFileRoute("/owner/")({
  head: () => ({ meta: [{ title: "Owner Dashboard — CarePoint" }] }),
  component: OwnerDashboard,
});

function OwnerDashboard() {
  const { owner, token, logout } = useOwnerAuth();
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);
  const [stats, setStats] = useState<{ total: number; current: number; waiting: number; completed: number } | null>(null);

  useEffect(() => {
    if (!token) { navigate({ to: "/owner/login", replace: true }); return; }
  }, [token, navigate]);

  useEffect(() => {
    if (!owner) return;
    let alive = true;
    const load = async () => {
      const q = await mockApi.getQueue(owner.clinicId, today);
      if (alive) setStats({ total: q.totalTokens, current: q.currentToken, waiting: q.waitingCount, completed: q.completedCount });
    };
    load();
    const i = setInterval(load, 8000);
    return () => { alive = false; clearInterval(i); };
  }, [owner, today]);

  if (!owner) return null;
  const clinic = CLINICS.find(c => c._id === owner.clinicId)!;

  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ background: "linear-gradient(135deg, #FF9500 0%, #FF7A00 100%)", color: "white", padding: "24px 20px 32px" }}>
        <div className="row-between">
          <div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>Logged in as owner</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>+91 {owner.phone}</div>
          </div>
          <button onClick={() => { logout(); navigate({ to: "/owner/login" }); }}
            style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", padding: "8px 12px", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
        <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
            {CLINIC_ICONS[clinic.type]}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{clinic.name}</div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>{clinic.address}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: 16, marginTop: -16 }}>
        <div className="card">
          <div className="text-sm semibold mb-12">Today · {new Date().toDateString()}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            <Stat label="Total" value={stats?.total ?? 0} color="var(--primary)" />
            <Stat label="Current" value={stats?.current ?? 0} color="var(--warning)" />
            <Stat label="Waiting" value={stats?.waiting ?? 0} color="var(--text-primary)" />
            <Stat label="Done" value={stats?.completed ?? 0} color="var(--success)" />
          </div>
        </div>

        <Link to="/owner/queue" className="card" style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none", color: "inherit" }}>
          <IconBubble bg="#FFF4E5"><Activity size={22} color="var(--warning)" /></IconBubble>
          <div style={{ flex: 1 }}>
            <div className="semibold">Live Queue Control</div>
            <div className="text-xs text-secondary">Advance token, mark done, manage flow</div>
          </div>
          <span style={{ color: "var(--gray)" }}>›</span>
        </Link>

        <Link to="/owner/doctors" className="card" style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none", color: "inherit" }}>
          <IconBubble bg="var(--primary-light)"><Users size={22} color="var(--primary)" /></IconBubble>
          <div style={{ flex: 1 }}>
            <div className="semibold">Doctors</div>
            <div className="text-xs text-secondary">Add, edit and remove doctors</div>
          </div>
          <span style={{ color: "var(--gray)" }}>›</span>
        </Link>

        <Link to="/owner/queue" className="card" style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none", color: "inherit" }}>
          <IconBubble bg="var(--success-light)"><ListOrdered size={22} color="var(--success)" /></IconBubble>
          <div style={{ flex: 1 }}>
            <div className="semibold">Today's Appointments</div>
            <div className="text-xs text-secondary">{stats?.total ?? 0} bookings</div>
          </div>
          <span style={{ color: "var(--gray)" }}>›</span>
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ textAlign: "center", padding: "10px 4px", background: "#FAFBFC", borderRadius: 10 }}>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
      <div className="text-xs text-secondary">{label}</div>
    </div>
  );
}
function IconBubble({ children, bg }: { children: React.ReactNode; bg: string }) {
  return <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>;
}
