import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Trash2, UserRound } from "lucide-react";
import { useOwnerAuth } from "../context/OwnerAuthContext";
import { mockApi, type Doctor } from "../lib/mockData";
import { useToast } from "../components/Toast";

export const Route = createFileRoute("/owner/doctors")({
  head: () => ({ meta: [{ title: "Doctors — Owner" }] }),
  component: OwnerDoctorsPage,
});

function OwnerDoctorsPage() {
  const { owner, token } = useOwnerAuth();
  const navigate = useNavigate();
  const { show } = useToast();
  const [docs, setDocs] = useState<Doctor[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", specialization: "", qualification: "", experience: 5, consultationFee: 400, bio: "" });

  useEffect(() => { if (!token) navigate({ to: "/owner/login", replace: true }); }, [token, navigate]);

  const load = async () => {
    if (!owner) return;
    setDocs(await mockApi.getDoctors(owner.clinicId));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [owner]);

  if (!owner) return null;

  const submit = async () => {
    if (!form.name || !form.specialization) { show("Name & specialization required", "error"); return; }
    await mockApi.addDoctor({
      clinicId: owner.clinicId,
      name: form.name, specialization: form.specialization, qualification: form.qualification,
      experience: Number(form.experience), consultationFee: Number(form.consultationFee),
      availableDays: [1,2,3,4,5,6], bio: form.bio || "Added by clinic owner.",
    });
    show("Doctor added", "success");
    setForm({ name: "", specialization: "", qualification: "", experience: 5, consultationFee: 400, bio: "" });
    setAdding(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this doctor?")) return;
    await mockApi.removeDoctor(id);
    show("Doctor removed", "success");
    load();
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="top-bar">
        <button className="back-btn" onClick={() => navigate({ to: "/owner" })}><ArrowLeft size={22} /></button>
        <h1>Doctors</h1>
        {!adding && (
          <button onClick={() => setAdding(true)} style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
            <Plus size={16} /> Add
          </button>
        )}
      </div>

      <div style={{ padding: 16 }}>
        {adding && (
          <div className="card">
            <div className="semibold mb-12">New Doctor</div>
            <input className="input mb-8" placeholder="Doctor name (e.g. Dr. Asha Patel)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input className="input mb-8" placeholder="Specialization" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} />
            <input className="input mb-8" placeholder="Qualification (MBBS, MD)" value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <input className="input mb-8" type="number" placeholder="Experience (yrs)" value={form.experience} onChange={e => setForm({ ...form, experience: Number(e.target.value) })} />
              <input className="input mb-8" type="number" placeholder="Fee ₹" value={form.consultationFee} onChange={e => setForm({ ...form, consultationFee: Number(e.target.value) })} />
            </div>
            <textarea className="input mb-12" placeholder="Short bio (optional)" rows={2} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
              <button className="btn-primary" onClick={submit}>Save Doctor</button>
            </div>
          </div>
        )}

        {docs.length === 0 ? (
          <div className="card text-secondary text-sm" style={{ textAlign: "center", padding: 24 }}>No doctors yet. Add your first one.</div>
        ) : docs.map(d => (
          <div key={d._id} className="card" style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <UserRound size={22} color="var(--primary)" />
            </div>
            <div style={{ flex: 1 }}>
              <div className="semibold">{d.name}</div>
              <div className="text-xs text-secondary">{d.specialization} · {d.experience}y · ₹{d.consultationFee}</div>
            </div>
            <button onClick={() => remove(d._id)} style={{ background: "var(--danger-light)", color: "var(--danger)", border: "none", borderRadius: 10, padding: 10, cursor: "pointer" }}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
