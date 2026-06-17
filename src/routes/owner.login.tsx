import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Building2 } from "lucide-react";
import { OTPInput } from "../components/OTPInput";
import { mockApi } from "../lib/mockData";
import { useOwnerAuth } from "../context/OwnerAuthContext";
import { useToast } from "../components/Toast";

export const Route = createFileRoute("/owner/login")({
  head: () => ({ meta: [{ title: "Owner Login — CarePoint" }] }),
  component: OwnerLoginPage,
});

function OwnerLoginPage() {
  const { login, token } = useOwnerAuth();
  const navigate = useNavigate();
  const { show } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => { if (token) navigate({ to: "/owner", replace: true }); }, [token, navigate]);

  const send = async () => {
    if (phone.length !== 10) return;
    setSending(true);
    try { await mockApi.ownerSendOtp(phone); setStep(2); show("OTP sent — use 123456", "success"); }
    catch (e: any) { show(e.message, "error"); }
    finally { setSending(false); }
  };

  const verify = async (otp: string) => {
    try {
      const { token: t, owner } = await mockApi.ownerVerifyOtp(phone, otp);
      login(t, owner);
      navigate({ to: "/owner", replace: true });
    } catch (e: any) {
      setError(true); show(e.message, "error");
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div style={{ padding: "32px 20px", minHeight: "100vh" }}>
      {step === 2 && (
        <button onClick={() => setStep(1)} style={{ background: "none", border: "none", cursor: "pointer", marginBottom: 12 }}>
          <ArrowLeft size={22} />
        </button>
      )}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#FFF4E5", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Building2 size={36} color="var(--warning)" />
        </div>
      </div>
      <h1 style={{ textAlign: "center", marginTop: 16, fontSize: 24, fontWeight: 800 }}>
        {step === 1 ? "Clinic Owner Portal" : "Enter OTP"}
      </h1>
      <p style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: 6, fontSize: 14 }}>
        {step === 1 ? "Manage queue & doctors in real time" : `Sent to +91 XXXXXX${phone.slice(-4)}`}
      </p>

      <div className="card" style={{ marginTop: 32 }}>
        {step === 1 ? (
          <>
            <label className="text-sm semibold" style={{ display: "block", marginBottom: 8 }}>Owner WhatsApp number</label>
            <div style={{ display: "flex", gap: 8 }}>
              <div className="input" style={{ width: 80, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600 }}>🇮🇳 +91</div>
              <input className="input" type="tel" inputMode="numeric" maxLength={10} placeholder="9000000001"
                value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} style={{ flex: 1 }} />
            </div>
            <button className="btn-primary" style={{ marginTop: 20, background: "var(--warning)" }} disabled={phone.length !== 10 || sending} onClick={send}>
              {sending ? "Sending..." : "Send OTP"}
            </button>
            <div className="text-xs text-secondary" style={{ textAlign: "center", marginTop: 12, lineHeight: 1.6 }}>
              Demo owners: <span className="semibold">9000000001</span> → City Care · <span className="semibold">…2</span> → BrightSmile · <span className="semibold">…3</span> → VisionPlus · <span className="semibold">…4</span> → Apollo<br/>
              OTP is <span className="semibold">123456</span>
            </div>
          </>
        ) : (
          <OTPInput onComplete={verify} error={error} />
        )}
      </div>

      <p style={{ textAlign: "center", marginTop: 24, fontSize: 13 }}>
        Patient instead? <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>Patient login</Link>
      </p>
    </div>
  );
}
