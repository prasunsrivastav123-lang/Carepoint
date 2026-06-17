export function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      border: "3px solid #E8ECF0", borderTopColor: "var(--primary)",
      animation: "spin 0.7s linear infinite",
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function SkeletonCard({ count = 3 }: { count?: number }) {
  return <>{Array.from({ length: count }).map((_, i) => <div key={i} className="skeleton" />)}</>;
}
