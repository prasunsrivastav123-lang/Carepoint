import { createContext, useContext, useState, type ReactNode } from "react";

type BookingState = {
  clinicId?: string; clinicName?: string; clinicAddress?: string;
  doctorId?: string; doctorName?: string; doctorSpecialization?: string; doctorFee?: number;
  selectedDate?: string; selectedTime?: string; slotIndex?: number;
  patientName?: string; patientAge?: number; patientGender?: string; reason?: string;
  paymentMethod?: "online" | "clinic";
};

type BookingCtx = {
  booking: BookingState;
  setClinic: (id: string, name: string, address: string) => void;
  setDoctor: (id: string, name: string, spec: string, fee: number) => void;
  setSlot: (date: string, time: string, slotIndex: number) => void;
  setPatientInfo: (name: string, age: number, gender: string, reason: string) => void;
  setPaymentMethod: (m: "online" | "clinic") => void;
  reset: () => void;
};

const Ctx = createContext<BookingCtx | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<BookingState>({});
  return (
    <Ctx.Provider value={{
      booking,
      setClinic: (clinicId, clinicName, clinicAddress) => setBooking(b => ({ ...b, clinicId, clinicName, clinicAddress })),
      setDoctor: (doctorId, doctorName, doctorSpecialization, doctorFee) =>
        setBooking(b => ({ ...b, doctorId, doctorName, doctorSpecialization, doctorFee })),
      setSlot: (selectedDate, selectedTime, slotIndex) => setBooking(b => ({ ...b, selectedDate, selectedTime, slotIndex })),
      setPatientInfo: (patientName, patientAge, patientGender, reason) =>
        setBooking(b => ({ ...b, patientName, patientAge, patientGender, reason })),
      setPaymentMethod: (paymentMethod) => setBooking(b => ({ ...b, paymentMethod })),
      reset: () => setBooking({}),
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useBooking() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useBooking must be inside BookingProvider");
  return c;
}
