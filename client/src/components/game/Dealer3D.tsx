import { Suspense, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Ready Player Me avatar URL - female dealer character
const AVATAR_URL = 'https://models.readyplayer.me/6460d95f9ae7a45aef24e2d4.glb';

interface DealerProps {
  message?: string;
  isDealing?: boolean;
}

function DealerModel({ isDealing }: { isDealing?: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(AVATAR_URL);
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    // Play idle animation if available
    if (names.length > 0 && actions[names[0]]) {
      actions[names[0]]!.reset().fadeIn(0.5).play();
    }
  }, [actions, names]);

  // Gentle breathing/idle animation
  useFrame((state) => {
    if (group.current) {
      // Subtle breathing
      group.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.005 - 0.65;

      // Slight head movement when dealing
      if (isDealing) {
        group.current.rotation.y = Math.sin(state.clock.elapsedTime * 3) * 0.1;
      } else {
        group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      }
    }
  });

  return (
    <group ref={group} position={[0, -0.65, 0]} scale={[0.9, 0.9, 0.9]}>
      <primitive object={scene.clone()} />
    </group>
  );
}

function FallbackDealer() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
    }
  });

  return (
    <group>
      {/* Simple humanoid shape as fallback */}
      {/* Head */}
      <mesh ref={meshRef} position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#e8b89d" />
      </mesh>
      {/* Hair */}
      <mesh position={[0, 0.22, -0.02]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color="#2c1810" />
      </mesh>
      {/* Body */}
      <mesh position={[0, -0.1, 0]}>
        <capsuleGeometry args={[0.1, 0.2, 8, 16]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.04, 0.16, 0.1]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshStandardMaterial color="#2c1810" />
      </mesh>
      <mesh position={[0.04, 0.16, 0.1]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshStandardMaterial color="#2c1810" />
      </mesh>
    </group>
  );
}

// Web Speech API for dealer voice
function useDealerVoice() {
  const speak = useMemo(() => {
    return (text: string) => {
      if (!('speechSynthesis' in window)) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.2;
      utterance.volume = 0.7;

      // Try to find a female English voice
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(
        (v) => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Google UK English Female'))
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
    if (message && message !== lastMessage.current) {
      lastMessage.current = message;
      speak(message);
    }
  }, [message, speak]);

  return (
    <div className="relative flex flex-col items-center">
      {/* 3D Canvas */}
      <div className="w-32 h-36 rounded-lg overflow-hidden" style={{ background: 'transparent' }}>
        <Canvas
          camera={{ position: [0, 0.1, 0.6], fov: 40 }}
          style={{ background: 'transparent' }}
          gl={{ alpha: true, antialias: true }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[2, 3, 2]} intensity={1.2} />
          <directionalLight position={[-2, 1, -1]} intensity={0.3} color="#ffd700" />

          <Suspense fallback={<FallbackDealer />}>
            <DealerModel isDealing={isDealing} />
          </Suspense>
        </Canvas>
      </div>

      {/* Message bubble */}
      {message && (
        <div
          className="mt-1 px-3 py-1 rounded-full text-xs font-bold animate-pulse"
          style={{
            backgroundColor: 'rgba(255,215,0,0.15)',
            color: '#ffd700',
            border: '1px solid rgba(255,215,0,0.3)',
            boxShadow: '0 0 10px rgba(255,215,0,0.1)',
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}

// Preload the model
useGLTF.preload(AVATAR_URL);
