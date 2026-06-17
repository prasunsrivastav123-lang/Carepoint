import type { ReactNode } from "react";

export function BottomSheet({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: ReactNode }) {
  if (!isOpen) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
        zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="slide-up"
        style={{
          background: "white", width: "100%", maxWidth: 430,
          borderTopLeftRadius: 20, borderTopRightRadius: 20,
          padding: 20, minHeight: 200,
        }}
      >
        <div style={{ width: 40, height: 4, background: "#ddd", borderRadius: 2, margin: "0 auto 16px" }} />
        {children}
      </div>
    </div>
  );
}
