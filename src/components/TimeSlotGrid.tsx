import type { Slot } from "../lib/mockData";

function fmt(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function TimeSlotGrid({ slots, selectedTime, onSelect }: { slots: Slot[]; selectedTime?: string; onSelect: (s: Slot) => void }) {
  return (
    <div className="slot-grid">
      {slots.map(s => (
        <button
          key={s.slotIndex}
          disabled={!s.available}
          onClick={() => s.available && onSelect(s)}
          className={`slot ${selectedTime === s.time ? "selected" : ""} ${!s.available ? "disabled" : ""}`}
        >
          {fmt(s.time)}
        </button>
      ))}
    </div>
  );
}

export { fmt as formatTime };
