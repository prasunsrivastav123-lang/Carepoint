import { useEffect, useMemo, useRef } from "react";

const DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function DateStrip({
  availableDays,
  selectedDate,
  onSelect,
  days = 14,
}: {
  availableDays: number[];
  selectedDate?: string;
  onSelect: (date: string) => void;
  days?: number;
}) {
  const list = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(today); d.setDate(today.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      return { date: d, iso, day: DAY_ABBR[d.getDay()], num: d.getDate(), available: availableDays.includes(d.getDay()) };
    });
  }, [availableDays, days]);

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const idx = list.findIndex(d => d.available);
    if (idx > -1 && ref.current) {
      const el = ref.current.children[idx] as HTMLElement | undefined;
      el?.scrollIntoView({ inline: "start", behavior: "instant" as ScrollBehavior });
    }
  }, [list]);

  return (
    <div className="scroll-x" ref={ref} style={{ padding: "0 16px 4px" }}>
      {list.map(d => (
        <button
          key={d.iso}
          disabled={!d.available}
          onClick={() => d.available && onSelect(d.iso)}
          className={`date-pill ${selectedDate === d.iso ? "selected" : ""} ${!d.available ? "disabled" : ""}`}
        >
          <div className="day">{d.day}</div>
          <div className="num">{d.num}</div>
        </button>
      ))}
    </div>
  );
}
