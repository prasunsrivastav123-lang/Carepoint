import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Patient = { _id: string; phone: string; name?: string; age?: number; gender?: string; bloodGroup?: string; allergies?: string; isProfileComplete?: boolean };

type AuthCtx = {
  patient: Patient | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, patient: Patient) => void;
  logout: () => void;
  updatePatient: (p: Partial<Patient>) => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function PatientAuthProvider({ children }: { children: ReactNode }) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const t = localStorage.getItem("CarePoint_token");
      const p = localStorage.getItem("CarePoint_patient");
      if (t && p) { setToken(t); setPatient(JSON.parse(p)); }
    } catch {}
    setLoading(false);
  }, []);

  const login = (t: string, p: Patient) => {
    localStorage.setItem("CarePoint_token", t);
    localStorage.setItem("CarePoint_patient", JSON.stringify(p));
    setToken(t); setPatient(p);
  };
  const logout = () => {
    localStorage.removeItem("CarePoint_token");
    localStorage.removeItem("CarePoint_patient");
    setToken(null); setPatient(null);
  };
  const updatePatient = (p: Partial<Patient>) => {
    setPatient(cur => {
      const merged = { ...(cur || { _id: "", phone: "" }), ...p };
      localStorage.setItem("CarePoint_patient", JSON.stringify(merged));
      return merged;
    });
  };

  return <Ctx.Provider value={{ patient, token, isLoading, login, logout, updatePatient }}>{children}</Ctx.Provider>;
}

export function usePatientAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePatientAuth must be inside PatientAuthProvider");
  return c;
}
