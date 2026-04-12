import { useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

interface DealerProps {
  message?: string;
  isDealing?: boolean;
}

// Web Speech API for dealer voice
function useDealerVoice() {
  const speak = useMemo(() => {
    return (text: string) => {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.15;
      utterance.volume = 0.7;

      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Female') ||
            v.name.includes('Samantha') ||
            v.name.includes('Victoria') ||
            v.name.includes('Zira') ||
            v.name.includes('Google UK English Female'))
      );
      if (femaleVoice) utterance.voice = femaleVoice;

      window.speechSynthesis.speak(utterance);
    };
  }, []);

  return speak;
}

export default function Dealer3D({ message, isDealing }: DealerProps) {
  const speak = useDealerVoice();
  const lastMessage = useRef('');

  useEffect(() => {
    // Preload voices
    window.speechSynthesis?.getVoices();
  }, []);

  useEffect(() => {
    if (message && message !== lastMessage.current) {
      lastMessage.current = message;
      // Small delay so voice sounds natural
      setTimeout(() => speak(message), 300);
    }
  }, [message, speak]);

  return (
    <div className="relative flex flex-col items-center">
      {/* Dealer character - detailed SVG */}
      <motion.svg
        width="140"
        height="160"
        viewBox="0 0 140 160"
        className="drop-shadow-2xl"
        animate={isDealing ? { y: [0, -3, 0] } : { y: [0, -1.5, 0] }}
        transition={isDealing ? { duration: 0.4, repeat: Infinity } : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Glow effect behind dealer */}
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffd700" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffd700" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="suitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2d2d4e" />
            <stop offset="100%" stopColor="#1a1a2e" />
          </linearGradient>
          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f0c4a8" />
            <stop offset="100%" stopColor="#e0a888" />
          </linearGradient>
          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3d2314" />
            <stop offset="100%" stopColor="#1a0e08" />
          </linearGradient>
        </defs>

        <ellipse cx="70" cy="80" rx="60" ry="70" fill="url(#glow)" />

        {/* Body / Suit jacket */}
        <path d="M 35 90 Q 35 85 45 82 L 55 80 L 70 88 L 85 80 L 95 82 Q 105 85 105 90 L 108 145 L 32 145 Z" fill="url(#suitGrad)" />

        {/* Suit lapels */}
        <path d="M 55 80 L 62 95 L 70 88 Z" fill="#3d3d5e" />
        <path d="M 85 80 L 78 95 L 70 88 Z" fill="#3d3d5e" />

        {/* White shirt / V-neck */}
        <path d="M 58 82 L 70 100 L 82 82 L 78 80 L 70 88 L 62 80 Z" fill="white" />

        {/* Bow tie */}
        <path d="M 62 86 L 66 82 L 66 90 Z" fill="#c41e3a" />
        <path d="M 78 86 L 74 82 L 74 90 Z" fill="#c41e3a" />
        <circle cx="70" cy="86" r="2.5" fill="#e74c3c" />

        {/* Neck */}
        <path d="M 60 68 L 60 82 Q 65 84 70 84 Q 75 84 80 82 L 80 68 Z" fill="url(#skinGrad)" />

        {/* Head shape */}
        <ellipse cx="70" cy="48" rx="24" ry="27" fill="url(#skinGrad)" />

        {/* Jaw line */}
        <path d="M 46 48 Q 48 72 70 75 Q 92 72 94 48" fill="url(#skinGrad)" />

        {/* Hair - long, dark, flowing */}
        <path d="M 42 40 Q 40 18 70 15 Q 100 18 98 40 L 100 55 Q 102 30 70 12 Q 38 30 40 55 Z" fill="url(#hairGrad)" />
        {/* Hair sides */}
        <path d="M 42 40 L 38 62 Q 40 55 42 45 Z" fill="url(#hairGrad)" />
        <path d="M 98 40 L 102 62 Q 100 55 98 45 Z" fill="url(#hairGrad)" />

        {/* Eyebrows */}
        <path d="M 53 37 Q 58 34 63 37" fill="none" stroke="#2c1810" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 77 37 Q 82 34 87 37" fill="none" stroke="#2c1810" strokeWidth="1.5" strokeLinecap="round" />

        {/* Eyes - with blinking */}
        <motion.g
          animate={{ scaleY: [1, 1, 0.05, 1, 1] }}
          transition={{ duration: 5, repeat: Infinity, times: [0, 0.85, 0.88, 0.91, 1] }}
        >
          {/* Eye whites */}
          <ellipse cx="58" cy="43" rx="5" ry="4" fill="white" />
          <ellipse cx="82" cy="43" rx="5" ry="4" fill="white" />
          {/* Iris */}
          <ellipse cx="58" cy="43.5" rx="3" ry="3.5" fill="#4a3520" />
          <ellipse cx="82" cy="43.5" rx="3" ry="3.5" fill="#4a3520" />
          {/* Pupil */}
          <circle cx="58" cy="43.5" r="1.8" fill="#1a0e08" />
          <circle cx="82" cy="43.5" r="1.8" fill="#1a0e08" />
          {/* Eye shine */}
          <circle cx="59.5" cy="42" r="1.2" fill="white" opacity="0.9" />
          <circle cx="83.5" cy="42" r="1.2" fill="white" opacity="0.9" />
          {/* Eyelashes */}
          <path d="M 53 40 Q 55 38 58 39" fill="none" stroke="#1a0e08" strokeWidth="0.8" />
          <path d="M 63 40 Q 61 38 58 39" fill="none" stroke="#1a0e08" strokeWidth="0.8" />
          <path d="M 77 40 Q 79 38 82 39" fill="none" stroke="#1a0e08" strokeWidth="0.8" />
          <path d="M 87 40 Q 85 38 82 39" fill="none" stroke="#1a0e08" strokeWidth="0.8" />
        </motion.g>

        {/* Nose */}
        <path d="M 70 46 L 67 54 Q 70 56 73 54 Z" fill="#dda08a" opacity="0.6" />

        {/* Mouth */}
        <motion.g
          animate={message ? { scaleY: [1, 1.15, 0.9, 1.1, 1] } : {}}
          transition={{ duration: 0.8, repeat: message ? Infinity : 0 }}
          style={{ transformOrigin: '70px 60px' }}
        >
          {/* Lips */}
          <path d="M 62 59 Q 66 57 70 58 Q 74 57 78 59 Q 74 62 70 62 Q 66 62 62 59 Z" fill="#d4616a" />
          {/* Upper lip highlight */}
          <path d="M 66 58 Q 70 56 74 58" fill="none" stroke="#e07080" strokeWidth="0.5" />
        </motion.g>

        {/* Blush */}
        <circle cx="50" cy="55" r="5" fill="#e8a090" opacity="0.3" />
        <circle cx="90" cy="55" r="5" fill="#e8a090" opacity="0.3" />

        {/* Earrings */}
        <motion.circle
          cx="44" cy="52" r="2.5" fill="#ffd700"
          animate={{ y: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.circle
          cx="96" cy="52" r="2.5" fill="#ffd700"
          animate={{ y: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        />

        {/* Arms */}
        <motion.path
          d="M 35 90 Q 20 95 15 105 Q 12 110 18 112"
          fill="none" stroke="url(#suitGrad)" strokeWidth="12" strokeLinecap="round"
          animate={isDealing ? { d: ['M 35 90 Q 20 95 15 105 Q 12 110 18 112', 'M 35 90 Q 25 90 30 98 Q 35 105 40 105', 'M 35 90 Q 20 95 15 105 Q 12 110 18 112'] } : {}}
          transition={{ duration: 0.6, repeat: isDealing ? Infinity : 0 }}
        />
        <motion.path
          d="M 105 90 Q 120 95 125 105 Q 128 110 122 112"
          fill="none" stroke="url(#suitGrad)" strokeWidth="12" strokeLinecap="round"
          animate={isDealing ? { d: ['M 105 90 Q 120 95 125 105 Q 128 110 122 112', 'M 105 90 Q 115 90 110 98 Q 105 105 100 105', 'M 105 90 Q 120 95 125 105 Q 128 110 122 112'] } : {}}
          transition={{ duration: 0.6, repeat: isDealing ? Infinity : 0, delay: 0.3 }}
        />

        {/* Hands */}
        <motion.circle cx="18" cy="112" r="6" fill="url(#skinGrad)"
          animate={isDealing ? { cx: [18, 40, 18], cy: [112, 105, 112] } : {}}
          transition={{ duration: 0.6, repeat: isDealing ? Infinity : 0 }}
        />
        <motion.circle cx="122" cy="112" r="6" fill="url(#skinGrad)"
          animate={isDealing ? { cx: [122, 100, 122], cy: [112, 105, 112] } : {}}
          transition={{ duration: 0.6, repeat: isDealing ? Infinity : 0, delay: 0.3 }}
        />

        {/* Name badge */}
        <rect x="58" y="96" width="24" height="8" rx="2" fill="#ffd700" opacity="0.8" />
        <text x="70" y="103" textAnchor="middle" fontSize="5" fill="#1a1a2e" fontWeight="bold">DEALER</text>
      </motion.svg>

      {/* Message bubble */}
      {message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="mt-1 px-4 py-1.5 rounded-full text-xs font-bold"
          style={{
            background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,215,0,0.1))',
            color: '#ffd700',
            border: '1px solid rgba(255,215,0,0.3)',
            boxShadow: '0 0 15px rgba(255,215,0,0.15)',
          }}
        >
          {message}
        </motion.div>
      )}
    </div>
  );
}
