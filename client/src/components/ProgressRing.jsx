export function colorFor(percentage, target) {
  if (percentage >= target + 10) return 'var(--success)';
  if (percentage >= target) return 'var(--warning)';
  return 'var(--danger)';
}

export default function ProgressRing({ value, target = 75, size = 96, stroke = 10, label }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(value, 100) / 100);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="ring">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={colorFor(value, target)}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset .6s ease' }}
      />
      <text x="50%" y="50%" dy=".35em" textAnchor="middle" fill="currentColor" fontWeight="700" fontSize={size / 4.6}>
        {label ?? `${Math.round(value)}%`}
      </text>
    </svg>
  );
}
