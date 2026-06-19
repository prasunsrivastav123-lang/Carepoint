import { useState } from "react";
import { useDoctors, useCreateDoctor, useUpdateDoctor, useDeleteDoctor } from "../hooks/useData";
import { Plus, Edit2, X, Check } from "lucide-react";
import { toast } from "sonner";
import type { Doctor } from "../services/api";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const emptyDoctor = {
  name: "", specialization: "", phone: "", email: "", fee: 500,
  availableSlots: [{ day: "Mon", startTime: "09:00", endTime: "17:00", slotDuration: 30 }],
};

export function DoctorsPage() {
  const { data: doctors, isLoading } = useDoctors();
  const createDoctor = useCreateDoctor();
  const updateDoctor = useUpdateDoctor();
  const deleteDoctor = useDeleteDoctor();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [form, setForm] = useState(emptyDoctor);

  function openAdd() { setForm(emptyDoctor); setEditing(null); setShowForm(true); }
  function openEdit(doc: Doctor) {
    setForm({ name: doc.name, specialization: doc.specialization, phone: doc.phone, email: doc.email || "", fee: doc.fee, availableSlots: doc.availableSlots });
    setEditing(doc);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editing) {
        await updateDoctor.mutateAsync({ id: editing._id, ...form });
        toast.success("Doctor updated");
      } else {
        await createDoctor.mutateAsync(form);
        toast.success("Doctor added");
      }
      setShowForm(false);
    } catch { toast.error("Save failed"); }
  }

  async function toggleActive(doc: Doctor) {
    try {
      await updateDoctor.mutateAsync({ id: doc._id, isActive: !doc.isActive } as never);
      toast.success(doc.isActive ? "Doctor deactivated" : "Doctor activated");
    } catch { toast.error("Update failed"); }
  }

  function updateSlot(i: number, field: string, value: string | number) {
    const slots = [...form.availableSlots];
    slots[i] = { ...slots[i], [field]: value };
    setForm({ ...form, availableSlots: slots });
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700 }}>Doctors</h1>
          <p style={{ color: "var(--color-cp-muted)", fontSize: "0.88rem" }}>{doctors?.length ?? 0} doctors</p>
        </div>
        <button onClick={openAdd} style={accentBtn}>
          <Plus size={16} /> Add Doctor
        </button>
      </div>

      {/* Cards grid */}
      {isLoading ? <div style={{ color: "var(--color-cp-muted)" }}>Loading…</div> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {doctors?.map((doc) => (
            <div key={doc._id} style={{ background: "white", border: "1px solid var(--color-cp-border)", borderRadius: 16, padding: "1.25rem", opacity: doc.isActive ? 1 : 0.6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--color-cp-accent-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-cp-accent)", fontWeight: 700, fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>
                  {doc.name.charAt(0)}
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => openEdit(doc)} style={smIconBtn}><Edit2 size={14} /></button>
                  <button onClick={() => toggleActive(doc)} style={{ ...smIconBtn, color: doc.isActive ? "var(--color-cp-danger)" : "var(--color-cp-success)" }}>
                    {doc.isActive ? <X size={14} /> : <Check size={14} />}
                  </button>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>Dr. {doc.name}</div>
              <div style={{ fontSize: "0.82rem", color: "var(--color-cp-muted)", marginBottom: "0.5rem" }}>{doc.specialization}</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                <span style={{ color: "var(--color-cp-muted)" }}>{doc.phone}</span>
                <span style={{ fontWeight: 700, color: "var(--color-cp-accent)" }}>₹{doc.fee}</span>
              </div>
              <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                {doc.availableSlots.map((s) => (
                  <span key={s.day} style={{ fontSize: "0.72rem", background: "var(--color-teal-50)", color: "var(--color-teal-700)", padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>
                    {s.day} {s.startTime}–{s.endTime}
                  </span>
                ))}
              </div>
              <div style={{ marginTop: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: 6, background: doc.isActive ? "#d1fae5" : "#fee2e2", color: doc.isActive ? "#065f46" : "#991b1b", fontWeight: 600 }}>
                  {doc.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "1rem" }}>
          <div style={{ background: "white", borderRadius: 20, padding: "2rem", width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>{editing ? "Edit Doctor" : "Add Doctor"}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { label: "Full Name", field: "name", type: "text", placeholder: "Arjun Mehta" },
                { label: "Specialization", field: "specialization", type: "text", placeholder: "General Physician" },
                { label: "Phone", field: "phone", type: "tel", placeholder: "9876543210" },
                { label: "Email (optional)", field: "email", type: "email", placeholder: "doctor@clinic.in" },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field}>
                  <label style={labelStyle}>{label}</label>
                  <input type={type} placeholder={placeholder} required={field !== "email"}
                    value={form[field as keyof typeof form] as string}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    style={inputStyle} />
                </div>
              ))}

              <div>
                <label style={labelStyle}>Consultation Fee (₹)</label>
                <input type="number" min={0} value={form.fee} onChange={(e) => setForm({ ...form, fee: +e.target.value })} style={inputStyle} />
              </div>

              <div>
                <label style={{ ...labelStyle, marginBottom: "0.75rem" }}>Available Slots</label>
                {form.availableSlots.map((slot, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr auto", gap: "0.5rem", marginBottom: "0.5rem", alignItems: "center" }}>
                    <select value={slot.day} onChange={(e) => updateSlot(i, "day", e.target.value)} style={{ ...inputStyle, padding: "0.5rem" }}>
                      {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <input type="time" value={slot.startTime} onChange={(e) => updateSlot(i, "startTime", e.target.value)} style={{ ...inputStyle, padding: "0.5rem" }} />
                    <input type="time" value={slot.endTime} onChange={(e) => updateSlot(i, "endTime", e.target.value)} style={{ ...inputStyle, padding: "0.5rem" }} />
                    <button type="button" onClick={() => setForm({ ...form, availableSlots: form.availableSlots.filter((_, j) => j !== i) })}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-cp-danger)" }}><X size={16} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setForm({ ...form, availableSlots: [...form.availableSlots, { day: "Mon", startTime: "09:00", endTime: "17:00", slotDuration: 30 }] })}
                  style={{ ...iconBtn, marginTop: "0.5rem" }}><Plus size={14} /> Add Day</button>
              </div>

              <button type="submit" disabled={createDoctor.isPending || updateDoctor.isPending} style={submitBtn}>
                {createDoctor.isPending || updateDoctor.isPending ? "Saving…" : editing ? "Save Changes" : "Add Doctor"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const accentBtn: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "0.4rem",
  background: "var(--color-cp-accent)", color: "white", border: "none",
  borderRadius: 10, padding: "0.6rem 1.1rem", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer",
};
const smIconBtn: React.CSSProperties = {
  background: "var(--color-teal-50)", border: "none", borderRadius: 8,
  width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", color: "var(--color-cp-muted)",
};
const iconBtn: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "0.4rem", background: "var(--color-teal-50)",
  border: "1px solid var(--color-cp-border)", borderRadius: 8, padding: "0.4rem 0.8rem",
  fontSize: "0.82rem", cursor: "pointer", color: "var(--color-teal-700)", fontWeight: 600,
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.65rem 0.9rem", border: "1.5px solid var(--color-cp-border)",
  borderRadius: 10, fontSize: "0.9rem", outline: "none", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = { fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.35rem", display: "block" };
const submitBtn: React.CSSProperties = {
  background: "var(--color-cp-accent)", color: "white", border: "none",
  borderRadius: 10, padding: "0.85rem", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer",
};
export default DoctorsPage;