interface TempArcProps {
  temp: number;
}

export function TempArc({ temp }: TempArcProps) {
  const max = 45; // Maximum temperatuur voor schaal
  const pct = Math.min(temp / max, 1); // Percentage van max
  const radius = 36;
  const circ = 2 * Math.PI * radius; // Volledige cirkel omtrek
  const arcLen = circ * 0.75; // 270° arc (3/4 van cirkel)
  const dashOffset = arcLen - pct * arcLen; // Hoeveel van arc invullen

  // Kleur bepalen op basis van temperatuur
  const color =
    temp >= 35 ? "#ef4444" : // Rood bij critical
    temp >= 28 ? "#f59e0b" : // Oranje bij warning
    "#34d399"; // Groen bij ok

  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="flex-shrink-0">
      {/* Achtergrond cirkel (grijs) */}
      <circle
        cx="48"
        cy="48"
        r={radius}
        fill="none"
        stroke="#1e293b"
        strokeWidth="8"
        strokeDasharray={`${arcLen} ${circ}`}
        transform="rotate(135 48 48)"
      />
      {/* Voorgrond cirkel (gekleurd, geanimeerd) */}
      <circle
        cx="48"
        cy="48"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeDasharray={`${arcLen} ${circ}`}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform="rotate(135 48 48)"
        style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.4s ease" }}
      />
      {/* Temperatuur tekst */}
      <text
        x="48"
        y="44"
        textAnchor="middle"
        fill={color}
        fontSize="16"
        fontWeight="600"
      >
        {temp.toFixed(1)}
      </text>
      <text x="48" y="60" textAnchor="middle" fill="#64748b" fontSize="9">
        °C
      </text>
    </svg>
  );
}
