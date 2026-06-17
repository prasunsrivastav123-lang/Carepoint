import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Owner = { _id: string; phone: string; clinicId: string; clinicName: string };

type Ctx = {
  owner: Owner | null;
  token: string | null;
  isLoading: boolean;
  login: (t: string, o: Owner) => void;
  logout: () => void;
};

const OwnerCtx = createContext<Ctx | null>(null);
const TKEY = "CarePoint_owner_token";
const OKEY = "CarePoint_owner";

export function OwnerAuthProvider({ children }: { children: ReactNode }) {
  const [owner, setOwner] = useState<Owner | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const t = localStorage.getItem(TKEY);
      const o = localStorage.getItem(OKEY);
      if (t && o) { setToken(t); setOwner(JSON.parse(o)); }
    } catch {}
    setLoading(false);
  }, []);

  const login = (t: string, o: Owner) => {
    localStorage.setItem(TKEY, t);
    localStorage.setItem(OKEY, JSON.stringify(o));
    setToken(t); setOwner(o);
  };
  const logout = () => {
    localStorage.removeItem(TKEY); localStorage.removeItem(OKEY);
    setToken(null); setOwner(null);
  };

  return <OwnerCtx.Provider value={{ owner, token, isLoading, login, logout }}>{children}</OwnerCtx.Provider>;
}

export function useOwnerAuth() {
  const c = useContext(OwnerCtx);
  if (!c) throw new Error("useOwnerAuth must be inside OwnerAuthProvider");
  return c;
}
