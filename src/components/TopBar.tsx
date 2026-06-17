import { ArrowLeft } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function TopBar({ title, back = true, right }: { title: string; back?: boolean; right?: ReactNode }) {
  const router = useRouter();
  return (
    <div className="top-bar">
      {back && (
        <button className="back-btn" onClick={() => router.history.back()} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
      )}
      <h1>{title}</h1>
      {right}
    </div>
  );
}
