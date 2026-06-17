import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TopBar } from "../components/TopBar";
import { DateStrip } from "../components/DateStrip";
import { TimeSlotGrid, formatTime } from "../components/TimeSlotGrid";
import { SkeletonCard } from "../components/LoadingSpinner";
import { mockApi, type Doctor, type Slot } from "../lib/mockData";
import { useBooking } from "../context/BookingContext";

export const Route = createFileRoute("/book/$clinicId/$doctorId")({
  head: () => ({ meta: [{ title: "Pick Date & Time — CarePoint" }] }),
  component: SelectSlot,
});

function SelectSlot() {
  const { clinicId, doctorId } = Route.useParams();
  const [doctor, setDoctorState] = useState<Doctor | undefined>();
  const [date, setDate] = useState<string | undefined>();
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | undefined>();
  const { setSlot, setDoctor: setBookingDoctor } = useBooking();
  const navigate = useNavigate();

  useEffect(() => {
    mockApi.getDoctor(doctorId).then(d => {
      setDoctorState(d);
      if (d) setBookingDoctor(d._id, d.name, d.specialization, d.consultationFee);
    });
  }, [doctorId, setBookingDoctor]);

  useEffect(() => {
    if (!date) return;
    setSlots(null);
    setSelectedTime(undefined);
    mockApi.getSlots(doctorId, date).then(setSlots);
  }, [date, doctorId]);

  const dayName = date ? new Date(date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" }) : "";
  const available = slots?.filter(s => s.available).length ?? 0;

  const proceed = () => {
    if (!date || !selectedTime || selectedSlotIndex === undefined) return;
    setSlot(date, selectedTime, selectedSlotIndex);
    navigate({ to: "/book/confirm" });
  };

  return (
    <div>
      <TopBar title="Select Schedule" />
      <p className="subtitle">Step 3 of 4 — Pick Date & Time</p>

      {doctor && <DateStrip availableDays={doctor.availableDays} selectedDate={date} onSelect={setDate} />}

      <div className="page">
        {date && (
          <>
            <div className="row-between mb-12">
              <div className="semibold">{dayName}</div>
              {slots && <span className="text-sm text-secondary">{available} slots available</span>}
            </div>

            {slots === null ? <SkeletonCard count={2} /> :
              available === 0 ? <div className="card text-secondary text-sm" style={{ textAlign: "center" }}>No slots available. Please select another date.</div> :
              <TimeSlotGrid slots={slots} selectedTime={selectedTime} onSelect={s => { setSelectedTime(s.time); setSelectedSlotIndex(s.slotIndex); }} />
            }
          </>
        )}

        <button className="btn-primary" style={{ marginTop: 24 }} disabled={!date || !selectedTime} onClick={proceed}>
          {selectedTime ? `${formatTime(selectedTime)}, ${dayName.split(",")[0]} →` : "Continue"}
        </button>
      </div>
    </div>
  );
}
