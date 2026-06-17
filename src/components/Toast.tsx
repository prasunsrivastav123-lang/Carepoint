import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

type Toast = { id: number; message: string; type: "success" | "error" | "warning" };
const Ctx = createContext<{ show: (m: string, t?: Toast["type"]) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);
  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 200, width: "calc(100% - 32px)", maxWidth: 400, pointerEvents: "none" }}>
        {toasts.map(t => {
          const color = t.type === "success" ? "var(--success)" : t.type === "error" ? "var(--danger)" : "var(--warning)";
          const Icon = t.type === "success" ? CheckCircle2 : t.type === "error" ? XCircle : AlertTriangle;
          return (
            <div key={t.id} className="slide-down-toast" style={{
              background: "white", borderRadius: 12, padding: "12px 16px", marginBottom: 8,
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)", display: "flex", gap: 10, alignItems: "center",
              borderLeft: `4px solid ${color}`,
            }}>
              <Icon size={20} color={color} />
              <span style={{ fontSize: 14, fontWeight: 500 }}>{t.message}</span>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useToast inside ToastProvider");
  return c;
}
