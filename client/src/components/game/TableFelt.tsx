export default function TableFelt() {
  return (
    <svg
      viewBox="0 0 800 600"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Felt texture gradient */}
        <radialGradient id="feltBg" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#1a3a2a" />
          <stop offset="50%" stopColor="#0f2a1e" />
          <stop offset="100%" stopColor="#081a12" />
        </radialGradient>
        {/* Gold text color */}
        <linearGradient id="goldText" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e6c44d" />
          <stop offset="50%" stopColor="#c9a84c" />
          <stop offset="100%" stopColor="#a07830" />
        </linearGradient>
        {/* Gold border */}
        <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4af37" />
          <stop offset="50%" stopColor="#b8942e" />
          <stop offset="100%" stopColor="#d4af37" />
        </linearGradient>
      </defs>

      {/* Background felt */}
      <rect width="800" height="600" fill="url(#feltBg)" />

      {/* Subtle felt texture pattern */}
      <pattern id="feltPattern" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
        <rect width="4" height="4" fill="transparent" />
        <circle cx="1" cy="1" r="0.3" fill="rgba(255,255,255,0.02)" />
        <circle cx="3" cy="3" r="0.3" fill="rgba(0,0,0,0.03)" />
      </pattern>
      <rect width="800" height="600" fill="url(#feltPattern)" />

      {/* ===== TOP ARC - Gold border ===== */}
      <path
        d="M 50,0 Q 400,-20 750,0 L 720,8 Q 400,-10 80,8 Z"
        fill="url(#goldBorder)"
      />

      {/* ===== CURVED TEXT - Dealer Must Hit Soft 17 ===== */}
      <path id="topArc" d="M 120,65 Q 400,15 680,65" fill="none" />
      <text fill="url(#goldText)" fontSize="14" fontWeight="bold" letterSpacing="1">
        <textPath href="#topArc" textAnchor="middle" startOffset="50%">
          Dealer Must Hit Soft 17 and Push with a Total of 22
        </textPath>
      </text>

      {/* ===== PAYS 2 to 1 - Left side ===== */}
      <text x="65" y="50" fill="url(#goldText)" fontSize="11" fontWeight="bold" textAnchor="middle" letterSpacing="0.5">PAYS</text>
      <text x="65" y="70" fill="url(#goldText)" fontSize="18" fontWeight="bold" textAnchor="middle">2 to 1</text>

      {/* ===== PAYS 2 to 1 - Right side ===== */}
      <text x="735" y="50" fill="url(#goldText)" fontSize="11" fontWeight="bold" textAnchor="middle" letterSpacing="0.5">PAYS</text>
      <text x="735" y="70" fill="url(#goldText)" fontSize="18" fontWeight="bold" textAnchor="middle">2 to 1</text>

      {/* ===== INSURANCE LINE ===== */}
      <path id="insuranceCurve" d="M 100,110 Q 400,80 700,110" fill="none" stroke="url(#goldText)" strokeWidth="1.5" strokeDasharray="8,4" />
      <text fill="url(#goldText)" fontSize="20" fontWeight="bold" letterSpacing="4">
        <textPath href="#insuranceCurve" textAnchor="middle" startOffset="50%">
          INSURANCE
        </textPath>
      </text>

      {/* ===== PUSH 22 circles - Left ===== */}
      <g transform="translate(60, 150)">
        <circle cx="0" cy="0" r="28" fill="none" stroke="url(#goldText)" strokeWidth="1.5" />
        <text x="0" y="-8" fill="url(#goldText)" fontSize="7" fontWeight="bold" textAnchor="middle">PAYS 11 TO 1</text>
        <text x="0" y="4" fill="url(#goldText)" fontSize="10" fontWeight="bold" textAnchor="middle">PUSH</text>
        <text x="0" y="18" fill="url(#goldText)" fontSize="16" fontWeight="bold" textAnchor="middle">22</text>
      </g>

      {/* ===== PUSH 22 circles - Right ===== */}
      <g transform="translate(740, 150)">
        <circle cx="0" cy="0" r="28" fill="none" stroke="url(#goldText)" strokeWidth="1.5" />
        <text x="0" y="-8" fill="url(#goldText)" fontSize="7" fontWeight="bold" textAnchor="middle">PAYS 11 TO 1</text>
        <text x="0" y="4" fill="url(#goldText)" fontSize="10" fontWeight="bold" textAnchor="middle">PUSH</text>
        <text x="0" y="18" fill="url(#goldText)" fontSize="16" fontWeight="bold" textAnchor="middle">22</text>
      </g>

      {/* ===== BET CIRCLES - 5 positions in semicircle ===== */}
      {/* Position 1 - Far left */}
      <g transform="translate(120, 320)">
        <circle cx="0" cy="0" r="35" fill="none" stroke="url(#goldText)" strokeWidth="2" />
        <circle cx="0" cy="0" r="30" fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="0.5" />
      </g>

      {/* Position 2 - Left */}
      <g transform="translate(260, 260)">
        <circle cx="0" cy="0" r="35" fill="none" stroke="url(#goldText)" strokeWidth="2" />
        <circle cx="0" cy="0" r="30" fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="0.5" />
      </g>

      {/* Position 3 - Center */}
      <g transform="translate(400, 240)">
        <circle cx="0" cy="0" r="35" fill="none" stroke="url(#goldText)" strokeWidth="2" />
        <circle cx="0" cy="0" r="30" fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="0.5" />
      </g>

      {/* Position 4 - Right */}
      <g transform="translate(540, 260)">
        <circle cx="0" cy="0" r="35" fill="none" stroke="url(#goldText)" strokeWidth="2" />
        <circle cx="0" cy="0" r="30" fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="0.5" />
      </g>

      {/* Position 5 - Far right */}
      <g transform="translate(680, 320)">
        <circle cx="0" cy="0" r="35" fill="none" stroke="url(#goldText)" strokeWidth="2" />
        <circle cx="0" cy="0" r="30" fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="0.5" />
      </g>

      {/* ===== POT OF GOLD markers ===== */}
      {[
        [120, 370], [260, 310], [400, 290], [540, 310], [680, 370]
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x}, ${y})`}>
          <rect x="-22" y="-8" width="44" height="16" rx="4" fill="#6B4F10" stroke="#d4af37" strokeWidth="0.8" />
          <text x="0" y="4" fill="#ffd700" fontSize="6" fontWeight="bold" textAnchor="middle" letterSpacing="0.5">POT OF GOLD</text>
        </g>
      ))}

      {/* ===== FREE BETS PAYTABLE - Position 2 ===== */}
      <g transform="translate(180, 410)">
        <text x="0" y="0" fill="rgba(201,168,76,0.6)" fontSize="8" fontWeight="bold" letterSpacing="1">Free Bets</text>
        <text x="80" y="0" fill="rgba(201,168,76,0.6)" fontSize="8" fontWeight="bold">POG</text>
        {[
          ['7', '100 to 1'],
          ['6', '100 to 1'],
          ['5', '100 to 1'],
          ['4', '50 to 1'],
          ['3', '30 to 1'],
          ['2', '12 to 1'],
          ['1', '3 to 1'],
        ].map(([num, payout], i) => (
          <g key={i}>
            <text x="8" y={14 + i * 11} fill="rgba(201,168,76,0.4)" fontSize="7">{num}</text>
            <line x1="18" y1={11 + i * 11} x2="70" y2={11 + i * 11} stroke="rgba(201,168,76,0.2)" strokeWidth="0.5" strokeDasharray="2,2" />
            <text x="72" y={14 + i * 11} fill="rgba(201,168,76,0.4)" fontSize="7">{payout}</text>
          </g>
        ))}
      </g>

      {/* ===== FREE BETS PAYTABLE - Position 4 ===== */}
      <g transform="translate(520, 410)">
        <text x="0" y="0" fill="rgba(201,168,76,0.6)" fontSize="8" fontWeight="bold" letterSpacing="1">Free Bets</text>
        <text x="80" y="0" fill="rgba(201,168,76,0.6)" fontSize="8" fontWeight="bold">POG</text>
        {[
          ['7', '100 to 1'],
          ['6', '100 to 1'],
          ['5', '100 to 1'],
          ['4', '50 to 1'],
          ['3', '30 to 1'],
          ['2', '12 to 1'],
          ['1', '3 to 1'],
        ].map(([num, payout], i) => (
          <g key={i}>
            <text x="8" y={14 + i * 11} fill="rgba(201,168,76,0.4)" fontSize="7">{num}</text>
            <line x1="18" y1={11 + i * 11} x2="70" y2={11 + i * 11} stroke="rgba(201,168,76,0.2)" strokeWidth="0.5" strokeDasharray="2,2" />
            <text x="72" y={14 + i * 11} fill="rgba(201,168,76,0.4)" fontSize="7">{payout}</text>
          </g>
        ))}
      </g>

      {/* ===== Table edge - curved bottom ===== */}
      <path
        d="M 0,600 L 0,100 Q 400,40 800,100 L 800,600 Z"
        fill="none"
        stroke="url(#goldBorder)"
        strokeWidth="3"
      />

      {/* Inner edge line */}
      <path
        d="M 8,595 L 8,105 Q 400,48 792,105 L 792,595"
        fill="none"
        stroke="rgba(201,168,76,0.2)"
        strokeWidth="1"
      />
    </svg>
  );
}
