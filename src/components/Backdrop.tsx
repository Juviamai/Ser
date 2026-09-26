/**
 * Decorative backdrop — dreamy floral corners, bokeh and ✦ sparkles
 * drawn in SVG so the "gentle luxury" mood survives on every screen.
 * Purely presentational: aria-hidden, pointer-events-none, fixed behind content.
 */

function ForgetMeNot({
  x,
  y,
  size,
  rotate = 0,
  opacity = 0.75,
}: {
  x: number;
  y: number;
  size: number;
  rotate?: number;
  opacity?: number;
}) {
  // five-petaled bloom — periwinkle blue with a soft center
  const petals = [0, 72, 144, 216, 288].map((a) => a + rotate);
  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      {petals.map((a, i) => (
        <ellipse
          key={i}
          cx={0}
          cy={-size * 0.52}
          rx={size * 0.34}
          ry={size * 0.5}
          transform={`rotate(${a})`}
          fill="url(#petal)"
        />
      ))}
      <circle r={size * 0.22} fill="#f6e6b8" opacity={0.95} />
      <circle r={size * 0.1} fill="#e8c97e" opacity={0.9} />
    </g>
  );
}

export default function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <svg className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900">
        <defs>
          <radialGradient id="petal" cx="50%" cy="35%" r="75%">
            <stop offset="0%" stopColor="#b9c4f2" />
            <stop offset="70%" stopColor="#8b97e8" />
            <stop offset="100%" stopColor="#6f7fd4" stopOpacity="0.85" />
          </radialGradient>
          <radialGradient id="bokeh" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="55%" stopColor="#cfe3f5" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#cfe3f5" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* bokeh field */}
        <circle cx="180" cy="720" r="90" fill="url(#bokeh)" />
        <circle cx="1330" cy="640" r="120" fill="url(#bokeh)" />
        <circle cx="1210" cy="150" r="70" fill="url(#bokeh)" />
        <circle cx="420" cy="120" r="55" fill="url(#bokeh)" />

        {/* top-left floral corner */}
        <g className="float-soft">
          <ForgetMeNot x={36} y={92} size={30} rotate={12} opacity={0.8} />
          <ForgetMeNot x={94} y={52} size={20} rotate={-20} opacity={0.6} />
          <ForgetMeNot x={128} y={110} size={16} rotate={40} opacity={0.5} />
        </g>

        {/* bottom-right floral corner */}
        <g className="float-soft" style={{ animationDelay: "1.6s" }}>
          <ForgetMeNot x={1392} y={806} size={34} rotate={-8} opacity={0.8} />
          <ForgetMeNot x={1330} y={862} size={22} rotate={24} opacity={0.6} />
          <ForgetMeNot x={1418} y={742} size={15} rotate={-40} opacity={0.5} />
        </g>

        {/* scattered petals */}
        <ellipse cx="260" cy="640" rx="7" ry="12" fill="#9fb0ea" opacity="0.35" transform="rotate(24 260 640)" />
        <ellipse cx="1180" cy="330" rx="6" ry="10" fill="#9fb0ea" opacity="0.3" transform="rotate(-30 1180 330)" />
        <ellipse cx="720" cy="840" rx="8" ry="13" fill="#8b97e8" opacity="0.25" transform="rotate(12 720 840)" />
        <ellipse cx="540" cy="70" rx="5" ry="9" fill="#8b97e8" opacity="0.3" transform="rotate(-15 540 70)" />

        {/* ✦ sparkles */}
        <text x="216" y="180" fontSize="13" fill="#8b97e8" opacity="0.55">✦</text>
        <text x="1270" y="240" fontSize="10" fill="#8b97e8" opacity="0.5">✦</text>
        <text x="90" y="560" fontSize="9" fill="#8b97e8" opacity="0.4">✦</text>
        <text x="1350" y="560" fontSize="12" fill="#8b97e8" opacity="0.5">✦</text>
        <text x="620" y="90" fontSize="9" fill="#8b97e8" opacity="0.4">✦</text>
        <text x="980" y="860" fontSize="10" fill="#8b97e8" opacity="0.45">✦</text>
      </svg>
    </div>
  );
}
