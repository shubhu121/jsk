'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { JanmashtamiCanvas } from '@/components/JanmashtamiCanvas';
import { festiveAudio } from '@/lib/audio';
import confetti from 'canvas-confetti';

const TOTAL_ANIMATION_TIME = 22.0;

export default function JanmashtamiPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0.0);
  const [isMuted, setIsMuted] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  // Playback timer ref
  const lastTickRef = useRef<number>(0);

  // Master Animation Loop
  useEffect(() => {
    let animId: number;

    const tick = () => {
      const now = Date.now();
      const dt = lastTickRef.current ? (now - lastTickRef.current) / 1000 : 0.016;
      lastTickRef.current = now;

      if (isPlaying) {
        setCurrentTime((prev) => {
          const next = prev + dt;
          if (next >= TOTAL_ANIMATION_TIME) {
            setHasCompleted(true);
            return TOTAL_ANIMATION_TIME;
          }
          return next;
        });
      }

      animId = requestAnimationFrame(tick);
    };

    lastTickRef.current = Date.now();
    animId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Handle Pot Broken callback from 3D scene
  const handlePotBroken = () => {
    confetti({
      particleCount: 140,
      spread: 100,
      origin: { y: 0.35 },
      colors: ['#f59e0b', '#ef4444', '#38bdf8', '#10b981', '#fef08a'],
    });
  };

  const handleStartAnimation = () => {
    festiveAudio.init();
    festiveAudio.setMuted(isMuted);
    festiveAudio.startFestiveMusic();

    setCurrentTime(0.01);
    setIsPlaying(true);
    setHasCompleted(false);
  };

  const handleRestart = () => {
    festiveAudio.init();
    festiveAudio.setMuted(isMuted);
    festiveAudio.stopFestiveMusic();
    festiveAudio.startFestiveMusic();

    setCurrentTime(0.01);
    setIsPlaying(true);
    setHasCompleted(false);
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    festiveAudio.setMuted(nextMuted);
  };

  return (
    <main
      className="w-screen h-screen overflow-hidden bg-[#fcfaf6] relative select-none"
      id="janmashtami-app"
    >
      {/* 3D WebGL Canvas Viewport */}
      <JanmashtamiCanvas
        currentTime={currentTime}
        isPlaying={isPlaying}
        onPotBroken={handlePotBroken}
        isMuted={isMuted}
      />

      {/* Top Right Sound Toggle */}
      <div className="absolute top-5 right-5 z-20">
        <button
          id="toggle-audio-btn"
          onClick={handleToggleMute}
          className="w-11 h-11 rounded-full bg-white/80 hover:bg-white backdrop-blur-md border border-amber-200/80 shadow-md flex items-center justify-center text-amber-900 transition-all hover:scale-105 active:scale-95"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Floating Centered Action Button */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3">
        {!isPlaying || hasCompleted ? (
          <button
            id="start-animation-btn"
            onClick={currentTime > 0 ? handleRestart : handleStartAnimation}
            className="group relative flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 text-white font-black text-lg tracking-wide shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            {currentTime > 0 ? (
              <>
                <RotateCcw className="w-6 h-6 transition-transform group-hover:-rotate-90 duration-300" />
                <span>Replay Animation</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 fill-white" />
                <span>Start Animation</span>
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              id="restart-animation-btn"
              onClick={handleRestart}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/90 hover:bg-white backdrop-blur-md border border-amber-200 text-amber-950 text-sm font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart</span>
            </button>
          </div>
        )}

        {/* Minimal 3D Hint */}
        <p className="text-[11px] font-medium tracking-wide text-amber-900/50 pointer-events-none">
          Click crowd & Gopalas to cheer • Drag to rotate • Scroll to zoom
        </p>
      </div>
    </main>
  );
}
