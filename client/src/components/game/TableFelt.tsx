/**
 * TableFelt — top-down SVG of a real Free Bet Blackjack table.
 *
 * Matches the reference photo of a black-felt Free Bet table:
 *   - Black felt with subtle radial vignette
 *   - Top arc: "Dealer Must Hit Soft 17 And Push 22" in cream serif caps
 *   - Large bold "INSURANCE" title in gold under the arc
 *   - "PAYS 2 TO 1" smaller gold text below INSURANCE
 *   - Thin gold dashed insurance arc sweeping over the bet spots
 *   - 5 gold bet spots in a semicircle, each engraved "Push 22"
 *   - Semicircular chip rack at the dealer position (top)
 *   - Outer gold rail at the front
 */
export default function TableFelt() {
  const seatPositions: Array<{ x: number; y: number }> = [
    { x: 130, y: 425 },
    { x: 275, y: 380 },
    { x: 400, y: 365 },
    { x: 525, y: 380 },
    { x: 670, y: 425 },
  ];

  return (
    <svg
      viewBox="0 0 800 600"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Black felt with subtle warm-ish brown undertone (like a worn real table) */}
        <radialGradient id="feltBg" cx="50%" cy="42%" r="80%">
          <stop offset="0%" stopColor="#1a1510" />
          <stop offset="55%" stopColor="#0c0a08" />
          <stop offset="100%" stopColor="#020202" />
        </radialGradient>

        {/* Cream/ivory for the top arc and body copy */}
        <linearGradient id="creamText" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f5ead0" />
          <stop offset="100%" stopColor="#d9c896" />
        </linearGradient>

        {/* Warm gold gradient for the INSURANCE title and bet spots */}
        <linearGradient id="goldText" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f8d878" />
          <stop offset="50%" stopColor="#e5b94a" />
          <stop offset="100%" stopColor="#8c6316" />
        </linearGradient>

        {/* Outer gold rail */}
        <linearGradient id="goldRail" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f7d36b" />
          <stop offset="50%" stopColor="#b8862a" />
          <stop offset="100%" stopColor="#6e4d12" />
        </linearGradient>

        {/* Very subtle noise / weave */}
        <pattern id="feltNoise" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="transparent" />
          <circle cx="0.5" cy="0.5" r="0.25" fill="rgba(255,255,255,0.018)" />
          <circle cx="2.5" cy="2.5" r="0.25" fill="rgba(255,255,255,0.012)" />
        </pattern>

        {/* Bet spot radial — faint gold inner glow */}
        <radialGradient id="betSpot" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="rgba(245,210,122,0.14)" />
          <stop offset="80%" stopColor="rgba(245,210,122,0.03)" />
          <stop offset="100%" stopColor="rgba(245,210,122,0)" />
        </radialGradient>

        {/* Curved paths for textPath */}
        <path id="topArcPath" d="M 80,150 Q 400,30 720,150" />
        <path id="insuranceArcPath" d="M 90,310 Q 400,230 710,310" />
      </defs>

      {/* === Background === */}
      <rect width="800" height="600" fill="url(#feltBg)" />
      <rect width="800" height="600" fill="url(#feltNoise)" />

      {/* === Outer gold rail (front curved edge) === */}
      <path
        d="M 0,600 L 0,170 Q 400,40 800,170 L 800,600 Z"
        fill="none"
        stroke="url(#goldRail)"
        strokeWidth="6"
      />
      <path
        d="M 12,600 L 12,178 Q 400,52 788,178 L 788,600"
        fill="none"
        stroke="rgba(245,210,122,0.22)"
        strokeWidth="1"
      />

      {/* === Semicircular chip rack at top center (dealer position) === */}
      <g transform="translate(400, 90)">
        <path
          d="M -150,0 A 150,36 0 0 1 150,0"
          fill="rgba(0,0,0,0.7)"
          stroke="url(#goldRail)"
          strokeWidth="1.4"
        />
        {/* Chip slots with colored chips */}
        {Array.from({ length: 9 }).map((_, i) => {
          const t = (i / 8) * Math.PI;
          const cx = Math.cos(Math.PI - t) * 128;
          const cy = -Math.sin(t) * 14;
          const colors = ['#cf2a2a', '#1f7a3a', '#2b6dbf', '#111', '#cf2a2a', '#e8c158', '#1f7a3a', '#2b6dbf', '#111'];
          return (
            <g key={i}>
              <ellipse
                cx={cx}
                cy={cy}
                rx="10"
                ry="3.6"
                fill={colors[i]}
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="0.4"
              />
              <ellipse
                cx={cx}
                cy={cy - 0.8}
                rx="10"
                ry="3.2"
                fill="none"
                stroke="rgba(0,0,0,0.4)"
                strokeWidth="0.5"
              />
            </g>
          );
        })}
      </g>

      {/* === Curved top text: Dealer Must Hit Soft 17 And Push 22 === */}
      <text
        fill="url(#creamText)"
        fontFamily="'Cinzel','Trajan Pro','Times New Roman',serif"
        fontSize="22"
        fontWeight="600"
        letterSpacing="3"
        fontStyle="italic"
      >
        <textPath href="#topArcPath" textAnchor="middle" startOffset="50%">
          Dealer Must Hit Soft 17 And Push 22
        </textPath>
      </text>

      {/* === Big bold INSURANCE title === */}
      <text
        x="400"
        y="215"
        fill="url(#goldText)"
        fontFamily="'Cinzel','Trajan Pro','Times New Roman',serif"
        fontSize="54"
        fontWeight="900"
        textAnchor="middle"
        letterSpacing="6"
        style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.9))' }}
      >
        INSURANCE
      </text>

      {/* === PAYS 2 TO 1 subtitle === */}
      <text
        x="400"
        y="245"
        fill="url(#goldText)"
        fontFamily="'Cinzel','Trajan Pro','Times New Roman',serif"
        fontSize="19"
        fontWeight="700"
        textAnchor="middle"
        letterSpacing="5"
      >
        PAYS 2 TO 1
      </text>

      {/* === Curved insurance dashed arc over the bet spots === */}
      <path
        d="M 85,305 Q 400,225 715,305"
        fill="none"
        stroke="rgba(245,210,122,0.6)"
        strokeWidth="1.6"
        strokeDasharray="7,5"
      />
      <path
        d="M 85,308 Q 400,228 715,308"
        fill="none"
        stroke="rgba(245,210,122,0.25)"
        strokeWidth="0.8"
      />

      {/* === BET SPOTS === */}
      {seatPositions.map((p, i) => (
        <g key={i} transform={`translate(${p.x}, ${p.y})`}>
          {/* Soft gold glow */}
          <circle cx="0" cy="0" r="46" fill="url(#betSpot)" />
          {/* Outer ring */}
          <circle
            cx="0"
            cy="0"
            r="38"
            fill="none"
            stroke="url(#goldText)"
            strokeWidth="2.4"
          />
          {/* Inner thin ring */}
          <circle
            cx="0"
            cy="0"
            r="33"
            fill="none"
            stroke="rgba(245,210,122,0.35)"
            strokeWidth="0.7"
          />
          {/* "Push 22" engraving — italic, matches the reference */}
          <text
            x="0"
            y="4"
            fill="url(#goldText)"
            fontFamily="'Cinzel','Times New Roman',serif"
            fontSize="13"
            fontStyle="italic"
            fontWeight="700"
            textAnchor="middle"
            letterSpacing="1.2"
          >
            Push 22
          </text>
        </g>
      ))}

      {/* === Corner flourishes (subtle, just a hint of trim) === */}
      {[
        { x: 40, y: 560, flip: 1 },
        { x: 760, y: 560, flip: -1 },
      ].map((f, i) => (
        <g
          key={i}
          transform={`translate(${f.x}, ${f.y}) scale(${f.flip}, 1)`}
          fill="none"
          stroke="url(#goldText)"
          strokeWidth="1"
          opacity="0.55"
        >
          <path d="M 0,0 C 8,-12 22,-14 28,-4 C 22,-8 12,-6 6,2 Z" />
          <path d="M 4,-2 C 14,-18 30,-18 32,-6" />
          <circle cx="20" cy="-10" r="1.2" fill="url(#goldText)" stroke="none" />
        </g>
      ))}
    </svg>
  );
}
