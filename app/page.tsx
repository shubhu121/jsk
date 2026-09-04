'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Film,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Camera,
  Gamepad2,
  Tv,
  HelpCircle,
  Heart,
  Share2,
} from 'lucide-react';
import { JanmashtamiCanvas } from '@/components/JanmashtamiCanvas';
import { TimelineController } from '@/components/TimelineController';
import { InteractiveGameController } from '@/components/InteractiveGameController';
import { FrameAnalysisDrawer } from '@/components/FrameAnalysisDrawer';
import { JanmashtamiGreetingCard } from '@/components/JanmashtamiGreetingCard';
import { festiveAudio } from '@/lib/audio';
import confetti from 'canvas-confetti';

const TOTAL_DURATION = 29.0; // Matching video 00:00 - 00:29

export default function JanmashtamiPage() {
  const [appMode, setAppMode] = useState<'video' | 'game'>('video');
  const [currentTime, setCurrentTime] = useState(0.0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [cameraMode, setCameraMode] = useState<'video' | 'orbit' | 'climber' | 'celebration'>('video');

  // Interactive Game State
  const [gameStep, setGameStep] = useState(0);

  // Frame Analysis Drawer
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [celebrationAlert, setCelebrationAlert] = useState(false);

  // Playback timer ref
  const lastTickRef = useRef<number>(0);

  // Master Timeline Animation Loop
  useEffect(() => {
    let animId: number;

    const tick = () => {
      const now = Date.now();
      const dt = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      if (isPlaying && appMode === 'video') {
        setCurrentTime((prev) => {
          const next = prev + dt * playbackRate;
          if (next >= TOTAL_DURATION) {
            // Loop smoothly back to start
            return 0.0;
          }
          return next;
        });
      }

      animId = requestAnimationFrame(tick);
    };

    lastTickRef.current = Date.now();
    animId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, playbackRate, appMode]);

  // Handle Pot Break callback from canvas
  const handlePotBroken = () => {
    setCelebrationAlert(true);
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.4 },
      colors: ['#F59E0B', '#EF4444', '#38BDF8', '#10B981', '#FEF08A'],
    });
    setTimeout(() => setCelebrationAlert(false), 4500);
  };

  const handlePlayPause = () => {
    if (!isPlaying) {
      festiveAudio.init();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  const handleReset = () => {
    setCurrentTime(0.0);
    setIsPlaying(true);
    festiveAudio.stopFestiveMusic();
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    festiveAudio.setMuted(nextMuted);
  };

  const handleGameReset = () => {
    setGameStep(0);
    festiveAudio.stopFestiveMusic();
  };

  return (
    <main
      className="min-h-screen bg-[#fafaf6] text-amber-950 flex flex-col font-sans selection:bg-amber-200 selection:text-amber-950"
      id="janmashtami-app-root"
    >
      {/* Top Festive Header Bar */}
      <header className="border-b border-amber-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Festival Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center text-white shadow-md shadow-amber-600/20 text-xl select-none">
              🦚
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-amber-950">
                  Janmashtami Dahi Handi
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-100 text-amber-800 border border-amber-300">
                  Three.js 3D WebGL
                </span>
              </div>
              <p className="text-xs text-amber-900/70 hidden sm:block">
                Frame-by-frame 3D recreation of the animated Govinda celebration
              </p>
            </div>
          </div>

          {/* Mode Switcher & Analysis Action */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-amber-100/70 p-1 rounded-2xl border border-amber-200/80 text-xs font-bold">
              <button
                id="mode-video-btn"
                onClick={() => {
                  setAppMode('video');
                  setIsPlaying(true);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition ${
                  appMode === 'video'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-amber-900 hover:bg-amber-200/60'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Video Story</span>
              </button>

              <button
                id="mode-game-btn"
                onClick={() => {
                  setAppMode('game');
                  setIsPlaying(false);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition ${
                  appMode === 'game'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-amber-900 hover:bg-amber-200/60'
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Playable Game</span>
              </button>
            </div>

            <button
              id="open-frame-analysis-btn"
              onClick={() => setShowAnalysis(true)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition shadow-xs"
              title="View detailed frame-by-frame breakdown of the source video"
            >
              <Film className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden md:inline">Frame Analysis</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto w-full p-4 lg:p-8 flex-1 flex flex-col space-y-6">
        {/* Celebration Banner Notification when broken */}
        {celebrationAlert && (
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center justify-between animate-bounce">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🍯</span>
              <span className="font-extrabold text-sm sm:text-base">
                GOVINDA AALA RE! Dahi Handi broken with joyful splashes!
              </span>
            </div>
            <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-xl">
              Happy Janmashtami! 🎉
            </span>
          </div>
        )}

        {/* 3D WebGL Canvas Stage */}
        <div className="relative rounded-3xl overflow-hidden border-2 border-amber-300/80 shadow-xl bg-white">
          <JanmashtamiCanvas
            currentTime={currentTime}
            isPlaying={isPlaying}
            cameraMode={cameraMode}
            onPotBroken={handlePotBroken}
            interactiveClimbStep={gameStep}
            isGameMode={appMode === 'game'}
          />

          {/* Quick HUD Overlay */}
          <div className="absolute top-4 left-4 pointer-events-none flex flex-col space-y-1">
            <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-amber-950 border border-amber-200/80 shadow-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {appMode === 'video'
                  ? `Timeline: ${currentTime.toFixed(1)}s / ${TOTAL_DURATION}s`
                  : `Game Step: ${gameStep + 1} / 4`}
              </span>
            </div>
          </div>

          {/* Mode Indicator Tag */}
          <div className="absolute top-4 right-4 pointer-events-none">
            <span className="bg-amber-600/90 text-white text-[11px] font-bold px-3 py-1 rounded-xl shadow-xs">
              {cameraMode === 'video'
                ? '🎬 Classic Video Perspective'
                : cameraMode === 'orbit'
                ? '🔄 Interactive 3D Orbit (Drag)'
                : cameraMode === 'climber'
                ? '🧗 Climber Focus'
                : '🥁 Celebration Dance'}
            </span>
          </div>
        </div>

        {/* Dynamic Mode Controller */}
        {appMode === 'video' ? (
          <TimelineController
            currentTime={currentTime}
            duration={TOTAL_DURATION}
            isPlaying={isPlaying}
            isMuted={isMuted}
            playbackRate={playbackRate}
            cameraMode={cameraMode}
            onPlayPause={handlePlayPause}
            onSeek={handleSeek}
            onToggleMute={handleToggleMute}
            onSetPlaybackRate={setPlaybackRate}
            onSetCameraMode={setCameraMode}
            onReset={handleReset}
          />
        ) : (
          <InteractiveGameController
            step={gameStep}
            onStepChange={setGameStep}
            onReset={handleGameReset}
          />
        )}

        {/* Lower Grid: Frame Story Journey & Blessing Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* 2-Column: Video Sequence Highlights */}
          <div className="lg:col-span-2 bg-white/95 backdrop-blur-md rounded-2xl border border-amber-200/80 p-5 shadow-lg shadow-amber-900/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Film className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-amber-950">
                  Video Story Arc & 3D WebGL Conversion
                </h3>
              </div>
              <button
                onClick={() => setShowAnalysis(true)}
                className="text-xs font-bold text-amber-700 hover:text-amber-900 underline"
              >
                Detailed Frame Specs →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  phase: '00:00 - 00:06',
                  title: '1. Toran & Gopalas Arrival',
                  desc: 'Mango leaves & flower garland swaying over the earthen curd pot; Gopalas sprint enthusiastically onto stage.',
                  color: 'border-amber-300 bg-amber-50/50',
                  actionTime: 2.5,
                },
                {
                  phase: '00:07 - 00:16',
                  title: '2. Govinda Pyramid Stacking',
                  desc: 'Rhythmic "Govinda! Govinda!" chanting to Dholak beats as base and middle tiers hoist Bal Gopal to the apex.',
                  color: 'border-amber-300 bg-amber-50/50',
                  actionTime: 7.0,
                },
                {
                  phase: '00:17 - 00:18',
                  title: '3. Handi Shatter & Splash',
                  desc: 'Pot breaks with flying terracotta fragments, cascading makhan droplets, golden petals, and crowd cheer.',
                  color: 'border-amber-300 bg-amber-50/50',
                  actionTime: 17.5,
                },
                {
                  phase: '00:19 - 00:29',
                  title: '4. Celebration, Dholak & Blessing',
                  desc: 'Joyful group dance, lively Dholak drumming, confetti rain, and glowing "Happy Janmashtami" greeting.',
                  color: 'border-amber-300 bg-amber-50/50',
                  actionTime: 19.5,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className={`p-3.5 rounded-xl border ${item.color} space-y-1.5 flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-800">
                      <span>{item.phase}</span>
                    </div>
                    <div className="text-xs font-bold text-amber-950">{item.title}</div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => {
                      setAppMode('video');
                      setCurrentTime(item.actionTime);
                    }}
                    className="mt-2 text-left text-[11px] font-bold text-amber-700 hover:text-amber-900 transition"
                  >
                    Play this scene ▶
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 1-Column: Personalized Janmashtami Blessing & Share */}
          <div className="lg:col-span-1">
            <JanmashtamiGreetingCard />
          </div>
        </div>
      </div>

      {/* Frame-by-Frame Modal */}
      <FrameAnalysisDrawer
        isOpen={showAnalysis}
        onClose={() => setShowAnalysis(false)}
        onJumpToTime={(t) => {
          setAppMode('video');
          setCurrentTime(t);
        }}
      />

      {/* Footer */}
      <footer className="border-t border-amber-200/80 bg-white/70 py-4 px-6 text-center text-xs text-amber-900/80">
        <p>
          Celebrating Shri Krishna Janmashtami with real-time 3D Three.js, WebGL, and Web Audio API.
          Radhe Radhe! 🙏🦚✨
        </p>
      </footer>
    </main>
  );
}
