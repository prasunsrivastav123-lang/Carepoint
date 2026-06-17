import { useState } from "react";
import { formatTime } from "./TimeSlotGrid";

type QueueRow = { tokenNumber: number; status: string; appointmentTime: string; estimatedWaitMinutes: number; isCurrentToken: boolean };

export function LiveTokenBoard({ myToken, currentToken, queue, totalTokens }: {
  myToken: number; currentToken: number; queue: QueueRow[]; totalTokens: number;
}) {
  const [showAll, setShowAll] = useState(false);
  let visible = queue;
  if (!showAll) {
    const myIdx = queue.findIndex(q => q.tokenNumber === myToken);
    const start = Math.max(0, myIdx - 2);
    visible = queue.slice(start, start + 7);
  }
  return (
    <div className="card">
      <div className="row-between mb-12">
        <div className="semibold">Queue Status</div>
        <span className="text-xs text-secondary">{totalTokens} total</span>
      </div>
      {visible.map(q => {
        const isMine = q.tokenNumber === myToken;
        const isCurrent = q.tokenNumber === currentToken;
        const done = q.tokenNumber < currentToken;
        const cls = isMine ? "mine" : isCurrent ? "current" : done ? "done" : "";
        const statusLabel =
          q.status === "completed" ? "✅ Done" :
          q.status === "in_consultation" ? "🩺 With Doctor" :
          q.status === "cancelled" ? "✕ Cancelled" :
          `⏳ ~${q.estimatedWaitMinutes} min`;
        return (
          <div key={q.tokenNumber} className={`queue-row ${cls}`}>
            <div className="tnum">#{q.tokenNumber}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{statusLabel}</div>
              <div className="text-xs text-secondary">{formatTime(q.appointmentTime)}</div>
            </div>
            {isMine && <span className="pill orange">YOU</span>}
          </div>
        );
      })}
      {queue.length > 7 && (
        <button onClick={() => setShowAll(s => !s)} style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 600, marginTop: 8, cursor: "pointer", fontSize: 13 }}>
          {showAll ? "Show fewer" : `Show all ${queue.length} tokens`}
        </button>
      )}
    </div>
  );
}
