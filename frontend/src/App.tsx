import { Routes, Route, Link } from "react-router-dom";

import DashboardPage from "./pages/DashboardPage";
import DoctorsPage from "./pages/DoctorsPage";
import PatientsPage from "./pages/PatientsPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import QueuePage from "./pages/QueuePage";

export default function App() {
  return (
    <div>
      <nav
        style={{
          display: "flex",
          gap: "20px",
          padding: "15px",
          background: "#0f172a",
        }}
      >
        <Link to="/" style={{ color: "white" }}>
          Dashboard
        </Link>

        <Link to="/doctors" style={{ color: "white" }}>
          Doctors
        </Link>

        <Link to="/patients" style={{ color: "white" }}>
          Patients
        </Link>

        <Link to="/appointments" style={{ color: "white" }}>
          Appointments
        </Link>

        <Link to="/queue" style={{ color: "white" }}>
          Queue
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/doctors" element={<DoctorsPage />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/queue" element={<QueuePage />} />
      </Routes>
    </div>
  );
}