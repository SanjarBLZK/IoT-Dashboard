import { RackStatus } from "../types";

interface StatusDotProps {
  status: RackStatus;
}

export function StatusDot({ status }: StatusDotProps) {
  const colors: Record<RackStatus, string> = {
    ok: "bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.6)]",
    warn: "bg-amber-400 shadow-[0_0_8px_2px_rgba(251,191,36,0.6)]",
    critical: "bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.7)] animate-pulse",
  };

  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full ${colors[status]}`}
      aria-label={`Status: ${status}`}
    />
  );
}
