import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { api, type Appointment, type Doctor, type Patient } from "../services/api";

// ─── Appointments ──────────────────────────────────────────────────────────────
export function useAppointments(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ["appointments", filters],
    queryFn: () => api.get("/appointments", { params: filters }).then((r) => r.data as Appointment[]),
  });
}

export function useAvailableSlots(doctorId?: string, date?: string) {
  return useQuery({
    queryKey: ["slots", doctorId, date],
    queryFn: () =>
      api.get("/appointments/available-slots", { params: { doctorId, date } })
        .then((r) => r.data.slots as string[]),
    enabled: !!doctorId && !!date,
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Appointment>) => api.post("/appointments", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

export function useUpdateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Appointment>) =>
      api.patch(`/appointments/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

export function useDeleteAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/appointments/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

// ─── Doctors ───────────────────────────────────────────────────────────────────
export function useDoctors() {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: () => api.get("/doctors").then((r) => r.data as Doctor[]),
  });
}

export function useCreateDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Doctor>) => api.post("/doctors", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["doctors"] }),
  });
}

export function useUpdateDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Doctor>) =>
      api.patch(`/doctors/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["doctors"] }),
  });
}

export function useDeleteDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/doctors/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["doctors"] }),
  });
}

// ─── Patients ──────────────────────────────────────────────────────────────────
export function usePatients() {
  return useQuery({
    queryKey: ["patients"],
    queryFn: () => api.get("/patients").then((r) => r.data as Patient[]),
  });
}