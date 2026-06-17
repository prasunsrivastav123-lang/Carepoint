import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TopBar } from "../components/TopBar";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { LiveTokenBoard } from "../components/LiveTokenBoard";
import { useTokenTracker } from "../hooks/useTokenTracker";
import { formatTime } from "../components/TimeSlotGrid";

export const Route = createFileRoute("/token/$appointmentId")({
  head: () => ({ meta: [{ title: "Live Token — CarePoint" }] }),
  component: LiveToken,
});

function LiveToken() {
  const { appointmentId } = Route.useParams();
  const { data, isLoading } = useTokenTracker(appointmentId);
  const [secsSince, setSecsSince] = useState(0);

  useEffect(() => {
    setSecsSince(0);
    const t = setInterval(() => setSecsSince(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [data?.lastUpdated]);

  if (isLoading || !data) return <div style={{ padding: 80, textAlign: "center" }}><LoadingSpinner /></div>;

  const { myToken, currentToken, tokensAhead, estimatedWaitMinutes, status, doctor, appointmentTime, queue, totalTokens, completedCount, waitingCount } = data;

  const isAlmost = status === "waiting" && tokensAhead <= 2 && tokensAhead > 0;
  const inConsult = status === "in_consultation";
  const completed = status === "completed";

  const cardStyle = inConsult
    ? { background: "var(--primary-light)", border: "2px solid var(--primary)" }
    : isAlmost
    ? { background: "var(--warning-light)", border: "2px solid var(--warning)" }
    : completed
    ? { background: "var(--success-light)", border: "2px solid var(--success)" }
    : {};

  const tokenColor = isAlmost ? "var(--warning)" : completed ? "var(--success)" : "var(--primary)";

  return (
    <div>
      <TopBar
        title="Live Token"
        right={<div className="row gap-8 text-sm semibold text-danger"><span className="pulse-red" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--danger)" }} /> Live</div>}
      />
      <p className="subtitle">Last updated {secsSince}s ago</p>

      <div className="page" style={{ paddingTop: 0 }}>
        <div className={`card ${isAlmost ? "pulse-warning" : inConsult ? "pulse-primary" : ""}`} style={{ ...cardStyle, padding: 24, textAlign: "center" }}>
          <div className="semibold text-secondary text-sm" style={{ letterSpacing: 0.5 }}>
            {completed ? "✅ Consultation Done" : inConsult ? "🩺 In Consultation" : isAlmost ? "⚡ Almost Your Turn!" : "Your Token"}
          </div>
          <div className="token-big mt-8" style={{ color: tokenColor }}>#{myToken}</div>
          {!completed && !inConsult && !isAlmost && (
            <>
              <div className="text-sm semibold mt-12">Tokens ahead: {tokensAhead}</div>
              <div className="text-sm text-secondary">Est. wait: ~{estimatedWaitMinutes} mins</div>
            </>
          )}
          {isAlmost && (
            <>
              <div className="semibold mt-12">Only {tokensAhead} patient(s) ahead!</div>
              <div className="text-sm semibold text-warning">Please proceed to clinic NOW</div>
            </>
          )}
          {inConsult && <div className="semibold mt-12">You are with the doctor now</div>}
          {completed && <div className="text-sm mt-12">Have a great day! See you next time.</div>}
          <div className="text-sm text-secondary mt-12">{doctor.name} · {formatTime(appointmentTime)}</div>
        </div>

        <div className="card">
          <div className="text-sm text-secondary semibold">Currently serving</div>
          <div className="row-between mt-8">
            <div className="bold text-primary-color" style={{ fontSize: 32 }}>#{currentToken}</div>
            <div className="text-sm text-secondary">{currentToken}/{totalTokens}</div>
          </div>
          <div className="progress-bar mt-12"><div style={{ width: `${totalTokens ? (currentToken / totalTokens) * 100 : 0}%` }} /></div>
          <div className="text-xs text-secondary mt-8">{completedCount} done · {waitingCount} waiting</div>
        </div>

        <LiveTokenBoard myToken={myToken} currentToken={currentToken} queue={queue} totalTokens={totalTokens} />
      </div>
    </div>
  );
}
