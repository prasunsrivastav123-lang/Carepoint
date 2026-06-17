import { useEffect, useRef, useState } from "react";

export function OTPInput({ length = 6, onComplete, error }: { length?: number; onComplete: (v: string) => void; error?: boolean }) {
  const [vals, setVals] = useState<string[]>(Array(length).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { refs.current[0]?.focus(); }, []);

  const setAt = (i: number, v: string) => {
    const next = [...vals];
    next[i] = v;
    setVals(next);
    if (next.every(x => x !== "")) onComplete(next.join(""));
  };

  return (
    <div className={`otp-row ${error ? "shake" : ""}`}>
      {vals.map((v, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          className={`otp-box ${error ? "error" : ""}`}
          inputMode="numeric"
          maxLength={1}
          value={v}
          onChange={e => {
            const ch = e.target.value.replace(/\D/g, "").slice(-1);
            if (!ch) return;
            setAt(i, ch);
            if (i < length - 1) refs.current[i + 1]?.focus();
          }}
          onKeyDown={e => {
            if (e.key === "Backspace") {
              if (vals[i]) setAt(i, "");
              else if (i > 0) { refs.current[i - 1]?.focus(); setAt(i - 1, ""); }
            }
          }}
          onPaste={e => {
            const txt = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
            if (!txt) return;
            e.preventDefault();
            const next = Array(length).fill("");
            for (let k = 0; k < txt.length; k++) next[k] = txt[k];
            setVals(next);
            if (next.every(x => x !== "")) onComplete(next.join(""));
            else refs.current[txt.length]?.focus();
          }}
        />
      ))}
    </div>
  );
}
