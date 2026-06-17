import { useEffect, useState } from "react";
import { mockApi } from "../lib/mockData";

export function useTokenTracker(appointmentId: string) {
  const [data, setData] = useState<Awaited<ReturnType<typeof mockApi.getMyToken>> | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const fetch = async () => {
      try {
        const d = await mockApi.getMyToken(appointmentId);
        if (alive) { setData(d); setLoading(false); }
      } catch { if (alive) setLoading(false); }
    };
    fetch();
    const t = setInterval(fetch, 10000); // poll every 10s (mock for socket)
    return () => { alive = false; clearInterval(t); };
  }, [appointmentId]);

  return { data, isLoading, refetch: () => mockApi.getMyToken(appointmentId).then(setData) };
}
