/**
 * TableFelt — SVG replica of the green Free Bet Blackjack table from the reference photo.
 *
 * Features:
 *   - Dark green felt with radial vignette
 *   - Gold banner arc: "Dealer Must Hit Soft 17 And Will Push With a Total of 22"
 *   - BLACKJACK PAYS 3 TO 2 on the banner
 *   - INSURANCE curved text with PAYS 2 TO 1
 *   - 5 gold rectangular bet pads in semicircle
 *   - POT OF GOLD medallions next to each bet pad
 *   - FREE DOUBLES / FREE SPLITS text in center
 *   - POT OF GOLD PAYTABLE on both sides
 *   - Chip rack at top
 *   - Black leather rail around edge
 */
export default function TableFelt() {
  // Bet pad positions (center of each gold rectangle)
  const pads: Array<{ x: number; y: number; rot: number }> = [
    { x: 115, y: 370, rot: 25 },
    { x: 255, y: 310, rot: 12 },
    { x: 400, y: 285, rot: 0 },
    { x: 545, y: 310, rot: -12 },
    { x: 685, y: 370, rot: -25 },
  ];

  return (
    <svg
      viewBox="0 0 800 600"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="feltBg" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#1a6b3a" />
          <stop offset="40%" stopColor="#125a2e" />
          <stop offset="80%" stopColor="#0a4520" />
          <stop offset="100%" stopColor="#063418" />
        </radialGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f0d060" />
          <stop offset="40%" stopColor="#c9a030" />
          <stop offset="100%" stopColor="#8a6a18" />
        </linearGradient>
        <linearGradient id="bannerGold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e8c858" />
          <stop offset="30%" stopColor="#d4aa38" />
          <stop offset="70%" stopColor="#b8922a" />
          <stop offset="100%" stopColor="#8a6a18" />
        </linearGradient>
        <linearGradient id="padGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4b048" />
          <stop offset="50%" stopColor="#c49a30" />
          <stop offset="100%" stopColor="#a07820" />
        </linearGradient>
        <linearGradient id="leatherRail" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2a2a2a" />
          <stop offset="50%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#0a0a0a" />
        </linearGradient>
        <path id="topArc" d="M 100,130 Q 400,50 700,130" />
        <path id="insuranceArc" d="M 100,195 Q 400,145 700,195" />
        <pattern id="feltWeave" width="3" height="3" patternUnits="userSpaceOnUse">
          <rect width="3" height="3" fill="transparent" />
          <circle cx="1.5" cy="1.5" r="0.3" fill="rgba(0,0,0,0.04)" />
        </pattern>
      </defs>

      {/* === Black leather rail (outer border) === */}
      <path d="M 0,600 L 0,140 Q 400,20 800,140 L 800,600 Z" fill="url(#leatherRail)" />
      <path d="M 0,600 L 0,140 Q 400,20 800,140 L 800,600 Z" fill="none" stroke="#444" strokeWidth="1" />

      {/* === Green felt area (inside the rail) === */}
      <path d="M 14,596 L 14,148 Q 400,34 786,148 L 786,596 Z" fill="url(#feltBg)" />
      <path d="M 14,596 L 14,148 Q 400,34 786,148 L 786,596 Z" fill="url(#feltWeave)" />

      {/* === Inner gold trim line === */}
      <path d="M 22,592 L 22,154 Q 400,42 778,154 L 778,592" fill="none" stroke="rgba(200,168,60,0.25)" strokeWidth="1.2" />

      {/* === Chip rack at top === */}
      <g transform="translate(400, 72)">
        <path d="M -120,0 A 120,28 0 0 1 120,0" fill="rgba(0,0,0,0.6)" stroke="#555" strokeWidth="1" />
        {Array.from({ length: 7 }).map((_, i) => {
          const t = (i / 6) * Math.PI;
          const cx = Math.cos(Math.PI - t) * 100;
          const cy = -Math.sin(t) * 12;
          const colors = ['#cf2a2a', '#1f7a3a', '#2b6dbf', '#111', '#cf2a2a', '#e8c158', '#9b59b6'];
          return (
            <g key={i}>
              <ellipse cx={cx} cy={cy} rx="9" ry="3.2" fill={colors[i]} stroke="rgba(255,255,255,0.3)" strokeWidth="0.4" />
              <ellipse cx={cx} cy={cy - 2} rx="9" ry="3.2" fill={colors[i]} stroke="rgba(255,255,255,0.2)" strokeWidth="0.3" opacity="0.7" />
            </g>
          );
        })}
      </g>

      {/* === Gold banner arc === */}
      <path d="M 80,140 Q 400,72 720,140 L 700,148 Q 400,84 100,148 Z" fill="url(#bannerGold)" stroke="#8a6a18" strokeWidth="0.5" />
      {/* Banner shadow */}
      <path d="M 100,148 Q 400,84 700,148" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="2" />

      {/* Banner text */}
      <text fill="#3a2510" fontFamily="'Times New Roman',serif" fontSize="10" fontWeight="bold" letterSpacing="0.5">
        <textPath href="#topArc" textAnchor="middle" startOffset="50%">
          Dealer Must Hit Soft 17 And Will Push With a Total of 22
        </textPath>
      </text>

      {/* BLACKJACK PAYS 3 TO 2 - on the banner */}
      <text x="400" y="120" fill="#3a2510" fontFamily="'Times New Roman',serif" fontSize="8" fontWeight="bold" textAnchor="middle" letterSpacing="1">
        BLACKJACK PAYS 3 TO 2
      </text>

      {/* === PAYS 2 TO 1 - Left === */}
      <g transform="translate(60, 165)">
        <text x="0" y="0" fill="url(#goldGrad)" fontFamily="'Times New Roman',serif" fontSize="9" fontWeight="bold" textAnchor="middle">PAYS</text>
        <text x="0" y="16" fill="url(#goldGrad)" fontFamily="'Times New Roman',serif" fontSize="16" fontWeight="bold" textAnchor="middle">2 TO 1</text>
      </g>

      {/* === PAYS 2 TO 1 - Right === */}
      <g transform="translate(740, 165)">
        <text x="0" y="0" fill="url(#goldGrad)" fontFamily="'Times New Roman',serif" fontSize="9" fontWeight="bold" textAnchor="middle">PAYS</text>
        <text x="0" y="16" fill="url(#goldGrad)" fontFamily="'Times New Roman',serif" fontSize="16" fontWeight="bold" textAnchor="middle">2 TO 1</text>
      </g>

      {/* === INSURANCE curved text === */}
      <text fill="url(#goldGrad)" fontFamily="'Times New Roman',serif" fontSize="24" fontWeight="bold" letterSpacing="4">
        <textPath href="#insuranceArc" textAnchor="middle" startOffset="50%">
          INSURANCE
        </textPath>
      </text>

      {/* Insurance dashed arc */}
      <path d="M 80,220 Q 400,170 720,220" fill="none" stroke="rgba(200,168,60,0.5)" strokeWidth="1.2" strokeDasharray="6,4" />

      {/* === FREE DOUBLES & FREE SPLITS - Center text === */}
      <g transform="translate(400, 250)">
        <text x="-50" y="0" fill="url(#goldGrad)" fontFamily="'Times New Roman',serif" fontSize="12" fontWeight="bold" textAnchor="middle">FREE</text>
        <text x="-50" y="13" fill="url(#goldGrad)" fontFamily="'Times New Roman',serif" fontSize="12" fontWeight="bold" textAnchor="middle">DOUBLES</text>
        <text x="-50" y="24" fill="rgba(200,168,60,0.5)" fontFamily="'Times New Roman',serif" fontSize="6" textAnchor="middle">On Any Two-Card</text>
        <text x="-50" y="31" fill="rgba(200,168,60,0.5)" fontFamily="'Times New Roman',serif" fontSize="6" textAnchor="middle">Hard Total of 9, 10 or 11</text>

        <text x="50" y="0" fill="url(#goldGrad)" fontFamily="'Times New Roman',serif" fontSize="12" fontWeight="bold" textAnchor="middle">FREE</text>
        <text x="50" y="13" fill="url(#goldGrad)" fontFamily="'Times New Roman',serif" fontSize="12" fontWeight="bold" textAnchor="middle">SPLITS</text>
        <text x="50" y="24" fill="rgba(200,168,60,0.5)" fontFamily="'Times New Roman',serif" fontSize="6" textAnchor="middle">On All Pairs Except</text>
        <text x="50" y="31" fill="rgba(200,168,60,0.5)" fontFamily="'Times New Roman',serif" fontSize="6" textAnchor="middle">10-Value Cards</text>
      </g>

      {/* === 5 Gold rectangular bet pads === */}
      {pads.map((p, i) => (
        <g key={i} transform={`translate(${p.x}, ${p.y}) rotate(${p.rot})`}>
          {/* Gold pad with rounded corners */}
          <rect x="-30" y="-22" width="60" height="44" rx="4" ry="4"
            fill="url(#padGold)" stroke="#8a6a18" strokeWidth="1.2" opacity="0.85" />
          {/* Inner border */}
          <rect x="-26" y="-18" width="52" height="36" rx="3" ry="3"
            fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        </g>
      ))}

      {/* === POT OF GOLD medallions === */}
      {pads.map((p, i) => {
        const offsetX = p.rot > 0 ? 48 : p.rot < 0 ? -48 : 0;
        const offsetY = p.rot === 0 ? 40 : 35;
        return (
          <g key={`pog-${i}`} transform={`translate(${p.x + offsetX}, ${p.y + offsetY})`}>
            <circle cx="0" cy="0" r="14" fill="#6B4F10" stroke="#d4af37" strokeWidth="1" />
            <text x="0" y="-2" fill="#ffd700" fontFamily="'Times New Roman',serif" fontSize="4" fontWeight="bold" textAnchor="middle">POT OF</text>
            <text x="0" y="5" fill="#ffd700" fontFamily="'Times New Roman',serif" fontSize="5" fontWeight="bold" textAnchor="middle">GOLD</text>
          </g>
        );
      })}

      {/* === POT OF GOLD PAYTABLE - Left side === */}
      <g transform="translate(55, 430)">
        <text x="0" y="0" fill="rgba(200,168,60,0.7)" fontFamily="'Times New Roman',serif" fontSize="7" fontWeight="bold" letterSpacing="0.5">POT OF GOLD PAYTABLE</text>
        <text x="0" y="10" fill="rgba(200,168,60,0.5)" fontFamily="'Times New Roman',serif" fontSize="5.5" fontWeight="bold">FREE BETS</text>
        <text x="85" y="10" fill="rgba(200,168,60,0.5)" fontFamily="'Times New Roman',serif" fontSize="5.5" fontWeight="bold">POT OF GOLD</text>
        {[['7', '100 to 1'], ['6', '100 to 1'], ['5', '100 to 1'], ['4', '50 to 1'], ['3', '30 to 1'], ['2', '12 to 1'], ['1', '3 to 1']].map(([n, p], j) => (
          <g key={j}>
            <text x="6" y={22 + j * 10} fill="rgba(200,168,60,0.45)" fontFamily="'Times New Roman',serif" fontSize="6">{n}</text>
            <line x1="14" y1={19 + j * 10} x2="78" y2={19 + j * 10} stroke="rgba(200,168,60,0.15)" strokeWidth="0.5" strokeDasharray="2,2" />
            <text x="80" y={22 + j * 10} fill="rgba(200,168,60,0.45)" fontFamily="'Times New Roman',serif" fontSize="6">{p}</text>
          </g>
        ))}
      </g>

      {/* === POT OF GOLD PAYTABLE - Right side === */}
      <g transform="translate(615, 430)">
        <text x="0" y="0" fill="rgba(200,168,60,0.7)" fontFamily="'Times New Roman',serif" fontSize="7" fontWeight="bold" letterSpacing="0.5">POT OF GOLD PAYTABLE</text>
        <text x="0" y="10" fill="rgba(200,168,60,0.5)" fontFamily="'Times New Roman',serif" fontSize="5.5" fontWeight="bold">FREE BETS</text>
        <text x="85" y="10" fill="rgba(200,168,60,0.5)" fontFamily="'Times New Roman',serif" fontSize="5.5" fontWeight="bold">POT OF GOLD</text>
        {[['7', '100 to 1'], ['6', '100 to 1'], ['5', '100 to 1'], ['4', '50 to 1'], ['3', '30 to 1'], ['2', '12 to 1'], ['1', '3 to 1']].map(([n, p], j) => (
          <g key={j}>
            <text x="6" y={22 + j * 10} fill="rgba(200,168,60,0.45)" fontFamily="'Times New Roman',serif" fontSize="6">{n}</text>
            <line x1="14" y1={19 + j * 10} x2="78" y2={19 + j * 10} stroke="rgba(200,168,60,0.15)" strokeWidth="0.5" strokeDasharray="2,2" />
            <text x="80" y={22 + j * 10} fill="rgba(200,168,60,0.45)" fontFamily="'Times New Roman',serif" fontSize="6">{p}</text>
          </g>
        ))}
      </g>

      {/* === FREE DOUBLES / FREE SPLITS text (bottom center) === */}
      <g transform="translate(400, 470)">
        <text x="-55" y="0" fill="url(#goldGrad)" fontFamily="'Times New Roman',serif" fontSize="13" fontWeight="bold" textAnchor="middle">FREE</text>
        <text x="-55" y="15" fill="url(#goldGrad)" fontFamily="'Times New Roman',serif" fontSize="13" fontWeight="bold" textAnchor="middle">DOUBLES</text>
        <text x="-55" y="26" fill="rgba(200,168,60,0.5)" fontFamily="'Times New Roman',serif" fontSize="7" textAnchor="middle">On Any Two-Card</text>
        <text x="-55" y="34" fill="rgba(200,168,60,0.5)" fontFamily="'Times New Roman',serif" fontSize="7" textAnchor="middle">Hard Total of 9, 10 or 11</text>

        <text x="55" y="0" fill="url(#goldGrad)" fontFamily="'Times New Roman',serif" fontSize="13" fontWeight="bold" textAnchor="middle">FREE</text>
        <text x="55" y="15" fill="url(#goldGrad)" fontFamily="'Times New Roman',serif" fontSize="13" fontWeight="bold" textAnchor="middle">SPLITS</text>
        <text x="55" y="26" fill="rgba(200,168,60,0.5)" fontFamily="'Times New Roman',serif" fontSize="7" textAnchor="middle">On All Pairs Except</text>
        <text x="55" y="34" fill="rgba(200,168,60,0.5)" fontFamily="'Times New Roman',serif" fontSize="7" textAnchor="middle">10-Value Cards</text>
      </g>
    </svg>
  );
}
