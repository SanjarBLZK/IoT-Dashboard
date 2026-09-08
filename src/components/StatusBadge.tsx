import { RackStatus } from "../types";

interface StatusBadgeProps {
  status: RackStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<RackStatus, { bg: string; text: string; label: string }> = {
    ok: {
      bg: "bg-emerald-500/20",
      text: "text-emerald-400",
      label: "Normaal",
    },
    warn: {
      bg: "bg-amber-500/20",
      text: "text-amber-400",
      label: "Waarschuwing",
    },
    critical: {
      bg: "bg-red-500/20",
      text: "text-red-400",
      label: "Kritiek",
    },
  };

  const style = styles[status];

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
    >
      {style.label}
    </span>
  );
}
