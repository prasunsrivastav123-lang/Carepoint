import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Radio } from "lucide-react";
import { TopBar } from "../components/TopBar";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { mockApi, type Appointment } from "../lib/mockData";
import { StatusBadge } from "../components/StatusBadge";
import { BottomSheet } from "../components/BottomSheet";
import { useToast } from "../components/Toast";
import { formatTime } from "../components/TimeSlotGrid";

export const Route = createFileRoute("/appointments/$id")({
  head: () => ({ meta: [{ title: "Appointment Detail — CarePoint" }] }),
  component: AppointmentDetail,
});

function AppointmentDetail() {
  const { id } = Route.useParams();
  const [a, setA] = useState<Appointment | null>(null);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const navigate = useNavigate();
  const { show } = useToast();

  useEffect(() => { mockApi.getAppointment(id).then(x => setA(x ?? null)); }, [id]);

  if (!a) return <div style={{ padding: 80, textAlign: "center" }}><LoadingSpinner /></div>;

  const dateLabel = new Date(a.appointmentDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  const apptTime = new Date(`${a.appointmentDate}T${a.appointmentTime}:00`);
  const canCancel = a.status === "confirmed" && apptTime.getTime() - Date.now() > 2 * 60 * 60 * 1000;

  const doCancel = async () => {
    setCancelling(true);
    try {
      await mockApi.cancelAppointment(a._id);
      show("Appointment cancelled", "success");
      navigate({ to: "/appointments", replace: true });
    } catch (e: any) { show(e.message, "error"); }
    finally { setCancelling(false); setShowCancel(false); }
  };

  return (
    <div>
      <TopBar title="Appointment Detail" />
      <div className="page">
        <div style={{ textAlign: "center", margin: "16px 0 24px" }}>
          <div className="token-circle" style={{ background: "var(--primary)", width: 88, height: 88, fontSize: 28, margin: "0 auto" }}>
            #{a.tokenNumber}
          </div>
        </div>

        <div className="card">
          <div className="bold" style={{ fontSize: 17 }}>{a.doctorName}</div>
          <div className="text-sm text-primary-color semibold">{a.doctorSpecialization}</div>
          <div className="text-sm text-secondary">{a.clinicName}</div>
          <hr style={{ border: 0, borderTop: "1px solid var(--border)", margin: "12px 0" }} />
          <Row k="Date" v={dateLabel} />
          <Row k="Time" v={formatTime(a.appointmentTime)} />
          <Row k="Reason" v={a.reason || "—"} />
          <Row k="Status" v={<StatusBadge status={a.status} />} />
          <Row k="Payment" v={<StatusBadge status={a.paymentStatus} />} />
        </div>

        {a.paymentStatus === "unpaid" && a.status === "confirmed" && (
          <button className="btn-warning">Pay ₹{a.paymentAmount} online</button>
        )}
        {a.paymentStatus === "paid" && <div className="text-success semibold" style={{ textAlign: "center" }}>Paid ✓ ₹{a.paymentAmount}</div>}

        {(a.status === "confirmed" || a.status === "waiting" || a.status === "in_consultation") && (
          <Link to="/token/$appointmentId" params={{ appointmentId: a._id }} className="btn-primary" style={{ marginTop: 12, textDecoration: "none", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Radio size={18} /> Track Live Token
          </Link>
        )}

        {canCancel && (
          <button className="btn-danger" style={{ marginTop: 12 }} onClick={() => setShowCancel(true)}>
            Cancel Appointment
          </button>
        )}
      </div>

      <BottomSheet isOpen={showCancel} onClose={() => setShowCancel(false)}>
        <h3 className="bold" style={{ fontSize: 18 }}>Cancel appointment?</h3>
        <p className="text-sm text-secondary mt-8">{a.doctorName} · {dateLabel} · {formatTime(a.appointmentTime)}</p>
        {a.paymentStatus === "paid" && <p className="text-sm text-secondary mt-12">You will receive a refund in 3–5 business days.</p>}
        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          <button className="btn-ghost" onClick={() => setShowCancel(false)}>Keep It</button>
          <button className="btn-danger" disabled={cancelling} onClick={doCancel}>{cancelling ? "Cancelling..." : "Yes, Cancel"}</button>
        </div>
      </BottomSheet>
    </div>
  );
}

function Row({ k, v }: { k: string; v: any }) {
  return <div className="row-between text-sm" style={{ padding: "6px 0" }}><span className="text-secondary">{k}</span><span className="semibold">{v}</span></div>;
}
