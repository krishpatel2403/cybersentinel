import { TrendingDown, TrendingUp } from "lucide-react";
import type { ScorePoint } from "@/lib/risk";

const shortDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const width = 720;
const height = 240;
const padding = { left: 34, right: 12, top: 18, bottom: 30 };

export function TrendChart({ points }: { points: ScorePoint[] }) {
  if (points.length === 0) {
    return <div className="skeleton h-48" aria-hidden="true" />;
  }

  const scores = points.map((point) => point.securityScore);
  const rawMin = Math.min(...scores);
  const rawMax = Math.max(...scores);
  const min = Math.max(0, Math.min(rawMin - 8, rawMax - 20));
  const max = Math.min(100, Math.max(rawMax + 8, rawMin + 20));
  const range = Math.max(1, max - min);
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const stepX = innerWidth / Math.max(1, points.length - 1);

  const coords = points.map((point, index) => ({
    x: padding.left + index * stepX,
    y: padding.top + innerHeight - ((point.securityScore - min) / range) * innerHeight,
    score: point.securityScore,
    date: point.date,
  }));

  const linePath = coords
    .map(
      (coordinate, index) =>
        `${index === 0 ? "M" : "L"} ${coordinate.x.toFixed(1)} ${coordinate.y.toFixed(1)}`,
    )
    .join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1]?.x.toFixed(1) ?? 0} ${padding.top + innerHeight} L ${coords[0]?.x.toFixed(1) ?? 0} ${padding.top + innerHeight} Z`;

  const ticks = Array.from({ length: 4 }, (_, index) => {
    const value = Math.round(min + (range * index) / 3);
    const y = padding.top + innerHeight - ((value - min) / range) * innerHeight;
    return { value, y };
  });

  const first = points[0]?.securityScore ?? 0;
  const last = points[points.length - 1]?.securityScore ?? 0;
  const delta = last - first;
  const lastPoint = coords[coords.length - 1];

  return (
    <section className="surface flex h-full flex-col p-5" aria-labelledby="trend-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
            Posture movement
          </p>
          <h2 id="trend-heading" className="mt-0.5 text-sm font-semibold text-slate-100">
            14-day security score
          </h2>
        </div>
        <div
          className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
            delta >= 0
              ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-200"
              : "border-rose-400/20 bg-rose-400/[0.07] text-rose-200"
          }`}
        >
          {delta >= 0 ? (
            <TrendingUp className="size-3" aria-hidden="true" />
          ) : (
            <TrendingDown className="size-3" aria-hidden="true" />
          )}
          {delta >= 0 ? "+" : ""}
          {delta} pts
        </div>
      </div>

      <div className="mt-3 flex-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full"
          role="img"
          aria-label={`Security score trend over ${points.length} days, from ${first} to ${last}`}
        >
          <title>Security score trend</title>
          <defs>
            <linearGradient id="trend-area-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="trend-line-stroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>

          {ticks.map((tick) => (
            <g key={tick.value}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={tick.y}
                y2={tick.y}
                stroke="rgba(148,163,184,0.1)"
                strokeDasharray="3 5"
              />
              <text
                x={padding.left - 8}
                y={tick.y + 3}
                textAnchor="end"
                fill="rgba(148,163,184,0.55)"
                fontSize="9"
                fontFamily="var(--font-geist-mono)"
              >
                {tick.value}
              </text>
            </g>
          ))}

          <path d={areaPath} fill="url(#trend-area-fill)" />
          <path
            d={linePath}
            fill="none"
            stroke="url(#trend-line-stroke)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {coords.map((coordinate) => (
            <circle
              key={coordinate.date}
              cx={coordinate.x}
              cy={coordinate.y}
              r="2.5"
              fill="#0a1220"
              stroke="#67e8f9"
              strokeWidth="1.5"
            >
              <title>{`${shortDate.format(new Date(coordinate.date))}: ${coordinate.score}/100`}</title>
            </circle>
          ))}

          {lastPoint ? (
            <circle cx={lastPoint.x} cy={lastPoint.y} r="4.5" fill="#22d3ee" opacity="0.25">
              <title>{`Latest score: ${lastPoint.score}/100`}</title>
            </circle>
          ) : null}
          {lastPoint ? <circle cx={lastPoint.x} cy={lastPoint.y} r="2.5" fill="#a5f3fc" /> : null}

          {[0, Math.floor(points.length / 2), points.length - 1].map((index) => {
            const point = points[index];
            const coordinate = coords[index];
            if (!point || !coordinate) return null;
            return (
              <text
                key={`label-${point.date}`}
                x={coordinate.x}
                y={height - 8}
                textAnchor={index === 0 ? "start" : index === points.length - 1 ? "end" : "middle"}
                fill="rgba(148,163,184,0.55)"
                fontSize="9"
                fontFamily="var(--font-geist-mono)"
              >
                {shortDate.format(new Date(point.date))}
              </text>
            );
          })}
        </svg>
      </div>
      <p className="mt-1 text-[10px] leading-4 text-slate-600">
        Historical points are reconstructed from finding creation and resolution dates. Status
        changes before this MVP are approximated, not event-sourced.
      </p>
    </section>
  );
}
