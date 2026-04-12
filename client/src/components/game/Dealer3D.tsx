import { useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

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

export default function Dealer3D({ message, isDealing }: DealerProps) {
  const speak = useDealerVoice();
  const lastMessage = useRef('');

  useEffect(() => {
    window.speechSynthesis?.getVoices();
  }, []);

  useEffect(() => {
    if (message && message !== lastMessage.current) {
      lastMessage.current = message;
      setTimeout(() => speak(message), 300);
    }
  }, [message, speak]);

  return (
    <div className="relative flex flex-col items-center">
      {/* Dealer image with animations */}
      <motion.div
        className="relative overflow-hidden rounded-xl"
        style={{
          width: '200px',
          height: '120px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.6), 0 0 20px rgba(255,215,0,0.15)',
          border: '2px solid rgba(255,215,0,0.2)',
        }}
        animate={
          isDealing
            ? { scale: [1, 1.02, 1], y: [0, -2, 0] }
            : { y: [0, -1, 0] }
        }
        transition={
          isDealing
            ? { duration: 0.5, repeat: Infinity }
            : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        {/* Vignette overlay */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
          }}
        />

        {/* Dealer image */}
        <img
          src="/dealer.png"
          alt="Dealer"
          className="w-full h-full object-cover object-top"
          style={{ filter: 'brightness(1.05) contrast(1.05)' }}
        />

        {/* Gold border glow */}
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            boxShadow: 'inset 0 0 15px rgba(255,215,0,0.1)',
            border: '1px solid rgba(255,215,0,0.15)',
            borderRadius: '12px',
          }}
        />
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
