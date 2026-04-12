import { motion } from 'framer-motion';

interface DealerProps {
  isDealing?: boolean;
  isWaiting?: boolean;
  message?: string;
}

export default function Dealer({ isDealing, isWaiting, message }: DealerProps) {
  return (
    <div className="relative flex flex-col items-center">
      {/* Dealer character */}
      <motion.svg
        width="120"
        height="140"
        viewBox="0 0 120 140"
        className="drop-shadow-lg"
        animate={isDealing ? { y: [0, -3, 0] } : isWaiting ? { y: [0, -2, 0] } : {}}
        transition={isDealing ? { duration: 0.5, repeat: Infinity } : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Body / Suit */}
        <rect x="30" y="70" width="60" height="55" rx="5" fill="#1a1a2e" />
        {/* White shirt collar */}
        <polygon points="50,70 60,85 70,70" fill="white" />
        {/* Bow tie */}
        <polygon points="54,78 60,82 66,78 66,84 60,80 54,84" fill="#c41e3a" />
        {/* Neck */}
        <rect x="52" y="58" width="16" height="15" rx="3" fill="#e8b89d" />
        {/* Head */}
        <ellipse cx="60" cy="42" rx="22" ry="24" fill="#e8b89d" />
        {/* Hair */}
        <ellipse cx="60" cy="28" rx="24" ry="14" fill="#2c1810" />
        <rect x="36" y="26" width="6" height="20" rx="3" fill="#2c1810" />
        <rect x="78" y="26" width="6" height="20" rx="3" fill="#2c1810" />
        {/* Eyes */}
        <motion.g
          animate={{ scaleY: [1, 1, 0.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 1] }}
        >
          <ellipse cx="50" cy="42" rx="3" ry="3.5" fill="#2c1810" />
          <ellipse cx="70" cy="42" rx="3" ry="3.5" fill="#2c1810" />
          {/* Eye shine */}
          <circle cx="51" cy="41" r="1" fill="white" />
          <circle cx="71" cy="41" r="1" fill="white" />
        </motion.g>
        {/* Eyebrows */}
        <line x1="45" y1="35" x2="55" y2="36" stroke="#2c1810" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="65" y1="36" x2="75" y2="35" stroke="#2c1810" strokeWidth="1.5" strokeLinecap="round" />
        {/* Nose */}
        <ellipse cx="60" cy="48" rx="2.5" ry="2" fill="#d4a088" />
        {/* Mouth - slight smile */}
        <motion.path
          d="M 53 54 Q 60 60 67 54"
          fill="none"
          stroke="#c4756a"
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={message ? { d: ['M 53 54 Q 60 60 67 54', 'M 53 56 Q 60 62 67 56', 'M 53 54 Q 60 60 67 54'] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {/* Lips */}
        <ellipse cx="60" cy="55" rx="5" ry="1.5" fill="#d4756a" opacity="0.5" />
        {/* Arms */}
        <motion.rect
          x="10" y="78" width="22" height="10" rx="5" fill="#1a1a2e"
          animate={isDealing ? { rotate: [0, -15, 0] } : {}}
          transition={{ duration: 0.5, repeat: isDealing ? Infinity : 0 }}
          style={{ originX: '30px', originY: '83px' }}
        />
        <motion.rect
          x="88" y="78" width="22" height="10" rx="5" fill="#1a1a2e"
          animate={isDealing ? { rotate: [0, 15, 0] } : {}}
          transition={{ duration: 0.5, repeat: isDealing ? Infinity : 0 }}
          style={{ originX: '90px', originY: '83px' }}
        />
        {/* Hands */}
        <circle cx="12" cy="83" r="6" fill="#e8b89d" />
        <circle cx="108" cy="83" r="6" fill="#e8b89d" />
        {/* Earrings */}
        <circle cx="38" cy="48" r="2" fill="#ffd700" />
        <circle cx="82" cy="48" r="2" fill="#ffd700" />
      </motion.svg>

      {/* Message bubble */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 px-3 py-1 rounded-full text-xs font-bold"
          style={{ backgroundColor: 'rgba(255,215,0,0.2)', color: '#ffd700', border: '1px solid rgba(255,215,0,0.3)' }}
        >
          {message}
        </motion.div>
      )}
    </div>
  );
}
