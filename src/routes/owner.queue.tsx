import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Minus, Plus, RotateCcw, Check, X } from "lucide-react";
import { useOwnerAuth } from "../context/OwnerAuthContext";
import { mockApi } from "../lib/mockData";
import { useToast } from "../components/Toast";

export const Route = createFileRoute("/owner/queue")({
  head: () => ({ meta: [{ title: "Queue Control — Owner" }] }),
  component: OwnerQueuePage,
});

type QueueData = Awaited<ReturnType<typeof mockApi.getQueue>>;

function OwnerQueuePage() {
  const { owner, token } = useOwnerAuth();
  const navigate = useNavigate();
  const { show } = useToast();
  const today = new Date().toISOString().slice(0, 10);
  const [data, setData] = useState<QueueData | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!token) navigate({ to: "/owner/login", replace: true }); }, [token, navigate]);

  const load = useCallback(async () => {
    if (!owner) return;
    const q = await mockApi.getQueue(owner.clinicId, today);
    setData(q);
  }, [owner, today]);

  useEffect(() => {
    load();
    const i = setInterval(load, 5000);
    return () => clearInterval(i);
  }, [load]);

  if (!owner || !data) {
    return <div style={{ padding: 24 }}>Loading…</div>;
  }

  const act = async (fn: () => Promise<unknown>, msg?: string) => {
    setBusy(true);
    try { await fn(); await load(); if (msg) show(msg, "success"); }
    catch (e: any) { show(e.message || "Failed", "error"); }
    finally { setBusy(false); }
  };

  const advance = () => act(() => mockApi.advanceToken(owner.clinicId, today, 1), "Token advanced");
  const back = () => act(() => mockApi.advanceToken(owner.clinicId, today, -1));
  const reset = () => act(() => mockApi.resetQueue(owner.clinicId, today), "Queue reset");

  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-light)" }}>
      <div className="top-bar">
        <button className="back-btn" onClick={() => navigate({ to: "/owner" })}><ArrowLeft size={22} /></button>
        <h1>Live Queue Control</h1>
      </div>

      <div style={{ padding: 16 }}>
        <div className="card" style={{ textAlign: "center", padding: "28px 16px", background: "linear-gradient(135deg, #FFF4E5 0%, #FFE8C7 100%)" }}>
          <div className="text-sm semibold text-secondary">NOW SERVING</div>
          <div className="token-big pulse-warning" style={{ color: "var(--warning)", margin: "12px 0" }}>#{data.currentToken}</div>
          <div className="text-sm text-secondary">of {data.totalTokens} tokens · {data.waitingCount} waiting</div>

          <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "center" }}>
            <button disabled={busy || data.currentToken <= 0} onClick={back}
              style={iconBtn("var(--gray-light)", "var(--text-primary)")}><Minus size={20} /></button>
            <button disabled={busy} onClick={advance}
              style={{ ...iconBtn("var(--warning)", "white"), padding: "16px 32px", fontSize: 16, fontWeight: 700, gap: 8 }}>
              <Plus size={22} /> Next Token
            </button>
            <button disabled={busy} onClick={reset} title="Reset queue"
              style={iconBtn("var(--gray-light)", "var(--text-primary)")}><RotateCcw size={18} /></button>
          </div>
        </div>

        <div className="card">
          <div className="row-between mb-12">
            <div className="semibold">All Tokens Today</div>
            <span className="text-xs text-secondary">{data.queue.length} total</span>
          </div>
          {data.queue.length === 0 && (
            <div className="text-sm text-secondary" style={{ textAlign: "center", padding: 20 }}>No bookings yet today.</div>
          )}
          {data.queue.map((q) => {
            const done = q.status === "completed";
            const current = q.status === "in_consultation";
            const cancelled = q.status === "cancelled";
            return (
              <div key={q.tokenNumber} className={`queue-row ${current ? "current" : done ? "done" : ""}`} style={{ gridTemplateColumns: "50px 1fr auto auto" }}>
                <div className="tnum">#{q.tokenNumber}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {(q as any).patientName || "Patient"} {cancelled && <span className="pill red" style={{ marginLeft: 6 }}>Cancelled</span>}
                  </div>
                  <div className="text-xs text-secondary">{q.appointmentTime} · {(q as any).patientPhone}</div>
                </div>
                {!done && !cancelled && (
                  <button disabled={busy} onClick={() => act(() => mockApi.markAppointmentStatus((q as any).appointmentId, "completed"), "Marked done")}
                    style={miniBtn("var(--success-light)", "var(--success)")}><Check size={16} /></button>
                )}
                {!cancelled && (
                  <button disabled={busy} onClick={() => act(() => mockApi.markAppointmentStatus((q as any).appointmentId, "cancelled"), "Cancelled")}
                    style={miniBtn("var(--danger-light)", "var(--danger)")}><X size={16} /></button>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-secondary" style={{ textAlign: "center", marginTop: 8 }}>
          Changes appear on patient phones within ~10 seconds.
        </p>
      </div>
    </div>
  );
}

function iconBtn(bg: string, color: string): React.CSSProperties {
  return { background: bg, color, border: "none", borderRadius: 12, padding: "14px 18px", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" };
}
function miniBtn(bg: string, color: string): React.CSSProperties {
  return { background: bg, color, border: "none", borderRadius: 8, padding: "8px 10px", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" };
}
