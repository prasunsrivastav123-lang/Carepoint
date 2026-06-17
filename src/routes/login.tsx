import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Hospital } from "lucide-react";
import { usePatientAuth } from "../context/PatientAuthContext";
import { OTPInput } from "../components/OTPInput";
import { mockApi } from "../lib/mockData";
import { useToast } from "../components/Toast";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — CarePoint" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login, token } = usePatientAuth();
  const navigate = useNavigate();
  const { show } = useToast();

  useEffect(() => { if (token) navigate({ to: "/home", replace: true }); }, [token, navigate]);

  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(false);
  const [resends, setResends] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = () => {
    setCountdown(30);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setCountdown(c => { if (c <= 1) { clearInterval(timer.current!); return 0; } return c - 1; });
    }, 1000);
  };
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const sendOtp = async () => {
    if (phone.length !== 10) return;
    setSending(true);
    try {
      await mockApi.sendOtp(phone);
      setStep(2);
      startCountdown();
      show("OTP sent — use 123456 for demo", "success");
    } catch (e: any) { show(e.message || "Failed", "error"); }
    finally { setSending(false); }
  };

  const resend = async () => {
    if (resends >= 3) { show("Too many attempts. Try after 10 minutes.", "error"); return; }
    setResends(r => r + 1);
    await sendOtp();
  };

  const verify = async (otp: string) => {
    setVerifying(true);
    setError(false);
    try {
      const { token: t, patient } = await mockApi.verifyOtp(phone, otp);
      login(t, patient);
      navigate({ to: "/home", replace: true });
    } catch (e: any) {
      setError(true);
      show(e.message || "Invalid OTP", "error");
      setTimeout(() => setError(false), 500);
    } finally { setVerifying(false); }
  };

  return (
    <div style={{ padding: "32px 20px", minHeight: "100vh" }}>
      {step === 2 && (
        <button onClick={() => setStep(1)} style={{ background: "none", border: "none", cursor: "pointer", marginBottom: 12 }}>
          <ArrowLeft size={22} />
        </button>
      )}

      <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Hospital size={36} color="var(--primary)" />
        </div>
      </div>

      <h1 style={{ textAlign: "center", marginTop: 16, fontSize: 24, fontWeight: 800 }}>
        {step === 1 ? "Welcome to CarePoint" : "Enter OTP"}
      </h1>
      <p style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: 6, fontSize: 14 }}>
        {step === 1 ? "Book appointments & track your token live" : `Sent to +91 XXXXXX${phone.slice(-4)} via WhatsApp`}
      </p>

      <div className="card" style={{ marginTop: 32 }}>
        {step === 1 ? (
          <>
            <label className="text-sm semibold" style={{ display: "block", marginBottom: 8 }}>Enter your WhatsApp number</label>
            <div style={{ display: "flex", gap: 8 }}>
              <div className="input" style={{ width: 80, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600 }}>🇮🇳 +91</div>
              <input
                className="input"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                style={{ flex: 1 }}
              />
            </div>
            <button
              className="btn-primary"
              style={{ marginTop: 20 }}
              disabled={phone.length !== 10 || sending}
              onClick={sendOtp}
            >
              {sending ? "Sending..." : "Send OTP on WhatsApp"}
            </button>
            <p className="text-xs text-secondary" style={{ textAlign: "center", marginTop: 12 }}>
              Demo: any 10 digits → OTP is <span className="semibold">123456</span>
            </p>
            <div style={{ textAlign: "center", marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
              <a href="/owner/login" style={{ color: "var(--warning)", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
                🏥 Clinic Owner? Login here →
              </a>
            </div>
          </>
        ) : (
          <>
            <OTPInput onComplete={verify} error={error} />
            {verifying && <p className="text-sm text-secondary" style={{ textAlign: "center" }}>Verifying...</p>}
            <div style={{ textAlign: "center", marginTop: 16 }}>
              {countdown > 0 ? (
                <span className="text-sm text-secondary">Resend in 0:{String(countdown).padStart(2, "0")}</span>
              ) : (
                <button onClick={resend} style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 600, cursor: "pointer" }}>
                  Resend OTP
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
