import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cp_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("cp_token");
      localStorage.removeItem("cp_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export interface User {
  id: string; name: string; email: string;
  role: "admin" | "doctor" | "receptionist";
}
export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  phone: string;
  email?: string;
  fee: number;
  isActive: boolean;

  availableSlots: {
    day: string;
    startTime: string;
    endTime: string;
    slotDuration: number;
  }[];
}

export interface Patient {
  _id: string;
  name: string;
  phone: string;
  age?: number;
  gender?: "male" | "female" | "other";
  createdAt: string;
}

export interface Appointment {
  _id: string;

  patient: {
    _id: string;
    name: string;
    phone: string;
  };

  doctor: {
    _id: string;
    name: string;
    specialization: string;
  };

  date: string;
  time: string;

  tokenNumber?: number;

  queueStatus?:
    | "waiting"
    | "serving"
    | "completed";

  status:
    | "pending"
    | "confirmed"
    | "completed"
    | "cancelled";

  notes?: string;

  createdAt: string;
}