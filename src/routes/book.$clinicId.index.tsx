import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TopBar } from "../components/TopBar";
import { SkeletonCard } from "../components/LoadingSpinner";
import { mockApi, type Doctor, type Clinic } from "../lib/mockData";
import { useBooking } from "../context/BookingContext";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const Route = createFileRoute("/book/$clinicId/")({
  head: () => ({ meta: [{ title: "Select Doctor — CarePoint" }] }),
  component: SelectDoctor,
});

function SelectDoctor() {
  const { clinicId } = Route.useParams();
  const [doctors, setDoctors] = useState<Doctor[] | null>(null);
  const [clinic, setClinic] = useState<Clinic | undefined>();
  const { setDoctor, setClinic: setBookingClinic } = useBooking();
  const navigate = useNavigate();

  useEffect(() => {
    mockApi.getClinic(clinicId).then(c => {
      setClinic(c);
      if (c) setBookingClinic(c._id, c.name, c.address);
    });
    mockApi.getDoctors(clinicId).then(setDoctors);
  }, [clinicId, setBookingClinic]);

  return (
    <div>
      <TopBar title={clinic?.name ?? "Loading..."} />
      <p className="subtitle">Step 2 of 4 — Select Doctor</p>
      <div className="page" style={{ paddingTop: 0 }}>
        {doctors === null ? <SkeletonCard /> : doctors.length === 0 ? (
          <div className="card text-secondary text-sm" style={{ textAlign: "center", padding: 24 }}>No doctors available.</div>
        ) : doctors.map(d => (
          <div key={d._id} className="card fade-in-up">
            <div className="row-between">
              <div className="semibold" style={{ fontSize: 16 }}>{d.name}</div>
              <span className="pill">{d.experience} yrs exp</span>
            </div>
            <div className="text-primary-color semibold text-sm mt-8">{d.specialization}</div>
            <div className="text-xs text-secondary">{d.qualification}</div>
            <p className="text-sm text-secondary mt-12" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{d.bio}</p>
            <div className="row gap-8 mt-12" style={{ flexWrap: "wrap" }}>
              {DAY_NAMES.map((name, i) => (
                <span key={i} className={`pill ${d.availableDays.includes(i) ? "green" : ""}`} style={d.availableDays.includes(i) ? {} : { opacity: 0.4 }}>{name}</span>
              ))}
            </div>
            <div className="row-between mt-16">
              <div className="text-sm">💰 <span className="semibold">₹{d.consultationFee}</span></div>
              <button
                className="btn-primary"
                style={{ width: "auto", padding: "10px 20px", fontSize: 14 }}
                onClick={() => {
                  setDoctor(d._id, d.name, d.specialization, d.consultationFee);
                  navigate({ to: "/book/$clinicId/$doctorId", params: { clinicId, doctorId: d._id } });
                }}
              >
                Book →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
