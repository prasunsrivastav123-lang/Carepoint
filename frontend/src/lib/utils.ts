export function formatDate(dateStr: string) {
  const d = new Date(dateStr);

  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);

  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;

  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function getUser() {
  return null;
}