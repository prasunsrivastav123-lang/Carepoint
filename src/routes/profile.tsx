import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TopBar } from "../components/TopBar";
import { usePatientAuth } from "../context/PatientAuthContext";
import { mockApi, type Appointment } from "../lib/mockData";
import { useToast } from "../components/Toast";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — CarePoint" }] }),
  component: Profile,
});

function Profile() {
  const { patient, logout, updatePatient, token, isLoading } = usePatientAuth();
  const navigate = useNavigate();
  const { show } = useToast();
  const [name, setName] = useState(patient?.name ?? "");
  const [age, setAge] = useState(patient?.age?.toString() ?? "");
  const [gender, setGender] = useState(patient?.gender ?? "");
  const [blood, setBlood] = useState(patient?.bloodGroup ?? "");
  const [allergies, setAllergies] = useState(patient?.allergies ?? "");
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!isLoading && !token) navigate({ to: "/login", replace: true }); }, [token, isLoading, navigate]);
  useEffect(() => { if (patient) mockApi.myAppointments(patient._id).then(setAppts); }, [patient]);

  const save = async () => {
    if (!patient) return;
    setSaving(true);
    try {
      const updated = await mockApi.updateProfile(patient._id, { name, age: Number(age), gender, bloodGroup: blood, allergies });
      updatePatient(updated);
      show("Profile saved", "success");
    } catch (e: any) { show(e.message, "error"); }
    finally { setSaving(false); }
  };

  const initials = (patient?.name || patient?.phone || "P")
    .split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();

  const thisYear = new Date().getFullYear();
  const stats = {
    total: appts.length,
    yearly: appts.filter(a => new Date(a.appointmentDate).getFullYear() === thisYear).length,
    cancelled: appts.filter(a => a.status === "cancelled").length,
  };

  return (
    <div>
      <TopBar title="Profile" back={false} />
      <div className="page">
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, margin: "0 auto" }}>
            {initials}
          </div>
          <div className="semibold mt-12" style={{ fontSize: 17 }}>{patient?.name || "Add your name"}</div>
          <div className="text-sm text-secondary">+91 {patient?.phone} ✓ Verified</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 16 }}>
          {[
            { label: "Total Visits", v: stats.total },
            { label: "This Year", v: stats.yearly },
            { label: "Cancelled", v: stats.cancelled },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: "center", margin: 0 }}>
              <div className="bold text-primary-color" style={{ fontSize: 22 }}>{s.v}</div>
              <div className="text-xs text-secondary">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="card mt-16">
          <label className="text-sm semibold">Name</label>
          <input className="input mt-8" value={name} onChange={e => setName(e.target.value)} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div>
              <label className="text-sm semibold mt-16" style={{ display: "block" }}>Age</label>
              <input className="input mt-8" type="number" value={age} onChange={e => setAge(e.target.value)} />
            </div>
            <div>
              <label className="text-sm semibold mt-16" style={{ display: "block" }}>Gender</label>
              <select className="input mt-8" value={gender} onChange={e => setGender(e.target.value)}>
                <option value="">—</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <label className="text-sm semibold mt-16" style={{ display: "block" }}>Blood Group</label>
          <select className="input mt-8" value={blood} onChange={e => setBlood(e.target.value)}>
            <option value="">Select</option>
            {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          <label className="text-sm semibold mt-16" style={{ display: "block" }}>Allergies</label>
          <input className="input mt-8" value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="e.g. Penicillin, peanuts" />

          <button className="btn-primary mt-16" disabled={saving} onClick={save}>{saving ? "Saving..." : "Save"}</button>
        </div>

        <button className="btn-danger mt-16" onClick={() => { logout(); navigate({ to: "/login", replace: true }); }}>
          Logout
        </button>
      </div>
    </div>
  );
}
