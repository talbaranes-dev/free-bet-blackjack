import { useRef, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';

interface DealerProps {
  message?: string;
  isDealing?: boolean;
}

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
          (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Zira') || v.name.includes('Google UK English Female'))
      );
      if (femaleVoice) utterance.voice = femaleVoice;
      window.speechSynthesis.speak(utterance);
    };
  }, []);
  return speak;
}

// Lottie animation URLs - free character animations
const ANIMATION_URLS = [
  'https://lottie.host/0ef2bce1-847c-48b7-8b8c-5e3b84a2fe58/mDLkBuGSKo.json', // woman presenting
  'https://lottie.host/bc613398-18a9-4cc4-8bd8-a381a8e4c96e/M9cRGlJyDB.json', // business woman
  'https://lottie.host/a6fd23d3-0a0f-4664-81d0-8fb4f823c04d/gDePmG0n0B.json', // woman standing
];

export default function Dealer3D({ message, isDealing }: DealerProps) {
  const speak = useDealerVoice();
  const lastMessage = useRef('');
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    window.speechSynthesis?.getVoices();

    // Try loading animation from multiple URLs
    async function loadAnimation() {
      for (const url of ANIMATION_URLS) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const contentType = res.headers.get('content-type') || '';
            if (contentType.includes('json')) {
              const data = await res.json();
              if (data.v) { // Valid Lottie JSON has a "v" (version) field
                setAnimationData(data);
                return;
              }
            }
          }
        } catch {
          // Try next URL
        }
      }
    }

    loadAnimation();
  }, []);

  useEffect(() => {
    if (message && message !== lastMessage.current) {
      lastMessage.current = message;
      setTimeout(() => speak(message), 300);
    }
  }, [message, speak]);

  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        className="relative overflow-hidden rounded-xl"
        style={{
          width: '160px',
          height: '160px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.6), 0 0 20px rgba(255,215,0,0.15)',
          border: '2px solid rgba(255,215,0,0.2)',
          background: 'radial-gradient(ellipse at center, #1a1a3e 0%, #0a0a1a 100%)',
        }}
        animate={isDealing ? { scale: [1, 1.03, 1] } : {}}
        transition={{ duration: 0.5, repeat: isDealing ? Infinity : 0 }}
      >
        {animationData ? (
          <Lottie
            animationData={animationData}
            loop
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          /* Fallback: animated dealer image */
          <>
            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)' }}
            />
            <motion.img
              src="/dealer.png"
              alt="Dealer"
              className="w-full h-full object-cover object-top"
              style={{ filter: 'brightness(1.05) contrast(1.05)' }}
              animate={{ scale: [1, 1.02, 1], y: [0, -1, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}
      </motion.div>

      {/* Message bubble */}
      {message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="mt-2 px-4 py-1.5 rounded-full text-xs font-bold"
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
