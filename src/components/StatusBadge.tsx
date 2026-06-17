const MAP: Record<string, { cls: string; label: string }> = {
  confirmed: { cls: "blue", label: "Confirmed" },
  waiting: { cls: "", label: "Waiting" },
  in_consultation: { cls: "blue pulse-primary", label: "In Consultation" },
  completed: { cls: "green", label: "Completed ✓" },
  cancelled: { cls: "red", label: "Cancelled" },
  no_show: { cls: "red", label: "No Show" },
  paid: { cls: "green", label: "Paid" },
  unpaid: { cls: "orange", label: "Pay Now" },
  pending: { cls: "orange", label: "Pending" },
  refunded: { cls: "", label: "Refunded" },
};

export function StatusBadge({ status }: { status: string }) {
  const m = MAP[status] ?? { cls: "", label: status };
  return <span className={`pill ${m.cls}`}>{m.label}</span>;
}
