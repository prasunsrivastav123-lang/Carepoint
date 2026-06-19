import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { useDoctors, usePatients, useAppointments } from "../hooks/useData";
import * as Utils from "../lib/utils";
import {
  CalendarDays,
  CreditCard,
  CheckCircle2,
  UserX,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { PieChart, Pie, Cell, Legend } from "recharts";

export function DashboardPage() {
  const today = new Date().toISOString().split("T")[0];
  const { data: all } = useAppointments();
  const { data: todayAppts } = useAppointments({ date: today });
  const { data: doctors } = useDoctors();
  const { data: patients } = usePatients();

  // Build last-14-days chart data
  const [chartData, setChartData] = useState<{ date: string; count: number }[]>([]);
  useEffect(() => {
    if (!all) return;
    const map: Record<string, number> = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      map[key] = 0;
    }
    all.forEach((a) => {
      const key = a.date?.split("T")[0] ?? a.date;
      if (key in map) map[key]++;
    });
    setChartData(
      Object.entries(map).map(([date, count]) => ({
        date: date.slice(5), // MM-DD
        count,
      }))
    );
  }, [all]);

  // Status breakdown pie
  const statusMap: Record<string, number> = {};
  all?.forEach((a) => {
    statusMap[a.status] = (statusMap[a.status] ?? 0) + 1;
  });
  const PIE_COLORS: Record<string, string> = {
    cancelled: "#ef4444",
    completed: "#10b981",
    confirmed: "#3b82f6",
    in_consultation: "#60a5fa",
    no_show: "#f87171",
    pending: "#f59e0b",
  };
  const pieData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

  // Pending payments
  const pendingPayments = all?.filter(
    (a) => (a as any).paymentStatus === "unpaid" || (a as any).paymentStatus === "pending"
  );
  const pendingAmount = pendingPayments?.reduce(
    (sum, a) => sum + (a.doctor?.fee ?? 0),
    0
  ) ?? 0;

  const completed = todayAppts?.filter((a) => a.status === "completed").length ?? 0;
  const noShows = todayAppts?.filter((a) => a.status === "no_show").length ?? 0;

  const stats = [
    {
      label: "TODAY'S APPOINTMENTS",
      value: todayAppts?.length ?? "—",
      icon: <CalendarDays size={22} />,
      iconBg: "#e0e7ff",
      iconColor: "#3730a3",
    },
    {
      label: "PENDING PAYMENTS",
      value: `₹${pendingAmount.toLocaleString("en-IN")}`,
      icon: <CreditCard size={22} />,
      iconBg: "#fef3c7",
      iconColor: "#b45309",
    },
    {
      label: "COMPLETED TODAY",
      value: completed,
      icon: <CheckCircle2 size={22} />,
      iconBg: "#d1fae5",
      iconColor: "#065f46",
    },
    {
      label: "NO-SHOWS TODAY",
      value: noShows,
      icon: <UserX size={22} />,
      iconBg: "#fee2e2",
      iconColor: "#991b1b",
    },
  ];

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.15rem" }}>
        Dashboard
      </h1>
      <p style={{ color: "var(--color-cp-muted)", marginBottom: "1.75rem", fontSize: "0.88rem" }}>
        Snapshot of today's clinic activity · auto-refreshes every 60s
      </p>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {stats.map((s) => (
          <div key={s.label} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--color-cp-muted)", letterSpacing: "0.06em", marginBottom: "0.6rem" }}>
                  {s.label}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, lineHeight: 1 }}>
                  {s.value}
                </div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center", color: s.iconColor, flexShrink: 0 }}>
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1rem", marginBottom: "1.5rem" }}>
        {/* Line chart */}
        <div style={card}>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--color-cp-muted)", letterSpacing: "0.06em", marginBottom: "1rem" }}>
            APPOINTMENTS · LAST 14 DAYS
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2f0ee" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#5a7a76" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#5a7a76" }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 3, fill: "#2563eb" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div style={card}>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--color-cp-muted)", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
            STATUS BREAKDOWN
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={PIE_COLORS[entry.name] ?? "#94a3b8"} />
                  ))}
                </Pie>
                <Legend
                  iconType="square"
                  iconSize={10}
                  formatter={(value) => <span style={{ fontSize: "0.72rem", color: "#5a7a76" }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: "center", color: "var(--color-cp-muted)", padding: "2rem" }}>No data</div>
          )}
        </div>
      </div>

      {/* Upcoming today */}
      <div style={card}>
        <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.75rem" }}>Upcoming Today</div>
        {!todayAppts?.length ? (
          <div style={{ color: "var(--color-cp-muted)", padding: "1rem 0", fontSize: "0.9rem" }}>No appointments today.</div>
        ) : (
          <div>
            {todayAppts.map((appt) => (
              <div key={appt._id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem 0", borderBottom: "1px solid var(--color-cp-border)" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: "var(--color-cp-accent)", width: 52, flexShrink: 0 }}>
                  {Utils.formatTime(appt.time)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{appt.patient.name}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--color-cp-muted)" }}>Dr. {appt.doctor.name}</div>
                </div>
                <span className={`badge badge-${appt.status}`}>{appt.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const card: CSSProperties = {
  background: "white",
  border: "1px solid var(--color-cp-border)",
  borderRadius: 16,
  padding: "1.25rem 1.5rem",
};

export default DashboardPage;